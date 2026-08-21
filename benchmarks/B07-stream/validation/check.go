// Command check is the external validator for B07 STREAM.
//
// It builds the candidate CLI, drives it over frozen and generated fixtures,
// recomputes every expected output itself, and measures peak resident memory
// and wall time on a large deterministic fixture.
//
// Usage: go run ./validation [--report PATH] [--verbose]
//
// Exit code 0 means every check passed.
package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"syscall"
	"time"
)

// Frozen performance envelope. See TASK.md section 7.
const (
	LargeFixtureEvents = 400_000
	SmallFixtureEvents = 2_000

	// MemoryBudgetBytes is the peak resident memory allowed while processing
	// the large fixture. See TASK.md section 7 for the measurement method.
	MemoryBudgetBytes = 128 << 20

	// RuntimeBudget is deliberately generous: it separates a pathological
	// implementation from a reasonable one without turning machine noise into
	// a failure.
	RuntimeBudget = 60 * time.Second

	// GrowthFractionLimit caps how much peak memory may grow per byte of extra
	// input. At 1.0, an implementation that holds the whole file fails and one
	// that only keeps per-event state passes.
	GrowthFractionLimit = 1.0
)

var networkImport = regexp.MustCompile(
	`"(net|net/http|net/url|net/rpc|crypto/tls|os/exec)"|"github\.com/|"golang\.org/x/net`)

type result struct {
	Group  string `json:"group"`
	Name   string `json:"name"`
	Status string `json:"status"`
	Detail string `json:"detail"`
}

var results []result
var verbose bool

func record(group, name string, err error) {
	status, detail := "PASS", ""
	if err != nil {
		status = "FAIL"
		detail = strings.SplitN(err.Error(), "\n", 2)[0]
	}
	results = append(results, result{Group: group, Name: name, Status: status, Detail: detail})
}

func check(group, name string, fn func() error) {
	record(group, name, fn())
}

func fail(format string, args ...any) error {
	return fmt.Errorf(format, args...)
}

// ----------------------------------------------------------------------
// running the candidate
// ----------------------------------------------------------------------
type run struct {
	Summary  string
	Rejects  string
	Stdout   string
	Stderr   string
	ExitCode int
	MaxRSS   int64
	Elapsed  time.Duration
}

func runCLI(binary string, args ...string) (run, error) {
	command := exec.Command(binary, args...)
	var stdout, stderr strings.Builder
	command.Stdout = &stdout
	command.Stderr = &stderr

	started := time.Now()
	err := command.Run()
	elapsed := time.Since(started)

	outcome := run{Stdout: stdout.String(), Stderr: stderr.String(), Elapsed: elapsed}
	if command.ProcessState != nil {
		outcome.ExitCode = command.ProcessState.ExitCode()
		if usage, ok := command.ProcessState.SysUsage().(*syscall.Rusage); ok {
			outcome.MaxRSS = usage.Maxrss * 1024
		}
	} else if err != nil {
		return outcome, fail("cannot run the candidate binary: %v", err)
	}
	return outcome, nil
}

func process(binary, input, outDir string, extra ...string) (run, error) {
	args := append([]string{"process", "--input", input, "--outdir", outDir}, extra...)
	outcome, err := runCLI(binary, args...)
	if err != nil {
		return outcome, err
	}
	if outcome.ExitCode != 0 {
		return outcome, fail("process exited %d: %s", outcome.ExitCode, strings.TrimSpace(outcome.Stderr))
	}
	summary, err := os.ReadFile(filepath.Join(outDir, "summary.json"))
	if err != nil {
		return outcome, fail("summary.json was not written: %v", err)
	}
	rejects, err := os.ReadFile(filepath.Join(outDir, "rejects.jsonl"))
	if err != nil {
		return outcome, fail("rejects.jsonl was not written: %v", err)
	}
	outcome.Summary = string(summary)
	outcome.Rejects = string(rejects)
	return outcome, nil
}

