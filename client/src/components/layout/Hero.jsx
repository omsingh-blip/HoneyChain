import { Link } from "react-router";
export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">
        {/* Hero content */}
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-app-border bg-app-surface px-4 py-2 text-sm text-app-muted">
            <span className="size-2 rounded-full bg-forest" />
            Transparent honey supply chains
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-app-text sm:text-5xl lg:text-6xl">
            From Hive to Jar.
            <span className="mt-2 block text-honey">
              Every Step Verified.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-app-muted sm:text-lg">
            Track honey batches, manage your hives, and explore supply-chain
            records in one connected platform built for modern beekeeping.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">

            <Link
              to="/register"
              className="rounded-xl bg-honey px-6 py-3.5 font-semibold text-[#0B0D0C] transition hover:bg-honey-bright focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-honey"
            >
              Get Started
            </Link>


            <a
              href="#traceability"
              className="rounded-xl border border-app-border px-6 py-3.5 font-semibold text-app-text transition hover:bg-app-surface focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-honey"
            >
              Explore Traceability
            </a>
          </div>

          <p className="mt-5 text-xs leading-5 text-app-muted">
            Tamper-evident records for greater supply-chain transparency.
          </p>
        </div>

        {/* Circular mascot video */}
        <div className="relative mx-auto flex w-full max-w-md items-center justify-center lg:max-w-lg">
          <div
            aria-hidden="true"
            className="absolute inset-8 rounded-full bg-honey/10 blur-3xl"
          />

          <div className="relative aspect-square w-full overflow-hidden rounded-full border border-honey/60 bg-app-surface p-2 shadow-[0_0_60px_rgba(244,185,66,0.10)]">
            <div className="relative h-full w-full overflow-hidden rounded-full">
              <video
                className="h-full w-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                poster="/images/honeychain-mascot.png"
                aria-label="Animated HoneyChain bee mascot"
              >
                <source
                  src="/videos/honeychain-mascot.mp4"
                  type="video/mp4"
                />
              </video>

              {/* Fallback if the video has not been added yet */}
              <div className="absolute inset-0 -z-10 flex items-center justify-center bg-app-elevated">
                <span className="text-7xl" aria-hidden="true">
                  🐝
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
