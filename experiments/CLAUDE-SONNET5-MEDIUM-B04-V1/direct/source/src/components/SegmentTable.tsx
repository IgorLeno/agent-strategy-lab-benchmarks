import type { SegmentSummary } from '../lib/types';
import { formatMoney, formatPercent } from '../lib/format';

interface SegmentTableProps {
  data: SegmentSummary[];
}

export function SegmentTable({ data }: SegmentTableProps) {
  const totals = data.reduce(
    (acc, item) => ({
      revenue: acc.revenue + item.revenue,
      cogs: acc.cogs + item.cogs,
      opex: acc.opex + item.opex,
      ebitda: acc.ebitda + item.ebitda,
      share: acc.share + item.share,
    }),
    { revenue: 0, cogs: 0, opex: 0, ebitda: 0, share: 0 },
  );

  return (
    <div className="table-wrapper">
      <table className="segment-table" data-testid="segment-table">
        <caption>Per-segment revenue, cost and profitability for the selected period</caption>
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
          {data.map((segment) => (
            <tr key={segment.segment} data-testid="segment-row" data-segment={segment.segment}>
              <th scope="row">{segment.name}</th>
              <td>{formatMoney(segment.revenue)}</td>
              <td>{formatMoney(segment.cogs)}</td>
              <td>{formatMoney(segment.opex)}</td>
              <td>{formatMoney(segment.ebitda)}</td>
              <td>{formatPercent(segment.share)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td>{formatMoney(totals.revenue)}</td>
            <td>{formatMoney(totals.cogs)}</td>
            <td>{formatMoney(totals.opex)}</td>
            <td>{formatMoney(totals.ebitda)}</td>
            <td>{formatPercent(totals.share)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
