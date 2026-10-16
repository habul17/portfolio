"use client";

import { useRef } from "react";
import { shapeIndex } from "@/components/canvas/shapes";
import { GLImage } from "@/components/ui/GLImage";
import { Magnetic } from "@/components/ui/Magnetic";
import { Reveal } from "@/components/ui/Reveal";
import { StageController } from "@/components/ui/StageController";
import { TransitionLink } from "@/components/ui/TransitionLink";
import type { GalleryRow, Img, Project } from "@/content/projects";
import { gsap, useGSAP } from "@/lib/gsap";
import { useUI } from "@/lib/store";
import { pad } from "@/lib/utils";
import { Footer } from "@/components/sections/Footer";

function Phone({ image }: { image: Img }) {
  return (
    <div className="rounded-[34px] border border-line bg-bg-2 p-2.5 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]">
      <GLImage
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes="(min-width: 768px) 26vw, 80vw"
        radius={26}
        className="aspect-[390/844] w-full"
      />
    </div>
  );
}

function Row({ row }: { row: GalleryRow }) {
  return (
    <figure className="flex flex-col gap-4">
      {row.type === "wide" && (
        <GLImage
          src={row.image.src}
          alt={row.image.alt}
          width={row.image.width}
          height={row.image.height}
          sizes="(min-width: 768px) 92vw, 100vw"
          radius={16}
          parallax={0.08}
          className="w-full"
        />
      )}
      {row.type === "pair" && (
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          {row.images.map((image) => (
            <GLImage
              key={image.src}
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(min-width: 768px) 46vw, 100vw"
              radius={14}
              className="w-full"
            />
          ))}
        </div>
      )}
      {row.type === "phones" && (
        <div className="mx-auto grid w-full max-w-[1100px] grid-cols-2 gap-4 md:flex md:justify-center md:gap-10">
          {row.images.map((image, i) => (
            <div key={image.src} className={i === 2 ? "col-span-2 mx-auto w-1/2 md:w-[24%]" : "md:w-[24%]"}>
              <Phone image={image} />
            </div>
          ))}
        </div>
      )}
      {row.caption && <figcaption className="mono-label text-muted">{row.caption}</figcaption>}
    </figure>
  );
}

