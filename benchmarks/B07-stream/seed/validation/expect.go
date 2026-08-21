package main

// Independent recomputation of the STREAM contract.
//
// This code exists so the validator never has to trust the candidate's own
// output. It is deliberately simple and in-memory: it is a specification
// oracle, not an acceptable implementation of the task, which must stream.

import (
	"encoding/json"
	"math"
	"sort"
	"strings"
	"time"
)

const (
	maxLineBytes  = 1 << 20
	maxAbsAmount  = 10_000_000
	maxEventIDLen = 64
	topCustomers  = 10
	rawMaxBytes   = 1024
)

var categories = []string{"adjustment", "purchase", "refund", "subscription"}
var statuses = []string{"failed", "pending", "settled"}
var requiredFields = []string{
	"event_id", "customer_id", "timestamp", "category", "amount", "status",
}

type categoryTotal struct {
	Category string `json:"category"`
	Count    int64  `json:"count"`
	Amount   int64  `json:"amount"`
}

type statusTotal struct {
	Status string `json:"status"`
	Count  int64  `json:"count"`
	Amount int64  `json:"amount"`
}

type customerTotal struct {
	CustomerID string `json:"customer_id"`
	Count      int64  `json:"count"`
	Amount     int64  `json:"amount"`
}

type inputSummary struct {
	Path       string `json:"path"`
	LinesRead  int64  `json:"lines_read"`
	BlankLines int64  `json:"blank_lines"`
}

type eventSummary struct {
	Accepted   int64 `json:"accepted"`
	Rejected   int64 `json:"rejected"`
	Duplicates int64 `json:"duplicates"`
}

type totals struct {
	Amount     int64           `json:"amount"`
	ByCategory []categoryTotal `json:"by_category"`
	ByStatus   []statusTotal   `json:"by_status"`
}

type customers struct {
	Unique int64           `json:"unique"`
	Top    []customerTotal `json:"top"`
}

type timeRange struct {
	First *string `json:"first"`
	Last  *string `json:"last"`
}

type summary struct {
	Input     inputSummary `json:"input"`
	Events    eventSummary `json:"events"`
	Totals    totals       `json:"totals"`
	Customers customers    `json:"customers"`
	TimeRange timeRange    `json:"time_range"`
}

type rejectRow struct {
	Line   int64  `json:"line"`
	Reason string `json:"reason"`
	Raw    string `json:"raw"`
}

type expectation struct {
	Summary     summary
	Rejects     []rejectRow
	SummaryText string
	RejectsText string
}

func truncateRaw(line string) string {
	if len(line) > rawMaxBytes {
		return line[:rawMaxBytes]
	}
	return line
}

func has(values []string, want string) bool {
	for _, value := range values {
		if value == want {
			return true
		}
	}
	return false
}

// classify returns the rejection reason for a line, or "" when it is acceptable.
func classify(line string, seen map[string]bool) (string, string, string, int64, time.Time, string) {
	if len(line) > maxLineBytes {
		return "line_too_long", "", "", 0, time.Time{}, ""
	}

	var raw map[string]json.RawMessage
	if err := json.Unmarshal([]byte(line), &raw); err != nil {
		return "malformed_json", "", "", 0, time.Time{}, ""
	}

	for _, field := range requiredFields {
		value, ok := raw[field]
		if !ok || string(value) == "null" {
			return "missing_field:" + field, "", "", 0, time.Time{}, ""
		}
	}

	var eventID string
	if err := json.Unmarshal(raw["event_id"], &eventID); err != nil ||
		eventID == "" || len(eventID) > maxEventIDLen {
		return "invalid_field:event_id", "", "", 0, time.Time{}, ""
	}

	var customerID string
	if err := json.Unmarshal(raw["customer_id"], &customerID); err != nil || customerID == "" {
		return "invalid_field:customer_id", "", "", 0, time.Time{}, ""
	}

	var stamp string
	if err := json.Unmarshal(raw["timestamp"], &stamp); err != nil {
		return "invalid_field:timestamp", "", "", 0, time.Time{}, ""
	}
	moment, err := time.Parse(time.RFC3339, stamp)
	if err != nil {
		return "invalid_field:timestamp", "", "", 0, time.Time{}, ""
	}

	var category string
	if err := json.Unmarshal(raw["category"], &category); err != nil || !has(categories, category) {
		return "invalid_field:category", "", "", 0, time.Time{}, ""
	}

	var amount float64
	if err := json.Unmarshal(raw["amount"], &amount); err != nil {
		return "invalid_field:amount", "", "", 0, time.Time{}, ""
	}
	if math.IsNaN(amount) || math.IsInf(amount, 0) || amount != math.Trunc(amount) {
		return "invalid_field:amount", "", "", 0, time.Time{}, ""
	}
	cents := int64(amount)
	if cents > maxAbsAmount || cents < -maxAbsAmount {
		return "invalid_field:amount", "", "", 0, time.Time{}, ""
	}
	switch category {
	case "purchase", "subscription":
		if cents <= 0 {
			return "invalid_field:amount", "", "", 0, time.Time{}, ""
		}
	case "refund":
		if cents >= 0 {
			return "invalid_field:amount", "", "", 0, time.Time{}, ""
		}
	}

	var status string
	if err := json.Unmarshal(raw["status"], &status); err != nil || !has(statuses, status) {
		return "invalid_field:status", "", "", 0, time.Time{}, ""
	}

	if seen[eventID] {
		return "duplicate_event_id", "", "", 0, time.Time{}, ""
	}

	return "", eventID, customerID, cents, moment.UTC(), category + "\x00" + status
}

