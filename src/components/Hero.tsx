export default function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24 md:py-32">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          Your always-on
          <br />
          <span className="text-primary">supply chain coordinator</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground md:text-xl">
          Marker is an AI-powered orchestrator that keeps things moving before
          you have to. It syncs data across your systems, tracks handoffs and
          deadlines, and moves work forward autonomously.
        </p>
        <div className="mt-10">
          <a
            href="mailto:founders@onmarker.com?subject=Marker%20Demo%20Request"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Request a Demo
          </a>
        </div>
      </div>
    </section>
  );
}
