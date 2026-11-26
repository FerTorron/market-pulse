// Order of the "How I built it" timeline and the evidence behind each phase.
// The copy lives in src/i18n/locales; this file only holds what isn't translated: order and file paths.
import type { Messages } from '@/i18n/translations.ts';

export type PhaseId = keyof Messages['process']['phases'];

export interface Phase {
  id: PhaseId;
  /** Phase 0 was done by the author before Claude Code (analysis of the brief). */
  byAuthor?: boolean;
  evidence: { path: string; kind: 'file' | 'folder' }[];
}

export const PHASES: Phase[] = [
  { id: 'brief', byAuthor: true, evidence: [{ path: 'research/PROCESS.md', kind: 'file' }, { path: 'BRIEF.md', kind: 'file' }] },
  { id: 'plan', evidence: [{ path: 'research/PROCESS.md', kind: 'file' }, { path: 'BRIEF.md', kind: 'file' }, { path: 'CLAUDE.md', kind: 'file' }] },
  { id: 'data', evidence: [{ path: 'evidence/fase2-pipeline-run1.txt', kind: 'file' }, { path: 'data/processed/validation-report.json', kind: 'file' }] },
  { id: 'render', evidence: [{ path: 'scripts/lib/render.ts', kind: 'file' }, { path: 'evidence/market-report-render.txt', kind: 'file' }] },
  { id: 'agents', evidence: [{ path: '.claude/agents', kind: 'folder' }, { path: '.claude/commands/market-report.md', kind: 'file' }] },
  { id: 'run', evidence: [{ path: 'evidence/audit-eventos.md', kind: 'file' }, { path: 'research/audit.md', kind: 'file' }, { path: 'research/DECISIONS.md', kind: 'file' }] },
  { id: 'site', evidence: [{ path: 'site', kind: 'folder' }] },
];
