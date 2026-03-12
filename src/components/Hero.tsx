import { Button } from "@/components/ui/button";

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
          <a href="mailto:founders@onmarker.com?subject=Marker%20Demo%20Request">
            <Button size="lg">
              Request a Demo
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