// expect computes the exact outputs the contract requires for one input file.
func expect(basename string, content []byte) expectation {
	result := expectation{Summary: summary{Input: inputSummary{Path: basename}}}

	text := string(content)
	text = strings.TrimSuffix(text, "\n")
	var lines []string
	if text != "" {
		lines = strings.Split(text, "\n")
	}

	seen := map[string]bool{}
	byCategory := map[string]*categoryTotal{}
	byStatus := map[string]*statusTotal{}
	byCustomer := map[string]*customerTotal{}
	var first, last time.Time
	haveRange := false

	for index, line := range lines {
		lineNumber := int64(index + 1)
		result.Summary.Input.LinesRead++
		if strings.TrimSpace(line) == "" {
			result.Summary.Input.BlankLines++
			continue
		}

		reason, eventID, customerID, cents, moment, classification := classify(line, seen)
		if reason != "" {
			result.Summary.Events.Rejected++
			if reason == "duplicate_event_id" {
				result.Summary.Events.Duplicates++
			}
			result.Rejects = append(result.Rejects, rejectRow{
				Line: lineNumber, Reason: reason, Raw: truncateRaw(line),
			})
			continue
		}

		seen[eventID] = true
		result.Summary.Events.Accepted++
		result.Summary.Totals.Amount += cents

		parts := strings.SplitN(classification, "\x00", 2)
		category, status := parts[0], parts[1]

		if _, ok := byCategory[category]; !ok {
			byCategory[category] = &categoryTotal{Category: category}
		}
		byCategory[category].Count++
		byCategory[category].Amount += cents

		if _, ok := byStatus[status]; !ok {
			byStatus[status] = &statusTotal{Status: status}
		}
		byStatus[status].Count++
		byStatus[status].Amount += cents

		if _, ok := byCustomer[customerID]; !ok {
			byCustomer[customerID] = &customerTotal{CustomerID: customerID}
		}
		byCustomer[customerID].Count++
		byCustomer[customerID].Amount += cents

		if !haveRange {
			first, last, haveRange = moment, moment, true
		} else {
			if moment.Before(first) {
				first = moment
			}
			if moment.After(last) {
				last = moment
			}
		}
	}

	for _, category := range categories {
		row := categoryTotal{Category: category}
		if found, ok := byCategory[category]; ok {
			row = *found
		}
		result.Summary.Totals.ByCategory = append(result.Summary.Totals.ByCategory, row)
	}
	for _, status := range statuses {
		row := statusTotal{Status: status}
		if found, ok := byStatus[status]; ok {
			row = *found
		}
		result.Summary.Totals.ByStatus = append(result.Summary.Totals.ByStatus, row)
	}

	result.Summary.Customers.Unique = int64(len(byCustomer))
	ranked := make([]customerTotal, 0, len(byCustomer))
	for _, row := range byCustomer {
		ranked = append(ranked, *row)
	}
	sort.Slice(ranked, func(i, j int) bool {
		if ranked[i].Count != ranked[j].Count {
			return ranked[i].Count > ranked[j].Count
		}
		return ranked[i].CustomerID < ranked[j].CustomerID
	})
	if len(ranked) > topCustomers {
		ranked = ranked[:topCustomers]
	}
	result.Summary.Customers.Top = ranked
	if result.Summary.Customers.Top == nil {
		result.Summary.Customers.Top = []customerTotal{}
	}

	if haveRange {
		firstText := first.Format(time.RFC3339)
		lastText := last.Format(time.RFC3339)
		result.Summary.TimeRange.First = &firstText
		result.Summary.TimeRange.Last = &lastText
	}

	encoded, _ := json.MarshalIndent(result.Summary, "", "  ")
	result.SummaryText = string(encoded) + "\n"

	var builder strings.Builder
	for _, row := range result.Rejects {
		line, _ := json.Marshal(row)
		builder.Write(line)
		builder.WriteByte('\n')
	}
	result.RejectsText = builder.String()

	return result
}
