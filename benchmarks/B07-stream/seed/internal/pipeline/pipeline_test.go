package pipeline

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

func writeInput(t *testing.T, lines ...string) string {
	t.Helper()
	dir := t.TempDir()
	path := filepath.Join(dir, "events.jsonl")
	content := ""
	for _, line := range lines {
		content += line + "\n"
	}
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		t.Fatalf("cannot write fixture: %v", err)
	}
	return path
}

func TestRunWritesBothOutputs(t *testing.T) {
	input := writeInput(t,
		`{"event_id":"e1","customer_id":"c1","timestamp":"2026-01-02T03:04:05Z","category":"purchase","amount":1200,"status":"settled"}`,
		`{"event_id":"e2","customer_id":"c2","timestamp":"2026-01-02T05:00:00Z","category":"refund","amount":-300,"status":"pending"}`,
	)
	outDir := t.TempDir()

	result, err := Run(Options{InputPath: input, OutDir: outDir})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.Summary.Events.Accepted != 2 {
		t.Fatalf("accepted = %d, want 2", result.Summary.Events.Accepted)
	}
	if result.Summary.Totals.Amount != 900 {
		t.Fatalf("total = %d, want 900", result.Summary.Totals.Amount)
	}

	for _, name := range []string{"summary.json", "rejects.jsonl"} {
		if _, err := os.Stat(filepath.Join(outDir, name)); err != nil {
			t.Fatalf("missing output %s: %v", name, err)
		}
	}
}

func TestRunRejectsAMalformedLine(t *testing.T) {
	input := writeInput(t,
		`{"event_id":"e1","customer_id":"c1","timestamp":"2026-01-02T03:04:05Z","category":"purchase","amount":1200,"status":"settled"}`,
		`{oops`,
	)
	outDir := t.TempDir()

	result, err := Run(Options{InputPath: input, OutDir: outDir})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.Summary.Events.Rejected != 1 {
		t.Fatalf("rejected = %d, want 1", result.Summary.Events.Rejected)
	}

	raw, err := os.ReadFile(filepath.Join(outDir, "rejects.jsonl"))
	if err != nil {
		t.Fatalf("cannot read rejects: %v", err)
	}
	var reject Reject
	if err := json.Unmarshal(raw[:len(raw)-1], &reject); err != nil {
		t.Fatalf("rejects.jsonl is not one JSON object per line: %v", err)
	}
	if reject.Line != 2 || reject.Reason != "malformed_json" {
		t.Fatalf("unexpected reject: %+v", reject)
	}
}

func TestRunOnAnEmptyInput(t *testing.T) {
	input := writeInput(t)
	outDir := t.TempDir()

	result, err := Run(Options{InputPath: input, OutDir: outDir})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.Summary.Events.Accepted != 0 || result.Summary.Events.Rejected != 0 {
		t.Fatalf("unexpected counts: %+v", result.Summary.Events)
	}
	if result.Summary.TimeRange.First != nil || result.Summary.TimeRange.Last != nil {
		t.Fatal("an empty input must not produce a time range")
	}
}

func TestRunFailsOnAMissingInput(t *testing.T) {
	if _, err := Run(Options{InputPath: "/nonexistent/events.jsonl", OutDir: t.TempDir()}); err == nil {
		t.Fatal("expected an error for a missing input file")
	}
}
