export function MobileBlocker() {
  return (
    /* Visible only below md (768 px) */
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center px-8 md:hidden bg-background">
      {/* Ambient glow */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      <div className="relative flex flex-col items-center text-center max-w-xs">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-7 h-7 text-indigo-300"
          >
            {/* Monitor icon */}
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-xl font-semibold tracking-tight text-foreground mb-2">
          Desktop Only
        </h1>

        {/* Body */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400 font-medium">
            Lumix3D
          </span>{" "}
          is a 3D design tool built for large screens. Please open it on a
          desktop or laptop for the best experience.
        </p>

        {/* Decorative divider */}
        <div className="flex items-center gap-3 w-full mb-6">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-xs text-muted-foreground/40">requires</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Requirement chips */}
        <div className="flex flex-wrap justify-center gap-2">
          {["1024px+ screen", "Mouse / trackpad", "Modern browser"].map(
            (req) => (
              <span
                key={req}
                className="px-2.5 py-1 rounded-full bg-white/5 border border-white/8 text-xs text-muted-foreground/70"
              >
                {req}
              </span>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