func compare(label string, outcome run, want expectation) error {
	if outcome.Summary != want.SummaryText {
		return fail("%s: summary.json differs\n  want %s\n  got  %s",
			label, digest(want.SummaryText), digest(outcome.Summary))
	}
	if outcome.Rejects != want.RejectsText {
		return fail("%s: rejects.jsonl differs\n  want %s\n  got  %s",
			label, digest(want.RejectsText), digest(outcome.Rejects))
	}
	return nil
}

func digest(text string) string {
	sum := sha256.Sum256([]byte(text))
	return hex.EncodeToString(sum[:8])
}

func writeFixture(dir, name string, content []byte) (string, error) {
	path := filepath.Join(dir, name)
	if err := os.WriteFile(path, content, 0o644); err != nil {
		return "", fail("cannot write fixture %s: %v", name, err)
	}
	return path, nil
}

// ----------------------------------------------------------------------
// checks
// ----------------------------------------------------------------------
func checkEnvironment(root string) {
	check("environment", "no-network-usage", func() error {
		var offenders []string
		for _, dir := range []string{"cmd", "internal"} {
			base := filepath.Join(root, dir)
			if _, err := os.Stat(base); err != nil {
				continue
			}
			err := filepath.Walk(base, func(path string, info os.FileInfo, err error) error {
				if err != nil || info.IsDir() || !strings.HasSuffix(path, ".go") {
					return err
				}
				body, readErr := os.ReadFile(path)
				if readErr != nil {
					return readErr
				}
				if networkImport.Match(body) {
					relative, _ := filepath.Rel(root, path)
					offenders = append(offenders, relative)
				}
				return nil
			})
			if err != nil {
				return err
			}
		}
		if len(offenders) > 0 {
			return fail("network or external imports found in %s", strings.Join(offenders, ", "))
		}
		return nil
	})

	check("environment", "no-external-modules", func() error {
		body, err := os.ReadFile(filepath.Join(root, "go.mod"))
		if err != nil {
			return fail("cannot read go.mod: %v", err)
		}
		if strings.Contains(string(body), "require") {
			return fail("go.mod declares a dependency; this benchmark is standard library only")
		}
		if _, err := os.Stat(filepath.Join(root, "go.sum")); err == nil {
			return fail("go.sum exists; this benchmark is standard library only")
		}
		return nil
	})

	check("environment", "protected-files-untouched", func() error {
		listing := filepath.Join(root, "validation", "PROTECTED.sha256")
		body, err := os.ReadFile(listing)
		if err != nil {
			return fail("validation/PROTECTED.sha256 is missing")
		}
		recorded := map[string]bool{}
		var problems []string
		for _, line := range strings.Split(string(body), "\n") {
			trimmed := strings.TrimSpace(line)
			if trimmed == "" || strings.HasPrefix(trimmed, "#") {
				continue
			}
			parts := strings.Fields(trimmed)
			if len(parts) != 2 {
				continue
			}
			recorded[parts[1]] = true
			content, readErr := os.ReadFile(filepath.Join(root, parts[1]))
			if readErr != nil {
				problems = append(problems, parts[1]+": missing")
				continue
			}
			sum := sha256.Sum256(content)
			if hex.EncodeToString(sum[:]) != parts[0] {
				problems = append(problems, parts[1]+": modified")
			}
		}
		entries, err := os.ReadDir(filepath.Join(root, "validation"))
		if err != nil {
			return fail("cannot read validation/: %v", err)
		}
		for _, entry := range entries {
			if entry.IsDir() || entry.Name() == "PROTECTED.sha256" {
				continue
			}
			if !recorded["validation/"+entry.Name()] {
				problems = append(problems, "validation/"+entry.Name()+": added")
			}
		}
		if len(problems) > 0 {
			return fail("protected files changed: %s", strings.Join(problems, "; "))
		}
		return nil
	})

	check("environment", "repository-tests-pass", func() error {
		command := exec.Command("go", "test", "./...")
		command.Dir = root
		output, err := command.CombinedOutput()
		if err != nil {
			lines := strings.Split(strings.TrimSpace(string(output)), "\n")
			return fail("go test ./... failed: %s", lines[len(lines)-1])
		}
		return nil
	})
}

