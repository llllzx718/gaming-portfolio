const META = {
  win: { label: '胜', tone: 'win' },
  loss: { label: '负', tone: 'loss' },
  draw: { label: '平', tone: 'draw' },
};

export function getResultMeta(result) {
  return META[result] ?? { label: String(result ?? '—'), tone: 'draw' };
}
