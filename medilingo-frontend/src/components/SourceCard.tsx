import type { RetrievedDoc } from '../types/index';

interface SourceCardProps {
  source: RetrievedDoc;
}

function formatSourceName(raw: string): string {
  const filename = raw.split(/[\\/]/).pop() ?? raw;
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function SourceCard({ source }: SourceCardProps) {
  const name = formatSourceName(source.source);
  const pct = Math.round(source.similarity_score * 100);
  const barColor = pct >= 70 ? 'bg-green' : pct >= 50 ? 'bg-teal' : 'bg-amber';

  return (
    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xs bg-paper-2 border border-line">
      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center mt-0.5">
        <span className="font-mono text-[10px] text-blue font-medium">{source.rank}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium text-ink-2 truncate" title={name}>{name}</div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1 rounded-full bg-line overflow-hidden">
            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="font-mono text-[10px] text-ink-4 flex-shrink-0">{pct}%</span>
        </div>
      </div>
    </div>
  );
}

export default SourceCard;