type fixture struct {
	Name    string
	Content []byte
}

func frozenFixtures(dir string) ([]fixture, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	var out []fixture
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".jsonl") {
			continue
		}
		body, err := os.ReadFile(filepath.Join(dir, entry.Name()))
		if err != nil {
			return nil, err
		}
		out = append(out, fixture{Name: entry.Name(), Content: body})
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Name < out[j].Name })
	return out, nil
}

func checkCorrectness(binary, workDir string, fixtures []fixture) {
	for _, item := range fixtures {
		item := item
		check("correctness", "fixture["+item.Name+"]", func() error {
			dir, err := os.MkdirTemp(workDir, "case-")
			if err != nil {
				return err
			}
			input, err := writeFixture(dir, item.Name, item.Content)
			if err != nil {
				return err
			}
			outcome, err := process(binary, input, filepath.Join(dir, "out"))
			if err != nil {
				return err
			}
			return compare(item.Name, outcome, expect(item.Name, item.Content))
		})
	}

	check("correctness", "stdout-line", func() error {
		dir, err := os.MkdirTemp(workDir, "stdout-")
		if err != nil {
			return err
		}
		content := fixtures[0].Content
		input, err := writeFixture(dir, fixtures[0].Name, content)
		if err != nil {
			return err
		}
		outcome, err := process(binary, input, filepath.Join(dir, "out"))
		if err != nil {
			return err
		}
		want := expect(fixtures[0].Name, content).Summary
		expected := fmt.Sprintf("processed %d lines: %d accepted, %d rejected\n",
			want.Input.LinesRead, want.Events.Accepted, want.Events.Rejected)
		if outcome.Stdout != expected {
			return fail("stdout = %q, want %q", outcome.Stdout, expected)
		}
		return nil
	})

	check("correctness", "outputs-always-written", func() error {
		dir, err := os.MkdirTemp(workDir, "empty-")
		if err != nil {
			return err
		}
		input, err := writeFixture(dir, "empty.jsonl", []byte(""))
		if err != nil {
			return err
		}
		outDir := filepath.Join(dir, "out")
		outcome, err := process(binary, input, outDir)
		if err != nil {
			return err
		}
		return compare("empty.jsonl", outcome, expect("empty.jsonl", []byte("")))
	})
}

