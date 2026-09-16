import { getResultMeta } from '../lib/result';

const TONES = {
  win: 'text-cyan-300 border-cyan-400/30 bg-cyan-400/10',
  loss: 'text-rose-300/90 border-rose-400/20 bg-rose-400/10',
  draw: 'text-slate-300 border-slate-500/30 bg-slate-500/10',
};

export default function ResultBadge({ result }) {
  const meta = getResultMeta(result);
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-xs font-medium ${TONES[meta.tone]}`}
    >
      {meta.label}
    </span>
  );
}