export function CaseStudy({ project, index, total, next }: { project: Project; index: number; total: number; next: Project }) {
  const root = useRef<HTMLElement>(null);
  const introDone = useUI((s) => s.introDone);

  useGSAP(
    () => {
      if (!introDone) return;
      gsap.fromTo(
        "[data-case-fade]",
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 1.3, stagger: 0.06, delay: 0.55 },
      );
    },
    { scope: root, dependencies: [introDone] },
  );

  return (
    <article ref={root} className="relative">
      <section data-stage={shapeIndex("lattice")} className="relative flex min-h-[100svh] flex-col justify-end px-gutter pb-10 pt-[18vh]">
        <div data-case-fade className="mono-label mb-auto flex justify-between text-muted">
          <TransitionLink href="/#work" transitionLabel="Work" className="link-underline">
            ← All work
          </TransitionLink>
          <span>
            Case {pad(index + 1)} / {pad(total)}
          </span>
        </div>

        <p data-case-fade className="mono-label mb-5 text-accent">
          {project.kicker}
        </p>
        <Reveal
          as="h1"
          intro
          type="chars"
          delay={0.2}
          className="text-[clamp(3.3rem,12.5vw,15rem)] font-semibold uppercase leading-[0.8] tracking-[-0.06em]"
        >
          {project.title}
        </Reveal>
        <div className="mt-8 grid gap-8 md:grid-cols-12">
          <Reveal intro delay={0.45} className="text-[clamp(1.3rem,2.2vw,2.2rem)] leading-[1.15] tracking-[-0.03em] md:col-span-6">
            {project.tagline}
          </Reveal>
          <dl data-case-fade className="mono-label grid grid-cols-2 gap-x-6 gap-y-5 md:col-span-6 md:grid-cols-3">
            <div>
              <dt className="text-muted">Role</dt>
              <dd className="mt-1.5 normal-case tracking-normal text-fg">{project.role}</dd>
            </div>
            <div>
              <dt className="text-muted">Year</dt>
              <dd className="mt-1.5 text-fg">{project.year}</dd>
            </div>
            <div>
              <dt className="text-muted">Status</dt>
              <dd className="mt-1.5 text-fg">{project.status}</dd>
            </div>
            <div className="col-span-2 md:col-span-3">
              <dt className="text-muted">Stack</dt>
              <dd className="mt-1.5 flex flex-wrap gap-1.5">
                {project.stack.map((s) => (
                  <span key={s} className="rounded-full border border-line px-2.5 py-1 text-fg">
                    {s}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </div>
        <div data-case-fade className="mt-8 flex flex-wrap gap-3">
          {project.links.live && (
            <Magnetic>
              <a href={project.links.live} target="_blank" rel="noreferrer" className="pill pill-accent">
                Visit live site ↗
              </a>
            </Magnetic>
          )}
          {project.links.github && (
            <Magnetic>
              <a href={project.links.github} target="_blank" rel="noreferrer" className="pill">
                View the code ↗
              </a>
            </Magnetic>
          )}
        </div>
      </section>

      <section data-stage={shapeIndex("terrain")} data-dim="0.7" className="relative px-gutter">
        <GLImage
          src={project.cover.src}
          alt={project.cover.alt}
          width={project.cover.width}
          height={project.cover.height}
          sizes="100vw"
          radius={18}
          parallax={0.1}
          priority
          className="aspect-[16/10] w-full md:aspect-[16/9]"
        />
      </section>

      <section className="grid gap-y-16 px-gutter py-[16vh] md:grid-cols-12">
        <h2 className="mono-label text-muted md:col-span-3">Overview</h2>
        <Reveal className="text-[clamp(1.4rem,2.6vw,2.7rem)] leading-[1.15] tracking-[-0.03em] md:col-span-9">
          {project.overview}
        </Reveal>
        <h2 className="mono-label text-muted md:col-span-3">The problem</h2>
        <Reveal className="text-[clamp(1.15rem,1.7vw,1.7rem)] leading-[1.35] tracking-[-0.02em] text-fg/75 md:col-span-7">
          {project.problem}
        </Reveal>
      </section>

      <section className="grid grid-cols-1 border-y border-line md:grid-cols-3">
        {project.highlights.map((h, i) => (
          <div key={h.label} className={`px-gutter py-10 md:py-14 ${i ? "border-t border-line md:border-l md:border-t-0" : ""}`}>
            <Reveal className="text-[clamp(2.6rem,5vw,5.5rem)] font-light leading-none tracking-[-0.05em]">{h.value}</Reveal>
            <p className="mono-label mt-4 text-muted">{h.label}</p>
          </div>
        ))}
      </section>

      <section className="px-gutter py-[16vh]">
        <div className="mb-12 grid gap-6 md:grid-cols-12">
          <h2 className="mono-label text-muted md:col-span-3">What I built</h2>
          <Reveal as="p" type="words" className="text-[clamp(2.2rem,4.6vw,5rem)] font-semibold leading-[0.95] tracking-[-0.045em] md:col-span-9">
            Under the hood
          </Reveal>
        </div>
        <ol className="grid gap-x-10 md:ml-[25%] md:grid-cols-2">
          {project.features.map((f, i) => (
            <li key={f.title} className="border-t border-line py-8">
              <span className="mono-label text-accent">{pad(i + 1)}</span>
              <h3 className="mt-3 text-[clamp(1.35rem,1.9vw,1.9rem)] font-semibold leading-tight tracking-[-0.03em]">{f.title}</h3>
              <p className="mt-3 leading-relaxed text-fg/68">{f.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-[12vh] px-gutter pb-[16vh]">
        {project.gallery.map((row, i) => (
          <Row key={i} row={row} />
        ))}
      </section>

      <section data-stage={shapeIndex("core")} data-dim="1" className="relative border-t border-line">
        <TransitionLink
          href={`/work/${next.slug}`}
          transitionLabel={next.title}
          data-cursor="view"
          data-cursor-label="Next case"
          className="group grid items-end gap-10 px-gutter py-[14vh] md:grid-cols-12"
        >
          <div className="md:col-span-7">
            <span className="mono-label text-muted">Next project</span>
            <span className="mt-4 block text-[clamp(3.2rem,10vw,12rem)] font-semibold uppercase leading-[0.8] tracking-[-0.06em] transition-transform duration-700 group-hover:translate-x-4">
              {next.title}
            </span>
            <span className="mt-6 block max-w-[40ch] text-fg/65">{next.summary}</span>
          </div>
          <div className="md:col-span-5">
            <GLImage
              src={next.cover.src}
              alt={next.cover.alt}
              width={next.cover.width}
              height={next.cover.height}
              sizes="(min-width: 768px) 40vw, 92vw"
              radius={14}
              className="aspect-[16/10] w-full"
            />
          </div>
        </TransitionLink>
      </section>

      <Footer />
      <StageController dim={0.85} />
    </article>
  );
}