func checkDeterminism(binary, workDir string, fixtures []fixture) {
	check("determinism", "repeated-runs-are-byte-identical", func() error {
		for _, item := range fixtures {
			dir, err := os.MkdirTemp(workDir, "det-")
			if err != nil {
				return err
			}
			input, err := writeFixture(dir, item.Name, item.Content)
			if err != nil {
				return err
			}
			first, err := process(binary, input, filepath.Join(dir, "a"))
			if err != nil {
				return err
			}
			second, err := process(binary, input, filepath.Join(dir, "b"))
			if err != nil {
				return err
			}
			if first.Summary != second.Summary || first.Rejects != second.Rejects {
				return fail("%s: two runs produced different output", item.Name)
			}
		}
		return nil
	})

	check("determinism", "buffer-size-does-not-change-output", func() error {
		sizes := []string{"1024", "4096", "65536", "1048576"}
		for _, item := range fixtures {
			dir, err := os.MkdirTemp(workDir, "buf-")
			if err != nil {
				return err
			}
			input, err := writeFixture(dir, item.Name, item.Content)
			if err != nil {
				return err
			}
			var reference run
			for index, size := range sizes {
				outcome, err := process(binary, input, filepath.Join(dir, "out"+size), "--buffer-size", size)
				if err != nil {
					return fail("%s at buffer-size %s: %v", item.Name, size, err)
				}
				if index == 0 {
					reference = outcome
					continue
				}
				if outcome.Summary != reference.Summary || outcome.Rejects != reference.Rejects {
					return fail("%s: buffer-size %s changed the output", item.Name, size)
				}
			}
		}
		return nil
	})

	check("determinism", "long-line-independent-of-buffer", func() error {
		dir, err := os.MkdirTemp(workDir, "long-")
		if err != nil {
			return err
		}
		padding := strings.Repeat("x", 200_000)
		content := []byte(
			`{"event_id":"evt-long","customer_id":"cust-1","timestamp":"2026-01-02T03:04:05Z","category":"purchase","amount":100,"status":"settled","note":"` +
				padding + `"}` + "\n" +
				`{"event_id":"evt-short","customer_id":"cust-1","timestamp":"2026-01-02T03:04:06Z","category":"refund","amount":-50,"status":"failed"}` + "\n")
		input, err := writeFixture(dir, "long-line.jsonl", content)
		if err != nil {
			return err
		}
		want := expect("long-line.jsonl", content)
		for _, size := range []string{"1024", "1048576"} {
			outcome, err := process(binary, input, filepath.Join(dir, "out"+size), "--buffer-size", size)
			if err != nil {
				return fail("buffer-size %s: %v", size, err)
			}
			if err := compare("long-line.jsonl@"+size, outcome, want); err != nil {
				return err
			}
		}
		return nil
	})

	check("determinism", "oversized-line-is-rejected", func() error {
		dir, err := os.MkdirTemp(workDir, "over-")
		if err != nil {
			return err
		}
		padding := strings.Repeat("y", 1<<20)
		content := []byte(
			`{"event_id":"evt-huge","customer_id":"cust-1","timestamp":"2026-01-02T03:04:05Z","category":"purchase","amount":100,"status":"settled","note":"` +
				padding + `"}` + "\n" +
				`{"event_id":"evt-ok","customer_id":"cust-1","timestamp":"2026-01-02T03:04:06Z","category":"purchase","amount":10,"status":"settled"}` + "\n")
		input, err := writeFixture(dir, "oversized.jsonl", content)
		if err != nil {
			return err
		}
		outcome, err := process(binary, input, filepath.Join(dir, "out"))
		if err != nil {
			return err
		}
		return compare("oversized.jsonl", outcome, expect("oversized.jsonl", content))
	})
}

func checkErrors(binary, workDir string) {
	check("errors", "missing-flags-exit-2", func() error {
		for _, args := range [][]string{{}, {"process"}, {"process", "--input", "x.jsonl"}, {"frobnicate"}} {
			outcome, err := runCLI(binary, args...)
			if err != nil {
				return err
			}
			if outcome.ExitCode != 2 {
				return fail("`%s` exited %d, want 2", strings.Join(args, " "), outcome.ExitCode)
			}
		}
		return nil
	})

	check("errors", "unreadable-input-exits-2", func() error {
		dir, err := os.MkdirTemp(workDir, "io-")
		if err != nil {
			return err
		}
		outcome, err := runCLI(binary, "process", "--input",
			filepath.Join(dir, "nope.jsonl"), "--outdir", filepath.Join(dir, "out"))
		if err != nil {
			return err
		}
		if outcome.ExitCode != 2 {
			return fail("a missing input exited %d, want 2", outcome.ExitCode)
		}
		if strings.TrimSpace(outcome.Stderr) == "" {
			return fail("a missing input produced no message on stderr")
		}
		return nil
	})

	check("errors", "buffer-size-below-minimum-exits-2", func() error {
		dir, err := os.MkdirTemp(workDir, "buf2-")
		if err != nil {
			return err
		}
		input, err := writeFixture(dir, "tiny.jsonl", []byte("\n"))
		if err != nil {
			return err
		}
		outcome, err := runCLI(binary, "process", "--input", input,
			"--outdir", filepath.Join(dir, "out"), "--buffer-size", "16")
		if err != nil {
			return err
		}
		if outcome.ExitCode != 2 {
			return fail("--buffer-size 16 exited %d, want 2", outcome.ExitCode)
		}
		return nil
	})
}

