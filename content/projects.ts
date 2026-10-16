export type Img = { src: string; width: number; height: number; alt: string };

export type GalleryRow =
  | { type: "wide"; image: Img; caption?: string }
  | { type: "pair"; images: [Img, Img]; caption?: string }
  | { type: "phones"; images: Img[]; caption?: string };

export type Project = {
  slug: string;
  title: string;
  kicker: string;
  tagline: string;
  summary: string;
  year: string;
  role: string;
  status: string;
  color: string;
  stack: string[];
  links: { live?: string; github?: string };
  cover: Img;
  overview: string;
  problem: string;
  highlights: { value: string; label: string }[];
  features: { title: string; body: string }[];
  gallery: GalleryRow[];
};

const desktop = (slug: string, name: string, alt: string, height = 1500): Img => ({
  src: `/work/${slug}/${name}.webp`,
  width: 2400,
  height,
  alt,
});
const mobile = (slug: string, name: string, alt: string): Img => ({
  src: `/work/${slug}/${name}.webp`,
  width: 780,
  height: 1688,
  alt,
});
const cover = (slug: string, alt: string): Img => desktop(slug, "cover", alt);

export const projects: Project[] = [
  {
    slug: "mellora-belle",
    title: "Mellora Belle",
    kicker: "E-commerce · Live",
    tagline: "A clothing store built end to end, and taking real orders.",
    summary:
      "Storefront, checkout, shipping and a 2FA-secured admin for a clothing label in Coimbatore.",
    year: "2026",
    role: "Solo: design, frontend, backend, ops",
    status: "Live in production",
    color: "#8a3d73",
    stack: ["React 19", "TypeScript", "Vite", "Tailwind CSS", "Express 5", "Prisma", "PostgreSQL", "Razorpay", "Shiprocket", "Resend", "Sentry", "Zod"],
    links: { live: "https://mellora-belle.vercel.app", github: "https://github.com/habul17/mellora-belle" },
    cover: cover("mellora-belle", "Mellora Belle storefront on desktop and mobile"),
    overview:
      "Mellora Belle sells designer kurthis and co-ord sets in bold floral prints, shipped across India from Coimbatore. I built every layer of it: the storefront customers browse, the checkout that takes their money, and the admin that runs the business behind it.",
    problem:
      "A small label doesn't need a catalogue. It needs payments it can trust, parcels out the door, an answer to 'where's my order?', and a way to handle the returns that will happen, all run by people who aren't developers.",
    highlights: [
      { value: "24", label: "schema migrations shipped" },
      { value: "2FA", label: "TOTP on the admin panel" },
      { value: "Live", label: "real payments and shipping" },
    ],
    features: [
      {
        title: "Checkout that holds stock",
        body: "Razorpay payments with stock reserved during checkout. Reservations that expire are released automatically, so an abandoned payment never locks a size away.",
      },
      {
        title: "The whole order lifecycle",
        body: "Confirmation and status emails through Resend, Shiprocket shipments, cancellations, returns, refunds and replacements, each one a real state in the order model.",
      },
      {
        title: "Accounts without friction",
        body: "Passwords or one-time email codes, password resets, refresh tokens, and a guest cart that merges into your account when you sign in.",
      },
      {
        title: "An admin you can trust",
        body: "Orders, products, stock and security in one panel. TOTP two-factor auth with QR setup, and an audit log of every admin action.",
      },
      {
        title: "Hardened by default",
        body: "Zod validation on every input, rate limits, Helmet security headers and Sentry monitoring in production.",
      },
      {
        title: "Built for India",
        body: "Indian states and pricing, shipping rules, and the policy pages Indian e-commerce requires, including a grievance officer.",
      },
    ],
    gallery: [
      { type: "wide", image: desktop("mellora-belle", "home", "Mellora Belle home page"), caption: "The storefront: editorial type, real product photography." },
      {
        type: "phones",
        images: [
          mobile("mellora-belle", "mobile-home", "Mellora Belle home on mobile"),
          mobile("mellora-belle", "mobile-product", "A product page on mobile"),
        ],
        caption: "Mobile first: most orders come from phones.",
      },
      { type: "wide", image: desktop("mellora-belle", "shop", "The shop page with filters and sorting") },
      { type: "wide", image: desktop("mellora-belle", "product", "Product detail with size selection") },
    ],
  },
  {
    slug: "ember",
    title: "Ember",
    kicker: "Productivity · Web app",
    tagline: "Plan a course day by day, tick rows off, keep the streak alive.",
    summary:
      "A planner for courses that are still being released, where nobody knows how many videos there will be.",
    year: "2026",
    role: "Solo: product, design, full-stack",
    status: "Deployed on Vercel",
    color: "#e0641c",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "Prisma", "PostgreSQL", "Auth.js", "Vitest", "Vercel"],
    // Add `live` back once Vercel Deployment Protection is turned off for this project.
    links: { github: "https://github.com/habul17/ember" },
    cover: cover("ember", "Ember activity heatmap and course list"),
    overview:
      "Ember plans your way through a video course day by day. Each row is a date, a topic and a checkbox, and the list is your schedule, not a log of what already happened.",
    problem:
      "Live cohorts and growing DSA sheets don't have a known length, so every progress bar that assumes one is lying. I wanted a planner that never asks how big the course is.",
    highlights: [
      { value: "done ÷ planned", label: "a progress figure you control" },
      { value: "OAuth", label: "Google and GitHub via Auth.js" },
      { value: "Tested", label: "date logic covered by Vitest" },
    ],
    features: [
      {
        title: "Progress you control",
        body: "Progress is done ÷ rows you've entered. Plan ten more days and 15/30 becomes 15/40, so the number is always one you can explain.",
      },
      {
        title: "Rescheduling that respects history",
        body: "Moving a row asks whether to move it alone or re-lay every unfinished row after it onto consecutive days. Completed rows never move.",
      },
      {
        title: "Streaks that can't be faked",
        body: "Streaks and heatmaps run off when you actually ticked the box, never the date written on the row, so rescheduling can't rewrite your history.",
      },
      {
        title: "Fast to fill",
        body: "Paste a list of titles, one per line, pick how many days each spans, done. Undo on every destructive action.",
      },
    ],
    gallery: [
      { type: "wide", image: desktop("ember", "home", "A course planned day by day with today's divider") },
      {
        type: "phones",
        images: [mobile("ember", "mobile", "Ember on mobile, dark"), mobile("ember", "mobile-light", "Ember on mobile, light")],
        caption: "Light and dark, desktop and phone.",
      },
      { type: "wide", image: desktop("ember", "profile", "Streaks, totals and a heatmap per course", 1250) },
    ],
  },
  {
    slug: "engram",
    title: "Engram",
    kicker: "Learning system · PWA",
    tagline: "Everything I learn, written down once, properly, and kept alive.",
    summary:
      "A spaced-review knowledge base where a note only earns its place after surviving interview-style questions.",
    year: "2026",
    role: "Solo: system design, content, site",
    status: "In daily use",
    color: "#1f9d63",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Markdown", "PWA", "Vercel"],
    links: { github: "https://github.com/habul17/engram" },
    cover: cover("engram", "Engram note and profile pages"),
    overview:
      "Engram is how I learn. Every note had to earn its place: I explain the idea back from memory with the docs closed, then survive interviewer-style follow-ups about it. Those questions stay in the note and come back on every review.",
    problem:
      "I read a lot, kept notes in six places, and couldn't defend any of it three weeks later. Finding material was never the problem. Keeping it was.",
    highlights: [
      { value: "29", label: "domains in a fixed taxonomy" },
      { value: "153", label: "sections, decided up front" },
      { value: "0", label: "backlog, by design" },
    ],
    features: [
      {
        title: "Notes have to earn their place",
        body: "Nothing is written down until it survives three 'why's in a row, including one that only makes sense if I understand the mechanism rather than the summary.",
      },
      {
        title: "Spaced review without a backlog",
        body: "Notes are ranked by how stale they are relative to their own interval. A missed day makes the next session smarter, not longer.",
      },
      {
        title: "The build is the linter",
        body: "Every note's path is fixed by the taxonomy before it is written. `npm run check` fails the build if any note breaks the template or the structure.",
      },
      {
        title: "A window, not an editor",
        body: "A read-only Next.js site renders the notes at build time: what I've learned, how solid each note is, and an activity heatmap. Installable as a PWA.",
      },
    ],
    gallery: [
      { type: "wide", image: desktop("engram", "note", "A note with its review status") },
      {
        type: "pair",
        images: [desktop("engram", "profile", "Profile with activity heatmap"), desktop("engram", "review", "Today's review queue")],
        caption: "The review queue is ranked by urgency, not by due date.",
      },
      { type: "wide", image: desktop("engram", "domain", "The JavaScript domain and its sections") },
    ],
  },
  {
    slug: "debt-tracker",
    title: "Debt Tracker",
    kicker: "Personal finance · PWA",
    tagline: "One question, every time you open it: how much more do I need to be free?",
    summary: "A mobile-first, local-first debt tracker where every number is derived from a single transaction log.",
    year: "2026",
    role: "Solo: product, design, frontend",
    status: "Installable PWA",
    color: "#3d6fd1",
    stack: ["React 19", "TypeScript", "Vite", "Tailwind CSS", "shadcn/ui", "dnd-kit", "Bun", "PWA"],
    links: { github: "https://github.com/habul17/Money-Tracker" },
    cover: cover("debt-tracker", "Debt Tracker home, debts and log screens"),
    overview:
      "A personal tracker for someone living off savings while paying down several debts. It's a tracker, not a planner: it tells you where you stand today and never forecasts.",
    problem:
      "Budgeting apps answer the wrong questions when you aren't earning. The number that matters is the gap between what you owe and what you have, and a payment to a creditor shouldn't look like a loss.",
    highlights: [
      { value: "1", label: "transaction log as the only truth" },
      { value: "0", label: "servers or accounts" },
      { value: "100%", label: "of totals derived, never stored" },
    ],
    features: [
      {
        title: "Three things to record",
        body: "Income, expenses and payments, each with a clear rule. A payment converts cash into progress, so the shortfall doesn't flinch when you pay a creditor.",
      },
      {
        title: "The log is the only truth",
        body: "Cash, total debt, shortfall and every progress bar are derived from the log on each render. Nothing is stored, so nothing can drift out of sync.",
      },
      {
        title: "Priority by drag",
        body: "Drag debts into the order you'll pay them. Cleared debts still count toward progress; archived ones keep their history intact.",
      },
      {
        title: "Local-first, on purpose",
        body: "No server, no account. Everything lives on the device, with JSON export and a validated import for backups. Installs to your home screen.",
      },
    ],
    gallery: [
      {
        type: "phones",
        images: [
          mobile("debt-tracker", "home", "Home: how much more you need"),
          mobile("debt-tracker", "debts", "Debts in payoff order"),
          mobile("debt-tracker", "log", "The transaction log"),
        ],
        caption: "Home, debts and the log: every number on the first two is derived from the third.",
      },
    ],
  },
  {
    slug: "days-left",
    title: "Days Left",
    kicker: "Desktop app · Python",
    tagline: "A minimal GNOME wallpaper that counts down the year and redraws itself at midnight.",
    summary: "Pillow renders it, a GTK 4 app styles it, a systemd timer keeps it current.",
    year: "2026",
    role: "Solo: design and development",
    status: "GNOME 50 · Ubuntu 26.04",
    color: "#3a944a",
    stack: ["Python", "Pillow", "GTK 4", "libadwaita", "GSettings", "systemd"],
    links: { github: "https://github.com/habul17/daysleft" },
    cover: cover("days-left", "Days Left wallpaper showing the year in dots"),
    overview:
      "Days Left is a wallpaper that shows how many days are left in the year. It redraws itself every midnight, and a small settings app lets you choose how it looks.",
    problem:
      "A year goes faster when you can't see it. I wanted the countdown somewhere I'd look a hundred times a day, without another app to open.",
    highlights: [
      { value: "4", label: "styles, from dots to a progress ring" },
      { value: "00:00", label: "redraws itself every midnight" },
      { value: "Tested", label: "year maths and rendering" },
    ],
    features: [
      {
        title: "Four styles",
        body: "Corner, Centered, Year in dots and Progress ring, showing days or weeks left, % of the year gone, or a challenge-day counter.",
      },
      {
        title: "Matches your system",
        body: "With Match system, GNOME gets a light and a dark wallpaper and switches with your system style. Accents follow GNOME's palette.",
      },
      {
        title: "Always current",
        body: "A systemd user timer runs just after midnight and catches up after sleep or shutdown.",
      },
      {
        title: "Leaves no trace",
        body: "Rendering, settings and the desktop backend are separate modules, and uninstalling restores the wallpaper you had before.",
      },
    ],
    gallery: [
      { type: "wide", image: { src: "/work/days-left/dots.webp", width: 1920, height: 1080, alt: "Year in dots style" } },
      {
        type: "pair",
        images: [
          { src: "/work/days-left/ring.webp", width: 1920, height: 1080, alt: "Progress ring style" },
          { src: "/work/days-left/challenge.webp", width: 1920, height: 1080, alt: "Challenge day counter" },
        ],
        caption: "Every image here is rendered by the app's own code.",
      },
      { type: "wide", image: { src: "/work/days-left/dots-light.webp", width: 1920, height: 1080, alt: "Year in dots, light theme" } },
    ],
  },
];

