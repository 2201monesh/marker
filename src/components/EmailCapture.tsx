export default function EmailCapture() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Ready to stop chasing and start shipping?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Get early access to Marker and see what an always-on supply chain coordinator can do for your team.
          </p>
          <div className="mt-8">
            <a
              href="mailto:founders@onmarker.com?subject=Marker%20Demo%20Request"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Request a Demo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