func checkPerformance(binary, workDir string) {
	dir, err := os.MkdirTemp(workDir, "perf-")
	if err != nil {
		record("performance", "large-fixture-correct", err)
		return
	}

	// The fixtures are written straight to disk. Peak memory of a child process
	// is only meaningful while this process is small: a large parent is copied
	// into the child's accounting at fork and would swamp the measurement.
	largePath, largeBytes, err := writeGenerated(dir, "large.jsonl", LargeFixtureEvents, LargeFixtureSeed)
	if err != nil {
		record("performance", "large-fixture-correct", err)
		return
	}
	smallPath, smallBytes, err := writeGenerated(dir, "small.jsonl", SmallFixtureEvents, LargeFixtureSeed)
	if err != nil {
		record("performance", "large-fixture-correct", err)
		return
	}

	largeRun, largeErr := process(binary, largePath, filepath.Join(dir, "large-out"))
	smallRun, smallErr := process(binary, smallPath, filepath.Join(dir, "small-out"))

	check("performance", "runtime-within-budget", func() error {
		if largeErr != nil {
			return largeErr
		}
		if largeRun.Elapsed > RuntimeBudget {
			return fail("large fixture took %s, budget is %s", largeRun.Elapsed, RuntimeBudget)
		}
		return nil
	})

	check("performance", "peak-memory-within-budget", func() error {
		if largeErr != nil {
			return largeErr
		}
		if largeRun.MaxRSS <= 0 {
			return fail("peak resident memory could not be measured on this platform")
		}
		if largeRun.MaxRSS > MemoryBudgetBytes {
			return fail("peak RSS was %.1f MiB on a %.1f MiB input, budget is %.0f MiB",
				float64(largeRun.MaxRSS)/(1<<20), float64(largeBytes)/(1<<20),
				float64(MemoryBudgetBytes)/(1<<20))
		}
		return nil
	})

	check("performance", "memory-does-not-track-input-size", func() error {
		if largeErr != nil {
			return largeErr
		}
		if smallErr != nil {
			return smallErr
		}
		if largeRun.MaxRSS <= 0 || smallRun.MaxRSS <= 0 {
			return fail("peak resident memory could not be measured on this platform")
		}
		grown := float64(largeRun.MaxRSS - smallRun.MaxRSS)
		inputGrowth := float64(largeBytes - smallBytes)
		if grown > inputGrowth*GrowthFractionLimit {
			return fail(
				"peak RSS grew %.1f MiB while the input grew %.1f MiB (limit is %.0f%% of the growth)",
				grown/(1<<20), inputGrowth/(1<<20), GrowthFractionLimit*100)
		}
		return nil
	})

	// Everything below loads fixtures into this process, so it runs only after
	// the measurements above are taken.
	check("performance", "large-fixture-correct", func() error {
		if largeErr != nil {
			return largeErr
		}
		content, err := os.ReadFile(largePath)
		if err != nil {
			return err
		}
		return compare("large.jsonl", largeRun, expect("large.jsonl", content))
	})

	check("performance", "small-fixture-correct", func() error {
		if smallErr != nil {
			return smallErr
		}
		content, err := os.ReadFile(smallPath)
		if err != nil {
			return err
		}
		return compare("small.jsonl", smallRun, expect("small.jsonl", content))
	})

	check("performance", "buffer-size-does-not-change-large-output", func() error {
		if largeErr != nil {
			return largeErr
		}
		outcome, err := process(binary, largePath, filepath.Join(dir, "large-4k"), "--buffer-size", "4096")
		if err != nil {
			return err
		}
		if outcome.Summary != largeRun.Summary || outcome.Rejects != largeRun.Rejects {
			return fail("a 4 KiB buffer changed the output of the large fixture")
		}
		return nil
	})

	check("performance", "no-hardcoded-output", func() error {
		altered := generate(50_000, LargeFixtureSeed^0x9e3779b97f4a7c15)
		altDir, err := os.MkdirTemp(workDir, "alt-")
		if err != nil {
			return err
		}
		altPath, err := writeFixture(altDir, "alternate.jsonl", altered)
		if err != nil {
			return err
		}
		outcome, err := process(binary, altPath, filepath.Join(altDir, "out"))
		if err != nil {
			return err
		}
		return compare("alternate.jsonl", outcome, expect("alternate.jsonl", altered))
	})
}

