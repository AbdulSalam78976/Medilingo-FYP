export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-lg rounded-tl-xs bg-paper border border-line shadow-card w-fit animate-fade-in">
      <span className="text-[12px] text-ink-4 font-mono">MediLingo is thinking</span>
      <div className="flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse-dot" style={{ animationDelay: '0s' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse-dot" style={{ animationDelay: '0.2s' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse-dot" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  );
}
