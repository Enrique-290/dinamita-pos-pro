export default function StatCard({ title, value, hint, tone = "red" }) {
  const tones = {
    red: "from-red-700/30 to-red-500/10 border-red-700/30",
    green: "from-emerald-600/30 to-emerald-500/10 border-emerald-600/30",
    purple: "from-fuchsia-600/30 to-fuchsia-500/10 border-fuchsia-600/30",
    blue: "from-indigo-600/30 to-indigo-500/10 border-indigo-600/30",
    neutral: "from-white/5 to-white/[.02] border-dinamita-line",
  };

  return (
    <div className={`rounded-3xl border bg-gradient-to-br ${tones[tone]} p-5 shadow-soft`}>
      <p className="text-sm text-dinamita-muted">{title}</p>
      <p className="text-4xl font-black mt-3 leading-none">{value}</p>
      {hint ? <p className="text-xs text-dinamita-muted mt-3">{hint}</p> : null}
    </div>
  );
}