// writeGenerated streams a generated fixture to disk without holding it.
func writeGenerated(dir, name string, events int, seed uint64) (string, int64, error) {
	path := filepath.Join(dir, name)
	handle, err := os.Create(path)
	if err != nil {
		return "", 0, fail("cannot write %s: %v", name, err)
	}
	written, err := generateTo(handle, events, seed)
	if closeErr := handle.Close(); err == nil {
		err = closeErr
	}
	if err != nil {
		return "", 0, fail("cannot write %s: %v", name, err)
	}
	return path, written, nil
}

// ----------------------------------------------------------------------
func main() {
	reportPath := flag.String("report", "", "write a JSON report to this path")
	flag.BoolVar(&verbose, "verbose", false, "print passing checks too")
	flag.Parse()

	root, err := os.Getwd()
	if err != nil {
		fmt.Fprintf(os.Stderr, "cannot determine the repository root: %v\n", err)
		os.Exit(2)
	}

	workDir, err := os.MkdirTemp("", "stream-check-")
	if err != nil {
		fmt.Fprintf(os.Stderr, "cannot create a work directory: %v\n", err)
		os.Exit(2)
	}
	defer os.RemoveAll(workDir)

	checkEnvironment(root)

	binary := filepath.Join(workDir, "stream")
	build := exec.Command("go", "build", "-o", binary, "./cmd/stream")
	build.Dir = root
	if output, err := build.CombinedOutput(); err != nil {
		record("environment", "candidate-builds",
			fail("go build ./cmd/stream failed: %s", strings.TrimSpace(string(output))))
	} else {
		record("environment", "candidate-builds", nil)

		fixtures, err := frozenFixtures(filepath.Join(root, "validation", "fixtures"))
		if err != nil || len(fixtures) == 0 {
			record("environment", "fixtures-present", fail("cannot read validation/fixtures: %v", err))
		} else {
			record("environment", "fixtures-present", nil)
			checkCorrectness(binary, workDir, fixtures)
			checkDeterminism(binary, workDir, fixtures)
			checkErrors(binary, workDir)
			checkPerformance(binary, workDir)
		}
	}

	failed := 0
	for _, item := range results {
		if item.Status == "FAIL" {
			failed++
			fmt.Printf("FAIL [%s] %s: %s\n", item.Group, item.Name, item.Detail)
		} else if verbose {
			fmt.Printf("OK   [%s] %s\n", item.Group, item.Name)
		}
	}

	status := "PASS"
	if failed > 0 {
		status = "FAIL"
	}
	fmt.Printf("\n%s: %d/%d checks passed (%d failed)\n",
		status, len(results)-failed, len(results), failed)

	if *reportPath != "" {
		payload := map[string]any{
			"schema_version": 1,
			"benchmark_id":   "B07-stream",
			"validator":      "validation/check.go",
			"total":          len(results),
			"passed":         len(results) - failed,
			"failed":         failed,
			"status":         status,
			"checks":         results,
		}
		encoded, _ := json.MarshalIndent(payload, "", "  ")
		_ = os.WriteFile(*reportPath, append(encoded, '\n'), 0o644)
	}

	if failed > 0 {
		os.Exit(1)
	}
}
