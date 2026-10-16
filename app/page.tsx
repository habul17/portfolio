import { About } from "@/components/sections/About";
import { Approach } from "@/components/sections/Approach";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Journey } from "@/components/sections/Journey";
import { MoreWork } from "@/components/sections/MoreWork";
import { Stack } from "@/components/sections/Stack";
import { Work } from "@/components/sections/Work";
import { StageController } from "@/components/ui/StageController";
import { site } from "@/content/site";

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.role,
  description: site.description,
  email: `mailto:${site.email}`,
  sameAs: site.socials.map((s) => s.href),
};

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Work />
      <MoreWork />
      <Approach />
      <Stack />
      <Journey />
      <Contact />
      <Footer />
      <StageController />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
    </>
  );
}
