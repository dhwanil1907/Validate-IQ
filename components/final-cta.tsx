export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-[#000000] px-4 pb-0 pt-0 [font-family:var(--font-inter),system-ui,sans-serif]">
      <footer className="relative z-10 border-t border-[#2A2D35] px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 text-sm sm:flex-row sm:gap-4">
          <span className="font-semibold text-white">Verdict</span>
          <nav className="flex flex-wrap items-center justify-center gap-6">
            <a href="#" className="text-[#6B7280] transition-colors hover:text-white">
              Privacy
            </a>
            <a href="#" className="text-[#6B7280] transition-colors hover:text-white">
              Terms
            </a>
            <a href="#" className="text-[#6B7280] transition-colors hover:text-white">
              Twitter
            </a>
          </nav>
          <p className="text-center text-[#6B7280] sm:text-right">© 2026 Verdict. Built for builders.</p>
        </div>
      </footer>
    </section>
  )
}
