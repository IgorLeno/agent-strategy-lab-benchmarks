#!/usr/bin/env python3
"""External validator for B05 RELAY.

This program is the deterministic gate. It does not read the repository's own
test suite for its verdict: it drives ``relay.RelayService`` through its public
API and checks the behaviour the TASK requires.

Usage:

    python3 validation/check.py [--report PATH] [--verbose]

Exit code 0 means every check passed.
"""

from __future__ import annotations

import argparse
import hashlib
import inspect
import json
import os
import re
import socket
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path

VALIDATION_DIR = Path(__file__).resolve().parent
ROOT = VALIDATION_DIR.parent
SRC = ROOT / "src"
FIXTURES = VALIDATION_DIR / "fixtures"

MAX_PAGES = 400
NETWORK_PATTERN = re.compile(
    r"^\s*(?:import|from)\s+"
    r"(socket|ssl|http|urllib|ftplib|smtplib|telnetlib|asyncio|xmlrpc|requests|httpx|aiohttp)\b",
    re.MULTILINE,
)


# ----------------------------------------------------------------------
# result plumbing
# ----------------------------------------------------------------------
@dataclass
class CheckResult:
    name: str
    group: str
    passed: bool
    detail: str = ""


@dataclass
class Report:
    results: list[CheckResult] = field(default_factory=list)

    def record(self, name: str, group: str, passed: bool, detail: str = "") -> None:
        self.results.append(CheckResult(name, group, passed, detail))

    @property
    def failures(self) -> list[CheckResult]:
        return [r for r in self.results if not r.passed]

    def to_dict(self) -> dict:
        return {
            "schema_version": 1,
            "benchmark_id": "B05-relay",
            "validator": "validation/check.py",
            "total": len(self.results),
            "passed": len(self.results) - len(self.failures),
            "failed": len(self.failures),
            "status": "PASS" if not self.failures else "FAIL",
            "checks": [
                {
                    "name": r.name,
                    "group": r.group,
                    "status": "PASS" if r.passed else "FAIL",
                    "detail": r.detail,
                }
                for r in self.results
            ],
        }


class CheckFailed(Exception):
    """Raised inside a scenario to abort it with a message."""


def expect(condition: bool, message: str) -> None:
    if not condition:
        raise CheckFailed(message)


def run_check(report: Report, group: str, name: str, fn) -> None:
    try:
        fn()
    except CheckFailed as exc:
        report.record(name, group, False, str(exc))
    except Exception as exc:  # noqa: BLE001 - any crash is a validation failure
        report.record(name, group, False, f"{type(exc).__name__}: {exc}")
    else:
        report.record(name, group, True)


# ----------------------------------------------------------------------
# environment
# ----------------------------------------------------------------------
class NoNetwork:
    """Context manager that makes any socket creation raise."""

    def __enter__(self):
        self._socket = socket.socket
        self._create = socket.create_connection

        def blocked(*args, **kwargs):
            raise AssertionError("network access is forbidden in this benchmark")

        socket.socket = blocked  # type: ignore[assignment]
        socket.create_connection = blocked  # type: ignore[assignment]
        return self

    def __exit__(self, *exc_info):
        socket.socket = self._socket  # type: ignore[assignment]
        socket.create_connection = self._create  # type: ignore[assignment]
        return False


def load_relay():
    if str(SRC) not in sys.path:
        sys.path.insert(0, str(SRC))
    import relay  # noqa: PLC0415

    return relay


# ----------------------------------------------------------------------
# static checks
# ----------------------------------------------------------------------
def check_no_network_imports(report: Report) -> None:
    offenders = []
    for path in sorted(SRC.rglob("*.py")):
        text = path.read_text(encoding="utf-8")
        for match in NETWORK_PATTERN.finditer(text):
            offenders.append(f"{path.relative_to(ROOT)}: {match.group(0).strip()}")
    run_check(
        report,
        "environment",
        "no-network-imports",
        lambda: expect(not offenders, "networking imports found: " + "; ".join(offenders)),
    )


