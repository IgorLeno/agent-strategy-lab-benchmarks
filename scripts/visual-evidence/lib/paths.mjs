const ABSOLUTE_MARKERS = [
  '/home/plasma-test',
  '/Users/',
  'C:\\',
  'C:/',
];

const FORBIDDEN_IDENTITY = /\b(direct|agentlab|agent-lab|agent_lab)\b/i;

export function containsAbsoluteLocalPath(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  if (ABSOLUTE_MARKERS.some((marker) => text.includes(marker))) return true;
  if (/(^|["'\s])\/home\/[^/\s"']+/.test(text)) return true;
  return false;
}

export function assertNoAbsoluteLocalPath(value, label) {
  if (containsAbsoluteLocalPath(value)) {
    throw new Error(`${label} contém path absoluto local`);
  }
}

export function assertBlindCandidateId(candidateId) {
  if (!candidateId || typeof candidateId !== 'string') {
    throw new Error('candidate_id ausente');
  }
  if (FORBIDDEN_IDENTITY.test(candidateId)) {
    throw new Error(`candidate_id não pode revelar o braço: ${candidateId}`);
  }
}

export function isBlindSafeText(value) {
  return !FORBIDDEN_IDENTITY.test(String(value ?? ''));
}
