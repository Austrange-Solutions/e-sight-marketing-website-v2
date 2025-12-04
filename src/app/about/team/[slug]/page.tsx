import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Twitter, Linkedin, Mail, Globe } from "lucide-react";

import { getMemberBySlug, slugify, TEAM_MEMBERS } from "@/lib/team";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function MemberPage({ params }: Props) {
  const { slug } = await params;
  const member = getMemberBySlug(slug);

  if (!member) {
    // fallback: try to match without strict slug (sanity)
    const fallback = TEAM_MEMBERS.find((m) => slugify(m.name) === slug);
    if (!fallback) return notFound();
  }

  const m = member!;

  return (
    <main className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link href="/about" className="text-sm text-primary hover:underline">
          ← Back to About
        </Link>

        <div className="mt-6 rounded-xl bg-card p-8 shadow-lg">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="w-full md:w-48 flex-shrink-0 rounded-md overflow-hidden">
              <Image src={m.image} alt={m.name} width={320} height={320} className="h-48 w-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{m.name}</h1>
              <p className="mt-1 text-sm font-medium text-primary">{m.position}</p>
              <p className="mt-4 text-base text-muted-foreground">{m.description}</p>

              {m.social && (
                <div className="mt-6 flex gap-4">
                  {m.social.linkedin && (
                    <Link href={m.social.linkedin} target="_blank" rel="noreferrer noopener" className="group inline-flex items-center gap-2 rounded-md border border-border/50 bg-card/60 px-3 py-2 text-sm text-foreground transition hover:bg-primary/5">
                      <Linkedin className="h-4 w-4 text-primary" />
                      <span className="sr-only">LinkedIn</span>
                    </Link>
                  )}

                  {m.social.twitter && (
                    <Link href={m.social.twitter} target="_blank" rel="noreferrer noopener" className="group inline-flex items-center gap-2 rounded-md border border-border/50 bg-card/60 px-3 py-2 text-sm text-foreground transition hover:bg-primary/5">
                      <Twitter className="h-4 w-4 text-sky-500" />
                      <span className="sr-only">Twitter</span>
                    </Link>
                  )}

                  {m.social.email && (
                    <Link href={`mailto:${m.social.email}`} className="group inline-flex items-center gap-2 rounded-md border border-border/50 bg-card/60 px-3 py-2 text-sm text-foreground transition hover:bg-primary/5">
                      <Mail className="h-4 w-4 text-rose-500" />
                      <span className="sr-only">Email</span>
                    </Link>
                  )}

                  {m.social.website && (
                    <Link href={m.social.website} target="_blank" rel="noreferrer noopener" className="group inline-flex items-center gap-2 rounded-md border border-border/50 bg-card/60 px-3 py-2 text-sm text-foreground transition hover:bg-primary/5">
                      <Globe className="h-4 w-4 text-green-600" />
                      <span className="sr-only">Website</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
