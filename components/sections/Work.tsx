"use client";

import { useRef, type CSSProperties } from "react";
import { shapeIndex } from "@/components/canvas/shapes";
import { GLImage } from "@/components/ui/GLImage";
import { Magnetic } from "@/components/ui/Magnetic";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { projects, type Project } from "@/content/projects";
import { site } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { pad } from "@/lib/utils";

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <TransitionLink
      href={`/work/${project.slug}`}
      transitionLabel={project.title}
      data-cursor="view"
      data-cursor-label="View case"
      className="work-card group block w-full shrink-0 md:w-[min(60vw,calc((100svh-15rem)*1.6))]"
      style={{ "--project": project.color } as CSSProperties}
    >
      <GLImage
        src={project.cover.src}
        alt={project.cover.alt}
        width={project.cover.width}
        height={project.cover.height}
        sizes="(min-width: 768px) 60vw, 92vw"
        radius={14}
        className="aspect-[16/10] w-full"
      />
      <div className="mt-5 grid grid-cols-12 items-start gap-x-4 gap-y-2">
        <span className="mono-label col-span-2 pt-2 text-muted md:col-span-1">{pad(index + 1)}</span>
        <div className="col-span-10 md:col-span-8">
          <h3 className="text-[clamp(1.9rem,3.3vw,3.6rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
            {project.title}
            <span className="text-accent">.</span>
          </h3>
          <p className="mt-2 max-w-[46ch] text-[0.98rem] leading-snug text-fg/65">{project.summary}</p>
        </div>
        <div className="mono-label col-span-12 flex flex-wrap gap-x-4 gap-y-1 text-muted md:col-span-3 md:flex-col md:items-end md:pt-2 md:text-right">
          <span>{project.kicker}</span>
          <span>{project.year}</span>
          <span className="hidden text-fg transition-transform duration-500 group-hover:translate-x-1 md:inline">Case study →</span>
        </div>
      </div>
    </TransitionLink>
  );
}

export function Work() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const el = root.current!;
        const track = el.querySelector<HTMLElement>("[data-track]")!;
        const bar = el.querySelector<HTMLElement>("[data-progress]")!;
        const counter = el.querySelector<HTMLElement>("[data-index]")!;
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: "[data-pin]",
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.9,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              bar.style.transform = `scaleX(${self.progress})`;
              counter.textContent = pad(Math.min(projects.length, Math.round(self.progress * (projects.length - 1)) + 1));
            },
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="work" data-stage={shapeIndex("terrain")} className="relative">
      <div className="grid items-end gap-8 px-gutter pb-[7vh] pt-[16vh] md:grid-cols-12">
        <div className="md:col-span-8">
          <SectionLabel index="02" title="Selected work" />
          <h2 className="sr-only">Selected work</h2>
          <div aria-hidden className="mt-6">
            <Reveal type="chars" className="text-[clamp(3.4rem,11.5vw,13.5rem)] font-semibold uppercase leading-[0.8] tracking-[-0.06em]">
              Selected
            </Reveal>
            <Reveal
              type="chars"
              delay={0.15}
              className="font-serif text-[clamp(3.6rem,12vw,14rem)] italic leading-[0.8] tracking-[-0.03em]"
            >
              work
            </Reveal>
          </div>
        </div>
        <div className="md:col-span-4">
          <Reveal className="max-w-[34ch] text-[clamp(1.05rem,1.35vw,1.35rem)] leading-snug text-fg/75">
            Five things I shipped in 2026: a live store, three tools I use every day, and a wallpaper. Open one for the full story.
          </Reveal>
          <p className="mono-label mt-5 text-muted">({pad(projects.length)} projects)</p>
        </div>
      </div>

      <div data-pin className="relative md:h-[100svh] md:overflow-hidden">
        <div
          data-track
          className="flex flex-col gap-16 px-gutter pb-10 md:h-full md:flex-row md:items-center md:gap-[5vw] md:pb-0 md:pr-[8vw] md:will-change-transform"
        >
          {projects.map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} />
          ))}
          <div className="flex shrink-0 flex-col items-start justify-center gap-6 md:w-[30vw] md:items-center md:text-center">
            <p className="mono-label text-muted">There&apos;s more where that came from</p>
            <Magnetic>
              <a
                href={site.socials[0].href}
                target="_blank"
                rel="noreferrer"
                className="grid aspect-square w-[clamp(9rem,15vw,15rem)] place-items-center rounded-full border border-line text-center text-[clamp(1.1rem,1.5vw,1.5rem)] font-medium tracking-[-0.02em] transition-colors duration-500 hover:border-accent hover:bg-accent hover:text-bg"
              >
                <span>
                  All repos
                  <br />
                  on GitHub ↗
                </span>
              </a>
            </Magnetic>
          </div>
        </div>

        <div className="mono-label pointer-events-none absolute inset-x-0 bottom-6 hidden items-center gap-5 px-gutter text-muted md:flex">
          <span>
            <span data-index className="text-fg">
              01
            </span>{" "}
            / {pad(projects.length)}
          </span>
          <span className="h-px flex-1 bg-line">
            <span data-progress className="block h-full w-full origin-left scale-x-0 bg-fg" />
          </span>
          <span>Scroll →</span>
        </div>
      </div>
    </section>
  );
}
