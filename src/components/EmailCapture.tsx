import { Button } from "@/components/ui/button";

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
            <a href="mailto:founders@onmarker.com?subject=Marker%20Demo%20Request">
              <Button>Request a Demo</Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
