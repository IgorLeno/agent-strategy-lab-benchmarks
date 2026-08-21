import type { SegmentBreakdown, SegmentKey } from '../lib/finance';
import { formatMoney, formatPercent } from '../lib/format';

function slugFor(segment: string): SegmentKey {
  if (segment === 'Enterprise') return 'enterprise';
  if (segment === 'Mid-Market') return 'mid-market';
  return 'smb';
}

export default function SegmentTable({ rows }: { rows: SegmentBreakdown[] }) {
  return (
    <div className="segment-table-wrap">
      <table className="segment-table" data-testid="segment-table">
        <caption>Per-segment revenue, costs and profitability, with share of total revenue</caption>
        <thead>
          <tr>
            <th scope="col">Segment</th>
            <th scope="col">Revenue</th>
            <th scope="col">COGS</th>
            <th scope="col">OpEx</th>
            <th scope="col">EBITDA</th>
            <th scope="col">Share</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.segment} data-testid="segment-row" data-segment={slugFor(row.segment)}>
              <th scope="row">{row.segment}</th>
              <td>{formatMoney(row.revenue)}</td>
              <td>{formatMoney(row.cogs)}</td>
              <td>{formatMoney(row.opex)}</td>
              <td className={row.ebitda >= 0 ? 'value-positive' : 'value-negative'}>{formatMoney(row.ebitda)}</td>
              <td>{formatPercent(row.share)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
