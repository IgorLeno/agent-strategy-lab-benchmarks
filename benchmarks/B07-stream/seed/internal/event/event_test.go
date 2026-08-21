package event

import "testing"

const valid = `{"event_id":"e1","customer_id":"c1","timestamp":"2026-01-02T03:04:05Z","category":"purchase","amount":1200,"status":"settled"}`

func TestParseAcceptsAValidLine(t *testing.T) {
	parsed, err := Parse([]byte(valid))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if parsed.EventID != "e1" || parsed.CustomerID != "c1" {
		t.Fatalf("unexpected identifiers: %+v", parsed)
	}
	if parsed.Amount != 1200 {
		t.Fatalf("amount = %d, want 1200", parsed.Amount)
	}
	if parsed.Category != "purchase" || parsed.Status != "settled" {
		t.Fatalf("unexpected classification: %+v", parsed)
	}
}

func TestParseRejectsMalformedJSON(t *testing.T) {
	_, err := Parse([]byte("{not json"))
	reason, ok := ReasonOf(err)
	if !ok || reason != ReasonMalformedJSON {
		t.Fatalf("reason = %q, want %q", reason, ReasonMalformedJSON)
	}
}

func TestParseReportsTheFirstMissingFieldInContractOrder(t *testing.T) {
	line := `{"customer_id":"c1","category":"purchase"}`
	_, err := Parse([]byte(line))
	reason, ok := ReasonOf(err)
	if !ok || reason != MissingField("event_id") {
		t.Fatalf("reason = %q, want %q", reason, MissingField("event_id"))
	}
}

func TestParseTreatsNullAsMissing(t *testing.T) {
	line := `{"event_id":"e1","customer_id":null,"timestamp":"2026-01-02T03:04:05Z","category":"purchase","amount":1,"status":"settled"}`
	_, err := Parse([]byte(line))
	reason, _ := ReasonOf(err)
	if reason != MissingField("customer_id") {
		t.Fatalf("reason = %q, want %q", reason, MissingField("customer_id"))
	}
}

func TestParseRejectsAnUnparsableTimestamp(t *testing.T) {
	line := `{"event_id":"e1","customer_id":"c1","timestamp":"yesterday","category":"purchase","amount":1,"status":"settled"}`
	_, err := Parse([]byte(line))
	reason, _ := ReasonOf(err)
	if reason != InvalidField("timestamp") {
		t.Fatalf("reason = %q, want %q", reason, InvalidField("timestamp"))
	}
}

func TestContains(t *testing.T) {
	if !Contains(Categories, "refund") {
		t.Fatal("refund must be a known category")
	}
	if Contains(Statuses, "unknown") {
		t.Fatal("unknown must not be a known status")
	}
}
