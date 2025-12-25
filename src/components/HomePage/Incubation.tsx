"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import type { CarouselApi } from "@/components/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Rocket } from "lucide-react";

const AUTOPLAY_INTERVAL = 3000;

function BackgroundDecorations() {
  return (
    <>
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-10 left-16 h-48 w-48 rounded-full bg-secondary/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 translate-x-20 rounded-full bg-accent/25 blur-[120px]"
        aria-hidden="true"
      />
    </>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="relative mx-auto max-w-3xl text-center">
      <span className="inline-flex items-center gap-2 rounded-full bg-primary/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-primary">
        <Rocket className="h-4 w-4" aria-hidden="true" />
        Incubation Journey
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 text-base text-muted-foreground sm:text-lg">
        {description}
      </p>
    </div>
  );
}

function StartupIndiaCardContent({ partner }: { partner: Partner }) {
  return (
    <div className="mt-5 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-8">
      <Image
        src={partner.logoSrc}
        alt={partner.name}
        width={220}
        height={88}
        className="h-30 w-auto object-contain drop-shadow-md"
      />
      <div className="max-w-sm text-balance text-left text-sm text-muted-foreground sm:text-base">
        <p className="font-semibold text-foreground">{partner.name}</p>
        <p className="mt-2">
          {partner.caption}{" "}
          <Link
            href={partner.href}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center text-primary hover:underline"
          >
            Learn more
          </Link>
        </p>
      </div>
    </div>
  );
}

function StartupIndiaCard({ partner }: { partner: Partner }) {
  return (
    <div className="relative mx-auto mt-14 max-w-3xl rounded-[28px] border border-primary/20 bg-linear-to-br from-background/95 via-primary/5 to-background/90 p-px shadow-[0_25px_60px_-35px_rgba(17,27,71,0.6)]">
      <div className="rounded-[27px] bg-card/90 p-8 text-center backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/80">
          National Accreditation
        </p>
        <StartupIndiaCardContent partner={partner} />
      </div>
    </div>
  );
}

type Partner = {
  name: string;
  href: string;
  logoSrc: string;
  caption: string;
};

const PARTNERS: Partner[] = [
  {
    name: "Riddl",
    href: "https://riidl.org/",
    logoSrc: "/assets/images/riidl.png",
    caption: "Catalysed by riidl Somaiya's deep-tech incubation network.",
  },
  {
    name: "MSSU",
    href: "https://mssu.ac.in/",
    logoSrc: "/assets/images/mssu-ispark-logo.jpg",
    caption:
      "Skill acceleration partner via Maharashtra State Skills University.",
  },
  {
    name: "CIEL",
    href: "https://www.chetanacollege.in/",
    logoSrc: "/assets/images/CIEL.png",
    caption:
      "Co-creating assistive innovation with CIEL's entrepreneurship lab.",
  },
];

function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={partner.href}
          target="_blank"
          rel="noreferrer noopener"
          className="group relative flex h-48 w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-6 text-center  ring-1 ring-border/40 transition-all duration-300 will-change-transform hover:-translate-y-2 hover:shadow-[0_28px_60px_-28px_rgba(18,30,73,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="absolute inset-0 bg-linear-to-br from-primary/12 via-transparent to-primary/20 opacity-0 transition" />
          <span
            className="pointer-events-none absolute inset-0 opacity-0 mix-blend-overlay transition "
            style={{
              background:
                "radial-gradient(120% 120% at 50% 0%, rgba(24,119,242,0.25) 0%, transparent 52%)",
            }}
          />
          <Image
            src={partner.logoSrc}
            alt={partner.name}
            width={220}
            height={88}
            className="relative z-10 h-20 w-auto object-contain "
          />
          <span className="relative z-10 text-sm font-medium leading-snug text-muted-foreground text-balance">
            {partner.caption}
          </span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={12}>
        {partner.name}
      </TooltipContent>
    </Tooltip>
  );
}

function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return prefersReducedMotion;
}

function useCarouselAutoplay(api: CarouselApi | undefined, interval: number) {
  const [isPaused, setIsPaused] = React.useState(false);
  const prefersReducedMotion = useReducedMotion();

  React.useEffect(() => {
    const shouldAutoplay = api && !prefersReducedMotion && !isPaused;
    if (!shouldAutoplay) return;

    const autoplayId = window.setInterval(() => {
      api.scrollNext();
    }, interval);

    return () => window.clearInterval(autoplayId);
  }, [api, isPaused, prefersReducedMotion, interval]);

  return { setIsPaused };
}

function PartnerCarousel({ partners }: { partners: Partner[] }) {
  const [api, setApi] = React.useState<CarouselApi>();
  const { setIsPaused } = useCarouselAutoplay(api, AUTOPLAY_INTERVAL);

  const handlePointerEnter = React.useCallback(
    () => setIsPaused(true),
    [setIsPaused]
  );
  const handlePointerLeave = React.useCallback(
    () => setIsPaused(false),
    [setIsPaused]
  );
  const handleFocus = React.useCallback(() => setIsPaused(true), [setIsPaused]);
  const handleBlur = React.useCallback(() => setIsPaused(false), [setIsPaused]);

  const duplicatedPartners = [...partners, ...partners];

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className="relative mt-12"
        onMouseEnter={handlePointerEnter}
        onMouseLeave={handlePointerLeave}
        onFocusCapture={handleFocus}
        onBlurCapture={handleBlur}
      >
        <Carousel
          opts={{ align: "start", loop: true }}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent className="-ml-4 md:-ml-6">
            {duplicatedPartners.map((partner, index) => (
              <CarouselItem
                key={`${partner.name}-${index}`}
                className="basis-full pl-4 sm:basis-1/2 md:basis-1/3 md:pl-6 lg:basis-1/3"
                aria-label={partner.name}
              >
                <PartnerCard partner={partner} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </TooltipProvider>
  );
}

const startupIndia: Partner = {
  name: "Startup India",
  href: "https://www.startupindia.gov.in/",
  logoSrc: "/assets/images/DPIIT.png",
  caption: "We are Startup India registered startup.",
};

function RecognitionHeader() {
  return (
    <div className="mt-20 text-center">
      <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Recognised by leading ecosystems
      </h2>
      <p className="mt-4 text-base text-muted-foreground sm:text-lg">
        Proudly <strong>incubated by Riddl, MSSU, and CIEL</strong>
        —communities accelerating inclusive innovation.
      </p>
    </div>
  );
}

export default function IncubationCarousel() {
  return (
    <section className="relative w-full overflow-hidden bg-background py-20">
      <BackgroundDecorations />

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Empowered by national innovation networks"
          description="We are a Startup India–registered and DPIIT-recognized startup"
        />

        <StartupIndiaCard partner={startupIndia} />

        <RecognitionHeader />

        <PartnerCarousel partners={PARTNERS} />
      </div>
    </section>
  );
}
