import { shapeIndex } from "@/components/canvas/shapes";
import { StageController } from "@/components/ui/StageController";
import { TransitionLink } from "@/components/ui/TransitionLink";

export default function NotFound() {
  return (
    <section
      data-stage={shapeIndex("galaxy")}
      className="flex min-h-[100svh] flex-col items-start justify-end gap-8 px-gutter pb-12"
    >
      <p className="mono-label text-accent">Error 404</p>
      <h1 className="text-[clamp(4rem,18vw,20rem)] font-semibold uppercase leading-[0.8] tracking-[-0.06em]">
        Lost in
        <br />
        <span className="font-serif normal-case italic tracking-[-0.03em]">space.</span>
      </h1>
      <p className="max-w-[40ch] text-fg/70">
        This page drifted out of orbit. The particles are still here, though: move your pointer through them.
      </p>
      <TransitionLink href="/" transitionLabel="Home" className="pill pill-accent">
        Back to home ↗
      </TransitionLink>
      <StageController />
    </section>
  );
}
