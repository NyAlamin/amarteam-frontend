const map: Record<string, { cls: string; label: string }> = {
  // Bookings & team requests
  callingSoon:    { cls: "bg-blue-100 text-blue-700",     label: "Calling Soon" },
  advancePending: { cls: "bg-yellow-100 text-yellow-700", label: "Advance Pending" },
  confirmed:      { cls: "bg-green-100 text-green-700",   label: "Confirmed" },
  playerOnTheWay: { cls: "bg-cyan-100 text-cyan-700",     label: "On The Way" },
  completed:      { cls: "bg-purple-100 text-purple-700", label: "Completed" },
  cancelled:      { cls: "bg-red-100 text-red-500",       label: "Cancelled" },

  // Orders
  pending:   { cls: "bg-yellow-100 text-yellow-700", label: "Pending" },
  onTheWay:  { cls: "bg-purple-100 text-purple-700", label: "On The Way" },
  delivered: { cls: "bg-green-100 text-green-700",   label: "Delivered" },

  // Player suggestions
  suggested: { cls: "bg-purple-100 text-purple-700", label: "Suggested" },
  accepted:  { cls: "bg-green-100 text-green-700",   label: "Accepted" },
  rejected:  { cls: "bg-red-100 text-red-500",       label: "Rejected" },
};

/** Turns an unmapped camelCase status into readable words rather than showing it raw. */
const humanize = (s: string) =>
  s.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase()).trim();

export default function StatusPill({ status }: { status: string }) {
  const entry = map[status];
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
      entry?.cls || "bg-slate-100 text-slate-600"
    }`}>
      {entry?.label || humanize(status)}
    </span>
  );
}