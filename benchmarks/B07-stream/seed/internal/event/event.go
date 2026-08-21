// Package event defines the input record of the STREAM pipeline and the rules
// that decide whether a line is acceptable.
//
// Amounts are integer minor units (cents). Money never becomes a float here:
// every total in the summary is an exact int64 sum.
package event

import (
	"encoding/json"
	"errors"
	"time"
)

// MaxLineBytes is the largest input line the pipeline accepts.
const MaxLineBytes = 1 << 20 // 1 MiB

// MaxAbsAmount bounds a single event's amount, in cents.
const MaxAbsAmount = 10_000_000

// MaxEventIDLen bounds the length of an event id.
const MaxEventIDLen = 64

// Categories are the accepted values of the category field, in canonical order.
var Categories = []string{"adjustment", "purchase", "refund", "subscription"}

// Statuses are the accepted values of the status field, in canonical order.
var Statuses = []string{"failed", "pending", "settled"}

// RequiredFields is the order in which missing and invalid fields are reported.
// The order is part of the contract: it makes the first rejection reason for a
// line deterministic.
var RequiredFields = []string{
	"event_id",
	"customer_id",
	"timestamp",
	"category",
	"amount",
	"status",
}

// Event is one accepted record.
type Event struct {
	EventID    string
	CustomerID string
	Timestamp  time.Time
	Category   string
	Amount     int64
	Status     string
}

// Reason is a stable rejection reason.
type Reason string

const (
	ReasonMalformedJSON    Reason = "malformed_json"
	ReasonLineTooLong      Reason = "line_too_long"
	ReasonDuplicateEventID Reason = "duplicate_event_id"
)

// MissingField builds the reason for an absent required field.
func MissingField(name string) Reason { return Reason("missing_field:" + name) }

// InvalidField builds the reason for a present but unacceptable field.
func InvalidField(name string) Reason { return Reason("invalid_field:" + name) }

// RejectError carries a stable reason out of Parse.
type RejectError struct {
	Reason Reason
}

func (e *RejectError) Error() string { return string(e.Reason) }

func reject(r Reason) error { return &RejectError{Reason: r} }

// ReasonOf extracts the stable reason from an error returned by Parse.
func ReasonOf(err error) (Reason, bool) {
	var rejectErr *RejectError
	if errors.As(err, &rejectErr) {
		return rejectErr.Reason, true
	}
	return "", false
}

// Contains reports whether values holds want.
func Contains(values []string, want string) bool {
	for _, value := range values {
		if value == want {
			return true
		}
	}
	return false
}

// Parse decodes and validates one input line.
//
// Checks run in a fixed order: JSON shape, then missing fields in the order of
// RequiredFields, then invalid fields in the same order. The first failure
// wins, so the reason for a given line never depends on map iteration.
func Parse(line []byte) (Event, error) {
	var raw map[string]json.RawMessage
	if err := json.Unmarshal(line, &raw); err != nil {
		return Event{}, reject(ReasonMalformedJSON)
	}

	for _, field := range RequiredFields {
		value, ok := raw[field]
		if !ok || string(value) == "null" {
			return Event{}, reject(MissingField(field))
		}
	}

	var parsed Event

	if err := json.Unmarshal(raw["event_id"], &parsed.EventID); err != nil {
		return Event{}, reject(InvalidField("event_id"))
	}
	if err := json.Unmarshal(raw["customer_id"], &parsed.CustomerID); err != nil {
		return Event{}, reject(InvalidField("customer_id"))
	}

	var timestamp string
	if err := json.Unmarshal(raw["timestamp"], &timestamp); err != nil {
		return Event{}, reject(InvalidField("timestamp"))
	}
	moment, err := time.Parse(time.RFC3339, timestamp)
	if err != nil {
		return Event{}, reject(InvalidField("timestamp"))
	}
	parsed.Timestamp = moment

	if err := json.Unmarshal(raw["category"], &parsed.Category); err != nil {
		return Event{}, reject(InvalidField("category"))
	}

	var amount float64
	if err := json.Unmarshal(raw["amount"], &amount); err != nil {
		return Event{}, reject(InvalidField("amount"))
	}
	parsed.Amount = int64(amount)

	if err := json.Unmarshal(raw["status"], &parsed.Status); err != nil {
		return Event{}, reject(InvalidField("status"))
	}

	return parsed, nil
}

// FormatTime renders a timestamp the way the summary must carry it.
func FormatTime(moment time.Time) string {
	return moment.Format(time.RFC3339)
}