export const moreWork = [
  {
    title: "Higgsfield",
    description: "An AI avatar and video generation platform. In progress.",
    stack: "Turborepo · Bun · Prisma",
    year: "2026",
    href: "https://github.com/habul17/Higgsfield",
  },
  {
    title: "100xDevs Bootcamp",
    description: "Six backend apps from REST to JWT, MongoDB and Postgres, later hardened against SQL injection.",
    stack: "Express · JWT · PostgreSQL",
    year: "2026",
    href: "https://github.com/habul17/100xDevs-Bootcamp",
  },
  {
    title: "Trello Frontend",
    description: "Boards and cards with drag and drop.",
    stack: "React · TypeScript · react-dnd",
    year: "2026",
    href: "https://github.com/habul17/Trello-Frontend",
  },
  {
    title: "React Projects",
    description: "GitHub user search, a stopwatch and other small builds.",
    stack: "React · TypeScript · Vite",
    year: "2026",
    href: "https://github.com/habul17/React-Projects",
  },
  {
    title: "Cohort assignments",
    description: "Every weekly assignment from the 100xDevs cohort.",
    stack: "HTML · CSS · JavaScript",
    year: "2026",
    href: "https://github.com/habul17/100xDevs-assignment",
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
export const nextProject = (slug: string) => {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
};
