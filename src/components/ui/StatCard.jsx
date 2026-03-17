export default function StatCard({ title, value, hint = "", tone = "neutral" }) {
  const tones = {
    neutral: "bg-dinamita-panel2 border-dinamita-line",
    green: "bg-emerald-500/10 border-emerald-400/20",
    purple: "bg-violet-500/10 border-violet-400/20",
    blue: "bg-sky-500/10 border-sky-400/20",
    red: "bg-rose-500/10 border-rose-400/20",
  };

  return (
    <article className={`rounded-3xl border p-4 min-w-0 overflow-hidden ${tones[tone] || tones.neutral}`}>
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-dinamita-muted leading-tight">{title}</p>
          <p
            className="mt-3 min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap leading-none font-black text-[clamp(12px,1.2vw,18px)]"
            title={String(value)}
          >
            {value}
          </p>
          {hint ? (
            <p className="mt-2 text-xs text-dinamita-muted">{hint}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