def check_protected_files(report: Report) -> None:
    """The validator tree must be the frozen one.

    The operator restores ``validation/`` from the frozen benchmark before this
    runs; this check catches an in-place edit inside the working tree.
    """
    listing = VALIDATION_DIR / "PROTECTED.sha256"

    def verify() -> None:
        expect(listing.exists(), "validation/PROTECTED.sha256 is missing")
        mismatches = []
        recorded = set()
        for line in listing.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            digest, rel = line.split(None, 1)
            recorded.add(rel)
            target = ROOT / rel
            if not target.exists():
                mismatches.append(f"{rel}: missing")
                continue
            actual = hashlib.sha256(target.read_bytes()).hexdigest()
            if actual != digest:
                mismatches.append(f"{rel}: modified")
        for path in sorted(VALIDATION_DIR.rglob("*")):
            if path.is_dir() or path.name == "PROTECTED.sha256":
                continue
            rel = str(path.relative_to(ROOT))
            if rel not in recorded:
                mismatches.append(f"{rel}: added to validation/")
        expect(not mismatches, "protected files changed: " + "; ".join(mismatches))

    run_check(report, "environment", "protected-files-untouched", verify)


def check_worker_tests(report: Report) -> None:
    def verify() -> None:
        tests_dir = ROOT / "tests"
        expect(tests_dir.is_dir(), "tests/ directory is missing")
        proc = subprocess.run(
            [sys.executable, "-m", "unittest", "discover", "-s", "tests", "-t", "tests"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=300,
        )
        tail = (proc.stderr or proc.stdout).strip().splitlines()[-3:]
        expect(
            proc.returncode == 0,
            "repository test suite failed: " + " | ".join(tail),
        )
        expect(
            "Ran 0 tests" not in (proc.stderr or ""),
            "repository test suite ran no tests",
        )

    run_check(report, "environment", "repository-tests-pass", verify)


# ----------------------------------------------------------------------
# API surface
# ----------------------------------------------------------------------
def _param_shape(fn) -> list[tuple[str, str, object]]:
    signature = inspect.signature(fn)
    shape = []
    for name, param in signature.parameters.items():
        if name == "self":
            continue
        shape.append((name, str(param.kind), param.default))
    return shape


def check_api_surface(report: Report, relay) -> None:
    spec = json.loads((FIXTURES / "api_surface.json").read_text(encoding="utf-8"))

    def exports() -> None:
        missing = [name for name in spec["exports"] if not hasattr(relay, name)]
        expect(not missing, "missing public exports: " + ", ".join(missing))

    def methods() -> None:
        problems = []
        for name, expected in spec["service_methods"].items():
            fn = getattr(relay.RelayService, name, None)
            if fn is None:
                problems.append(f"{name}: missing")
                continue
            shape = _param_shape(fn)
            expected_names = [
                p.strip().split("=")[0].strip()
                for p in expected.strip("()").split(",")
                if p.strip() and p.strip() != "*"
            ]
            actual_names = [n for n, _, _ in shape]
            if actual_names != expected_names:
                problems.append(f"{name}: parameters {actual_names} != {expected_names}")
        expect(not problems, "; ".join(problems))

    def job_shape() -> None:
        missing = [f for f in spec["job_fields"] if f not in relay.Job.__dataclass_fields__]
        expect(not missing, "Job lost fields: " + ", ".join(missing))

    def stats_shape() -> None:
        missing = [
            f for f in spec["stats_fields"] if f not in relay.Stats.__dataclass_fields__
        ]
        expect(not missing, "Stats lost fields: " + ", ".join(missing))

    def states() -> None:
        actual = sorted(state.value for state in relay.JobState)
        expect(
            actual == sorted(spec["job_states"]),
            f"JobState values changed: {actual}",
        )

    run_check(report, "api", "public-exports", exports)
    run_check(report, "api", "service-method-signatures", methods)
    run_check(report, "api", "job-fields", job_shape)
    run_check(report, "api", "stats-fields", stats_shape)
    run_check(report, "api", "job-states", states)


# ----------------------------------------------------------------------
# behavioural scenarios
# ----------------------------------------------------------------------
def build(relay, **kwargs):
    clock = relay.ManualClock(1_700_000_000.0)
    return relay.RelayService(clock=clock, **kwargs), clock


def check_retry_not_duplicated(report: Report, relay) -> None:
    """A job must never be handed to two workers at the same time."""

    def abandoned_lease_does_not_resurrect_a_running_job() -> None:
        service, clock = build(relay, lease_seconds=30.0)
        job = service.submit({"n": 1}, max_attempts=5)

        first = service.dispatch()
        expect(first is not None, "first dispatch returned nothing")
        clock.advance(5.0)
        service.nack(first, error="transient")

        clock.advance(5.0)
        second = service.dispatch()
        expect(second is not None, "retry was never dispatched")
        expect(second.epoch == 2, f"retry epoch was {second.epoch}, expected 2")

        # The first lease is long dead, but the job is running under the second.
        clock.advance(21.0)
        reaped = service.reap_expired()
        expect(
            reaped == [],
            f"reaped a job that is running under a live lease: {reaped}",
        )
        state = service.get(job.id).state
        expect(
            state is relay.JobState.RUNNING,
            f"job left {state} while a live lease exists",
        )
        expect(
            service.dispatch() is None,
            "the same job was dispatched twice while one attempt was still running",
        )
        service.ack(second)
        expect(
            service.get(job.id).state is relay.JobState.SUCCEEDED,
            "the live worker could not acknowledge its own attempt",
        )

    def attempts_are_counted_once_per_execution() -> None:
        service, clock = build(relay, lease_seconds=10.0)
        job = service.submit({"n": 1}, max_attempts=3)
        for _ in range(2):
            lease = service.dispatch()
            expect(lease is not None, "job stopped being dispatchable too early")
            clock.advance(1.0)
            service.nack(lease, error="transient")
            clock.advance(30.0)
            service.reap_expired()
        final = service.get(job.id)
        expect(
            final.attempts_used == 2,
            f"job recorded {final.attempts_used} attempts after 2 failures",
        )
        expect(
            final.state is relay.JobState.READY,
            f"job is {final.state} with one attempt still available",
        )

    def expired_lease_is_still_reaped() -> None:
        service, clock = build(relay, lease_seconds=15.0)
        job = service.submit({"n": 1})
        service.dispatch()
        clock.advance(16.0)
        expect(service.reap_expired() == [job.id], "an abandoned job was not reaped")
        expect(service.get(job.id).state is relay.JobState.READY, "reap left a wrong state")
        again = service.dispatch()
        expect(again is not None and again.job_id == job.id, "reaped job is not dispatchable")

    run_check(report, "retry", "no-duplicate-execution", abandoned_lease_does_not_resurrect_a_running_job)
    run_check(report, "retry", "attempts-counted-once", attempts_are_counted_once_per_execution)
    run_check(report, "retry", "abandoned-lease-still-reaped", expired_lease_is_still_reaped)


def check_cancel_idempotent(report: Report, relay) -> None:
    """Cancelling twice must not change anything the first call did not."""

    def repeated_cancel_keeps_accounting_consistent() -> None:
        service, _ = build(relay)
        first = service.submit({"n": 1})
        service.submit({"n": 2})
        service.submit({"n": 3})

        result = service.cancel(first.id)
        expect(result.cancelled is True, "first cancel did not report cancelled=True")
        after_first = dict(service.counters())
        stats_first = service.stats()

        for _ in range(3):
            repeat = service.cancel(first.id)
            expect(repeat.cancelled is False, "a repeated cancel reported cancelled=True")
            expect(repeat.already_terminal is True, "a repeated cancel lost already_terminal")

        after_repeat = dict(service.counters())
        expect(
            after_repeat == after_first,
            f"counters drifted across repeated cancels: {after_first} -> {after_repeat}",
        )
        expect(
            service.stats().to_dict() == stats_first.to_dict(),
            "stats drifted across repeated cancels",
        )
        expect(
            after_repeat.get("pending") == service.stats().pending,
            f"counters.pending={after_repeat.get('pending')} != stats.pending={service.stats().pending}",
        )
        expect(after_repeat.get("cancelled") == 1, "cancelled counter is not 1")

    def cancel_of_a_running_job() -> None:
        service, _ = build(relay)
        job = service.submit({"n": 1})
        lease = service.dispatch()
        result = service.cancel(job.id)
        expect(result.cancelled is True, "cancelling a running job failed")
        expect(service.get(job.id).state is relay.JobState.CANCELLED, "state is not cancelled")
        try:
            service.ack(lease)
        except relay.InvalidLease:
            pass
        else:
            raise CheckFailed("a cancelled job accepted an acknowledgement")
        counters = dict(service.counters())
        expect(
            counters.get("pending") == service.stats().pending,
            f"counters.pending={counters.get('pending')} != stats.pending={service.stats().pending}",
        )

    def cancel_after_success() -> None:
        service, _ = build(relay)
        job = service.submit({"n": 1})
        lease = service.dispatch()
        service.ack(lease)
        before = dict(service.counters())
        result = service.cancel(job.id)
        expect(result.cancelled is False, "cancelling a succeeded job reported cancelled=True")
        expect(result.state is relay.JobState.SUCCEEDED, "cancel overwrote a terminal state")
        expect(dict(service.counters()) == before, "cancel of a terminal job moved a counter")

    run_check(report, "cancel", "repeated-cancel-is-inert", repeated_cancel_keeps_accounting_consistent)
    run_check(report, "cancel", "cancel-running-job", cancel_of_a_running_job)
    run_check(report, "cancel", "cancel-after-success", cancel_after_success)


def _scan(service, *, order: str, limit: int) -> list[str]:
    seen: list[str] = []
    cursor = None
    for _ in range(MAX_PAGES):
        page = service.list_jobs(limit=limit, cursor=cursor, order=order)
        seen.extend(page.ids())
        cursor = page.next_cursor
        if cursor is None:
            return seen
    raise CheckFailed(f"pagination did not terminate in {MAX_PAGES} pages (order={order})")


def check_pagination(report: Report, relay) -> None:
    cases = json.loads((FIXTURES / "pagination_cases.json").read_text(encoding="utf-8"))["cases"]

    def make_case(case: dict, order: str):
        def verify() -> None:
            service, clock = build(relay)
            ids = []
            previous = 0
            for tick in case["ticks"]:
                clock.advance(float(tick - previous))
                previous = tick
                ids.append(service.submit({"tick": tick}).id)

            expected = service.list_jobs(limit=relay.MAX_PAGE_SIZE, order=order).ids()
            expect(
                sorted(expected) == sorted(ids),
                "a single full page already does not contain every job",
            )

            seen = _scan(service, order=order, limit=case["limit"])
            duplicates = len(seen) - len(set(seen))
            missing = sorted(set(ids) - set(seen))
            expect(not missing, f"cursor scan skipped {len(missing)} job(s): {missing}")
            expect(duplicates == 0, f"cursor scan returned {duplicates} duplicate(s)")
            expect(
                seen == expected,
                "paged order differs from the single-page order",
            )

        return verify

    for case in cases:
        for order in ("asc", "desc"):
            run_check(
                report,
                "pagination",
                f"cover-exactly-once[{case['id']}/{order}]",
                make_case(case, order),
            )

    def cursor_is_opaque_and_validated() -> None:
        service, clock = build(relay)
        for _ in range(4):
            service.submit({"n": 1})
            clock.advance(1.0)
        page = service.list_jobs(limit=2, order="asc")
        expect(page.next_cursor is not None, "a truncated page returned no cursor")
        try:
            service.list_jobs(limit=2, cursor=page.next_cursor, order="desc")
        except relay.InvalidCursor:
            pass
        else:
            raise CheckFailed("a cursor was accepted under the opposite ordering")
        try:
            service.list_jobs(limit=2, cursor="not-a-cursor", order="asc")
        except relay.InvalidCursor:
            pass
        else:
            raise CheckFailed("a malformed cursor was accepted")

    def state_filter_is_paginated_too() -> None:
        service, clock = build(relay)
        ready_ids = []
        for n in range(6):
            job = service.submit({"n": n})
            if n % 2 == 0:
                ready_ids.append(job.id)
            clock.advance(0.0 if n % 3 else 1.0)
        for job_id in [j for j in [job.id for job in service.list_jobs(limit=50).items] if j not in ready_ids]:
            service.cancel(job_id)

        seen: list[str] = []
        cursor = None
        for _ in range(MAX_PAGES):
            page = service.list_jobs(state=relay.JobState.READY, limit=2, cursor=cursor)
            seen.extend(page.ids())
            cursor = page.next_cursor
            if cursor is None:
                break
        else:
            raise CheckFailed("filtered pagination did not terminate")
        expect(
            sorted(seen) == sorted(ready_ids),
            f"filtered scan returned {sorted(seen)}, expected {sorted(ready_ids)}",
        )

    run_check(report, "pagination", "cursor-validation", cursor_is_opaque_and_validated)
    run_check(report, "pagination", "state-filtered-scan", state_filter_is_paginated_too)


def check_cache_invalidation(report: Report, relay) -> None:
    """Every mutation must be visible to the next read."""

    def stats_follow_every_transition() -> None:
        service, clock = build(relay)
        a = service.submit({"n": 1})
        clock.advance(1.0)
        b = service.submit({"n": 2})  # noqa: F841 - cancelled below
        clock.advance(1.0)
        c = service.submit({"n": 3})

        expect(service.stats().pending == 3, "stats did not see three submissions")

        lease_a = service.dispatch()
        expect(service.stats().running == 1, "stats did not see the dispatch")

        service.ack(lease_a)
        after_ack = service.stats()
        expect(
            after_ack.succeeded == 1,
            f"stats.succeeded={after_ack.succeeded} after an acknowledgement",
        )
        expect(after_ack.running == 0, f"stats.running={after_ack.running} after an acknowledgement")

        service.cancel(b.id)
        after_cancel = service.stats()
        expect(
            after_cancel.cancelled == 1,
            f"stats.cancelled={after_cancel.cancelled} after a cancellation",
        )
        expect(
            after_cancel.pending == 1,
            f"stats.pending={after_cancel.pending} after cancelling one of two ready jobs",
        )

        lease_c = service.dispatch()
        expect(lease_c is not None and lease_c.job_id == c.id, "wrong job dispatched")
        for _ in range(4):
            service.nack(lease_c, error="boom")
            clock.advance(120.0)
            lease_c = service.dispatch()
            if lease_c is None:
                break
        expect(lease_c is None, "a job outlived its attempt budget")
        after_dead = service.stats()
        expect(
            after_dead.dead_letter == 1,
            f"stats.dead_letter={after_dead.dead_letter} after exhausting the attempts",
        )
        expect(
            after_dead.total == 3 and after_dead.pending == 0,
            f"final stats are inconsistent: {after_dead.to_dict()}",
        )
        expect(
            service.get(a.id).state is relay.JobState.SUCCEEDED,
            "the acknowledged job did not stay succeeded",
        )

    def listings_follow_every_transition() -> None:
        service, clock = build(relay)
        job = service.submit({"n": 1})
        clock.advance(1.0)
        service.submit({"n": 2})

        lease = service.dispatch()
        running = service.list_jobs(state=relay.JobState.RUNNING, limit=10).ids()
        expect(running == [job.id], f"RUNNING listing is {running} right after dispatch")

        service.ack(lease)
        succeeded = service.list_jobs(state=relay.JobState.SUCCEEDED, limit=10).ids()
        expect(succeeded == [job.id], f"SUCCEEDED listing is {succeeded} right after ack")
        still_running = service.list_jobs(state=relay.JobState.RUNNING, limit=10).ids()
        expect(still_running == [], f"RUNNING listing still holds {still_running} after ack")

    def reap_is_visible() -> None:
        service, clock = build(relay, lease_seconds=5.0)
        service.submit({"n": 1})
        service.dispatch()
        clock.advance(6.0)
        service.reap_expired()
        stats = service.stats()
        expect(
            stats.pending == 1 and stats.running == 0,
            f"stats after reap are {stats.to_dict()}",
        )

    run_check(report, "cache", "stats-after-every-transition", stats_follow_every_transition)
    run_check(report, "cache", "listings-after-every-transition", listings_follow_every_transition)
    run_check(report, "cache", "stats-after-reap", reap_is_visible)


def check_preserved_behaviour(report: Report, relay) -> None:
    """Behaviour that was already correct must stay correct."""

    def priority_and_fifo() -> None:
        service, clock = build(relay)
        low = service.submit({"n": 1}, priority=0)
        clock.advance(1.0)
        high = service.submit({"n": 2}, priority=10)
        clock.advance(1.0)
        low2 = service.submit({"n": 3}, priority=0)
        order = [service.dispatch().job_id for _ in range(3)]
        expect(order == [high.id, low.id, low2.id], f"dispatch order was {order}")

    def backoff_is_respected() -> None:
        service, clock = build(relay)
        service.submit({"n": 1}, max_attempts=3)
        lease = service.dispatch()
        service.nack(lease, error="boom")
        expect(service.dispatch() is None, "backoff was ignored")
        clock.advance(1.0)
        expect(service.dispatch() is not None, "job never became available again")

    def dead_letter_is_terminal() -> None:
        service, clock = build(relay)
        job = service.submit({"n": 1}, max_attempts=2)
        for _ in range(2):
            lease = service.dispatch()
            expect(lease is not None, "job stopped being dispatchable too early")
            service.nack(lease, error="boom")
            clock.advance(120.0)
        expect(service.get(job.id).state is relay.JobState.DEAD_LETTER, "job is not dead-lettered")
        expect(service.dispatch() is None, "a dead-lettered job was dispatched again")

    def unknown_ids_and_stale_leases() -> None:
        service, clock = build(relay)
        try:
            service.get("job-does-not-exist")
        except relay.UnknownJob:
            pass
        else:
            raise CheckFailed("get() accepted an unknown id")

        service.submit({"n": 1})
        first = service.dispatch()
        service.nack(first, error="boom")
        clock.advance(2.0)
        service.dispatch()
        try:
            service.ack(first)
        except relay.InvalidLease:
            pass
        else:
            raise CheckFailed("a stale lease was accepted")

    def returned_objects_are_detached() -> None:
        service, _ = build(relay)
        payload = {"n": 1}
        job = service.submit(payload)
        payload["n"] = 999
        copy = service.get(job.id)
        copy.priority = 42
        stored = service.get(job.id)
        expect(stored.payload["n"] == 1, "submit stored a live reference to the payload")
        expect(stored.priority == 0, "get() returned a live reference to the stored job")

    def attempts_record_errors() -> None:
        service, clock = build(relay)
        job = service.submit({"n": 1}, max_attempts=3)
        lease = service.dispatch()
        clock.advance(2.0)
        service.nack(lease, error="disk full")
        stored = service.get(job.id)
        expect(stored.last_error == "disk full", "last_error was not recorded")
        expect(stored.attempts[-1].error == "disk full", "attempt error was not recorded")
        expect(stored.attempts[-1].finished_at is not None, "attempt was never closed")

    run_check(report, "preserved", "priority-and-fifo", priority_and_fifo)
    run_check(report, "preserved", "retry-backoff", backoff_is_respected)
    run_check(report, "preserved", "dead-letter-terminal", dead_letter_is_terminal)
    run_check(report, "preserved", "errors-for-unknown-and-stale", unknown_ids_and_stale_leases)
    run_check(report, "preserved", "returned-objects-detached", returned_objects_are_detached)
    run_check(report, "preserved", "attempts-record-errors", attempts_record_errors)


# ----------------------------------------------------------------------
def main() -> int:
    parser = argparse.ArgumentParser(description="B05 RELAY external validator")
    parser.add_argument("--report", help="write a JSON report to this path")
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()

    report = Report()
    check_no_network_imports(report)
    check_protected_files(report)

    relay = load_relay()
    with NoNetwork():
        check_api_surface(report, relay)
        check_retry_not_duplicated(report, relay)
        check_cancel_idempotent(report, relay)
        check_pagination(report, relay)
        check_cache_invalidation(report, relay)
        check_preserved_behaviour(report, relay)

    check_worker_tests(report)

    payload = report.to_dict()
    for result in report.results:
        if not result.passed:
            print(f"FAIL [{result.group}] {result.name}: {result.detail}")
        elif args.verbose:
            print(f"OK   [{result.group}] {result.name}")

    print(
        f"\n{payload['status']}: {payload['passed']}/{payload['total']} checks passed"
        f" ({payload['failed']} failed)"
    )

    if args.report:
        Path(args.report).write_text(
            json.dumps(payload, indent=2) + "\n", encoding="utf-8"
        )

    return 0 if payload["status"] == "PASS" else 1


if __name__ == "__main__":
    sys.exit(main())
