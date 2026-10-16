// Everything personal on the site lives here and in ./projects.ts.
// Edit these values; the layout and animations adapt on their own.

export const site = {
  name: "Abul",
  role: "Full-stack developer",
  // Shown in search results and link previews.
  description:
    "Abul is a full-stack developer who builds products end to end, from the Postgres schema to the last pixel.",
  intro: "I build products end to end, from the Postgres schema to the last pixel.",
  location: "Earth",
  timezone: "Asia/Kolkata",
  timezoneLabel: "IST",
  availability: "Available for work",
  lookingFor: "a frontend or full-stack role at a product company",
  email: "abulhassanca.dev@gmail.com",
  socials: [
    { label: "GitHub", handle: "@habul17", href: "https://github.com/habul17" },
    { label: "X", handle: "@abulh_x", href: "https://x.com/abulh_x" },
    // { label: "LinkedIn", handle: "in/you", href: "https://www.linkedin.com/in/you" },
  ],
  nav: [
    { label: "Work", href: "/#work" },
    { label: "About", href: "/#about" },
    { label: "Stack", href: "/#stack" },
    { label: "Contact", href: "/#contact" },
  ],
} as const;

// The about paragraph lights up word by word. `em: true` renders in the accent serif.
export const about = {
  segments: [
    { text: "Hi, I'm Abul, a CS graduate and full-stack developer who builds products " },
    { text: "end to end.", em: true },
    {
      text: " My latest is a live store that takes real payments, ships across India and keeps its admin behind two-factor auth. I care about the parts users never see, ",
    },
    { text: "auth, money, data that can't drift,", em: true },
    { text: " as much as the pixels they do." },
  ],
  stats: [
    { value: 5, label: "products shipped since August 2026" },
    { value: 24, label: "schema migrations on a store in production" },
    { value: 21, label: "years old, and just getting started" },
  ],
} as const;

// Snippets are real code from each repo.
export const principles = [
  {
    title: "Derive, don't store.",
    body: "In Debt Tracker every number, from cash to debt to the shortfall, is worked out from one transaction log on each render. Fix a typo in the log and every screen corrects itself. Nothing to drift, nothing to reconcile.",
    source: "Debt Tracker",
    file: "src/core/ledger.ts",
    code: `export function deriveCash(transactions: Transaction[]): Paise {
  return transactions.reduce((cash, tx) => {
    switch (tx.kind) {
      case 'opening':
      case 'income':
        return cash + tx.amount
      case 'expense':
      case 'payment':
        return cash - tx.amount
      case 'adjustment':
        return cash
    }
  }, 0)
}`,
  },
  {
    title: "Security isn't a feature you add later.",
    body: "I went back through my bootcamp apps and fixed what I could now see: plain-text passwords became bcrypt hashes, string-built SQL became parameterised queries. Mellora Belle's admin sits behind TOTP two-factor auth with an audit log.",
    source: "100xDevs · Mellora Belle",
    file: "06-todo-with-postgres/index.js",
    code: `// Only the bcrypt hash is stored, never the password itself
const hashedPassword = await bcrypt.hash(password, 10);

// $1 keeps the input out of the SQL string
const response = await pool.query(
  'SELECT id, password FROM users WHERE email = $1',
  [email]
);`,
  },
  {
    title: "Understand it well enough to defend it.",
    body: "Engram only accepts a note once I can explain it with the docs closed and survive three 'why's in a row. Fluent isn't the bar. Surviving the follow-up question is.",
    source: "Engram",
    file: "notes/JavaScript/Async/The event loop….md",
    code: `## Probes

- \`setTimeout(fn, 0)\` is described as
  "run immediately". Why does a promise
  callback still beat it?
- What happens to the page if a \`.then\`
  handler queues another promise forever?`,
  },
  {
    title: "Design for how people actually behave.",
    body: "Ember never asks how long your course is, because nobody knows. Rescheduling can't rewrite your streak, because the streak runs off when you really ticked the box.",
    source: "Ember",
    file: "src/lib/stats.ts",
    code: `export function currentStreak(counts, today) {
  let cursor = counts.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (counts.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}`,
  },
] as const;

export const stack = {
  marquee: [
    ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Prisma", "Tailwind CSS", "Express"],
    ["Auth.js", "Razorpay", "Vitest", "Zod", "Vercel", "MongoDB", "Turborepo", "Python"],
  ],
  groups: [
    {
      title: "Frontend",
      items: ["TypeScript", "React 19", "Next.js (App Router)", "Vite", "Tailwind CSS", "shadcn/ui · Radix", "dnd-kit", "React Router"],
    },
    {
      title: "Backend",
      items: ["Node.js", "Express 5", "REST API design", "Auth.js · JWT", "TOTP two-factor auth", "Zod validation", "Rate limiting · Helmet"],
    },
    {
      title: "Data & infra",
      items: ["PostgreSQL", "Prisma", "MongoDB", "Vercel", "Turborepo", "Sentry · Resend", "Razorpay · Shiprocket"],
    },
    {
      title: "Tools",
      items: ["Git", "pnpm · Bun", "Vitest", "ESLint", "Python · Pillow", "GTK 4 · systemd", "Linux", "Claude Code"],
    },
  ],
} as const;

export const journey = [
  {
    date: "Before",
    title: "CS graduate",
    body: "Finished a computer science degree with the fundamentals and a plan: a frontend role first, then a shot at the big product companies.",
  },
  {
    date: "Jul 2026",
    title: "The 100xDevs cohort",
    body: "Six backend projects in order: REST, JWT auth, MongoDB, PostgreSQL. Later I went back and fixed what I could now see, from plain-text passwords to an SQL injection.",
  },
  {
    date: "Aug 2026",
    title: "First commit on Mellora Belle",
    body: "A real store for a clothing label: catalogue, cart and checkout, built from an empty repo.",
  },
  {
    date: "Sep 2026",
    title: "Three tools in one month",
    body: "Ember, Engram and Debt Tracker, each solving a problem I actually had. Started Higgsfield, an AI video platform, as a Turborepo monorepo.",
  },
  {
    date: "Oct 2026",
    title: "Shipping for real",
    body: "Mellora Belle takes real orders with Razorpay, Shiprocket, returns and a 2FA admin. Built Days Left for GNOME in Python on the side.",
  },
  {
    date: "Next",
    title: "Your team?",
    body: "I'm looking for a frontend or full-stack role at a product company. If that's you, let's talk.",
  },
] as const;
