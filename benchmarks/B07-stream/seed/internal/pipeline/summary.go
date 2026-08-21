// Package pipeline turns a JSONL stream of events into a summary and a
// rejection log.
package pipeline

// CategoryTotal is one row of the per-category breakdown.
type CategoryTotal struct {
	Category string `json:"category"`
	Count    int64  `json:"count"`
	Amount   int64  `json:"amount"`
}

// StatusTotal is one row of the per-status breakdown.
type StatusTotal struct {
	Status string `json:"status"`
	Count  int64  `json:"count"`
	Amount int64  `json:"amount"`
}

// CustomerTotal is one row of the customer leaderboard.
type CustomerTotal struct {
	CustomerID string `json:"customer_id"`
	Count      int64  `json:"count"`
	Amount     int64  `json:"amount"`
}

// InputSummary describes what was read.
type InputSummary struct {
	Path       string `json:"path"`
	LinesRead  int64  `json:"lines_read"`
	BlankLines int64  `json:"blank_lines"`
}

// EventSummary counts the outcome of every non-blank line.
type EventSummary struct {
	Accepted   int64 `json:"accepted"`
	Rejected   int64 `json:"rejected"`
	Duplicates int64 `json:"duplicates"`
}

// Totals aggregates the accepted events.
type Totals struct {
	Amount     int64           `json:"amount"`
	ByCategory []CategoryTotal `json:"by_category"`
	ByStatus   []StatusTotal   `json:"by_status"`
}

// Customers describes the distinct customers seen.
type Customers struct {
	Unique int64           `json:"unique"`
	Top    []CustomerTotal `json:"top"`
}

// TimeRange is the span of accepted timestamps, or nulls when none were accepted.
type TimeRange struct {
	First *string `json:"first"`
	Last  *string `json:"last"`
}

// Summary is the exact shape of summary.json.
type Summary struct {
	Input     InputSummary `json:"input"`
	Events    EventSummary `json:"events"`
	Totals    Totals       `json:"totals"`
	Customers Customers    `json:"customers"`
	TimeRange TimeRange    `json:"time_range"`
}

// Reject is one line of rejects.jsonl.
type Reject struct {
	Line   int64  `json:"line"`
	Reason string `json:"reason"`
	Raw    string `json:"raw"`
}

// TopCustomers is how many rows the customer leaderboard carries.
const TopCustomers = 10
