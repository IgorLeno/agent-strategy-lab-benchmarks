package pipeline

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"stream/internal/event"
)

// DefaultBufferSize is the read buffer used when the caller does not choose one.
const DefaultBufferSize = 64 * 1024

// MinBufferSize is the smallest buffer the CLI accepts.
const MinBufferSize = 1024

// Options configures one run.
type Options struct {
	InputPath  string
	OutDir     string
	BufferSize int
}

// Result is what a run produced.
type Result struct {
	Summary Summary
}

type accumulator struct {
	byCategory map[string]*CategoryTotal
	byStatus   map[string]*StatusTotal
	byCustomer map[string]*CustomerTotal
	total      int64
	first      time.Time
	last       time.Time
	haveRange  bool
}

func newAccumulator() *accumulator {
	return &accumulator{
		byCategory: map[string]*CategoryTotal{},
		byStatus:   map[string]*StatusTotal{},
		byCustomer: map[string]*CustomerTotal{},
	}
}

func (a *accumulator) add(e event.Event) {
	a.total += e.Amount

	category, ok := a.byCategory[e.Category]
	if !ok {
		category = &CategoryTotal{Category: e.Category}
		a.byCategory[e.Category] = category
	}
	category.Count++
	category.Amount += e.Amount

	status, ok := a.byStatus[e.Status]
	if !ok {
		status = &StatusTotal{Status: e.Status}
		a.byStatus[e.Status] = status
	}
	status.Count++
	status.Amount += e.Amount

	customer, ok := a.byCustomer[e.CustomerID]
	if !ok {
		customer = &CustomerTotal{CustomerID: e.CustomerID}
		a.byCustomer[e.CustomerID] = customer
	}
	customer.Count++
	customer.Amount += e.Amount

	if !a.haveRange {
		a.first, a.last, a.haveRange = e.Timestamp, e.Timestamp, true
		return
	}
	if e.Timestamp.Before(a.first) {
		a.first = e.Timestamp
	}
	if e.Timestamp.After(a.last) {
		a.last = e.Timestamp
	}
}

// Run processes the input file and writes summary.json and rejects.jsonl into
// the output directory.
func Run(options Options) (Result, error) {
	if options.BufferSize == 0 {
		options.BufferSize = DefaultBufferSize
	}

	handle, err := os.Open(options.InputPath)
	if err != nil {
		return Result{}, fmt.Errorf("cannot read input: %w", err)
	}
	defer handle.Close()

	blob, err := io.ReadAll(handle)
	if err != nil {
		return Result{}, fmt.Errorf("cannot read input: %w", err)
	}

	if err := os.MkdirAll(options.OutDir, 0o755); err != nil {
		return Result{}, fmt.Errorf("cannot create output directory: %w", err)
	}

	rejectsFile, err := os.Create(filepath.Join(options.OutDir, "rejects.jsonl"))
	if err != nil {
		return Result{}, fmt.Errorf("cannot write rejects: %w", err)
	}
	defer rejectsFile.Close()

	accumulated := newAccumulator()
	summary := Summary{
		Input: InputSummary{Path: filepath.Base(options.InputPath)},
	}

	for index, raw := range strings.Split(string(blob), "\n") {
		lineNumber := int64(index + 1)
		if strings.TrimSpace(raw) == "" {
			summary.Input.BlankLines++
			summary.Input.LinesRead++
			continue
		}
		summary.Input.LinesRead++

		parsed, parseErr := event.Parse([]byte(raw))
		if parseErr != nil {
			reason, _ := event.ReasonOf(parseErr)
			summary.Events.Rejected++
			encoded, _ := json.Marshal(Reject{
				Line:   lineNumber,
				Reason: string(reason),
				Raw:    raw,
			})
			if _, err := rejectsFile.Write(append(encoded, '\n')); err != nil {
				return Result{}, fmt.Errorf("cannot write rejects: %w", err)
			}
			continue
		}

		summary.Events.Accepted++
		accumulated.add(parsed)
	}

	summary.Totals.Amount = accumulated.total
	for _, category := range accumulated.byCategory {
		summary.Totals.ByCategory = append(summary.Totals.ByCategory, *category)
	}
	for _, status := range accumulated.byStatus {
		summary.Totals.ByStatus = append(summary.Totals.ByStatus, *status)
	}
	summary.Customers.Unique = int64(len(accumulated.byCustomer))
	for _, customer := range accumulated.byCustomer {
		if int64(len(summary.Customers.Top)) >= TopCustomers {
			break
		}
		summary.Customers.Top = append(summary.Customers.Top, *customer)
	}
	if accumulated.haveRange {
		first := event.FormatTime(accumulated.first)
		last := event.FormatTime(accumulated.last)
		summary.TimeRange.First = &first
		summary.TimeRange.Last = &last
	}

	encoded, err := json.MarshalIndent(summary, "", "  ")
	if err != nil {
		return Result{}, fmt.Errorf("cannot encode summary: %w", err)
	}
	summaryPath := filepath.Join(options.OutDir, "summary.json")
	if err := os.WriteFile(summaryPath, append(encoded, '\n'), 0o644); err != nil {
		return Result{}, fmt.Errorf("cannot write summary: %w", err)
	}

	return Result{Summary: summary}, nil
}
