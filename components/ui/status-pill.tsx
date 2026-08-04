const map: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700", confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-500", completed: "bg-blue-100 text-blue-700",
  suggested: "bg-purple-100 text-purple-700", accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-500",
};

export default function StatusPill({ status }: { status: string }) {
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${map[status] || "bg-slate-100 text-slate-600"}`}>{status}</span>;
}