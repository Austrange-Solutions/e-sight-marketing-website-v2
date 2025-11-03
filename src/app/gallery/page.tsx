import { connect } from "@/dbConfig/dbConfig";
import EventModel from "@/models/Event";
import Link from "next/link";
import GalleryHero from "@/components/gallery/GalleryHero";
import { tr } from "zod/v4/locales";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

async function getEvents() {
  await connect();
  const events = await EventModel.find({ isPublished: true })
    .sort({ date: -1, createdAt: -1 })
    .populate("thumbnailImage")
    .lean();
  return events as any[];
}

export default async function GalleryPage() {
  const events = await getEvents();
  return (
    <div className="max-w-full mt-5 my-4 mt-11 mx-auto">
      {/* <h1 className="text-3xl font-bold text-center mb-6">Event Gallery</h1> */}
      <GalleryHero />
      {events.length === 0 ? (
        <p className="text-muted-foreground">No events yet. Please check back soon.</p>
      ) : (
        <div className=" mt-15 px-10 mx-auto max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => {
            const thumb = (ev.thumbnailImage as any)?.fileUrl || (ev.thumbnailImage as any)?.cloudFrontUrl;
            const dateStr = ev.date ? new Date(ev.date).toLocaleDateString() : null;
            return (
              <Link key={String(ev._id)} href={`/gallery/${ev._id}`} className="group rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt={ev.title} className="h-48 w-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                ) : (
                  <div className="h-48 w-full bg-muted" />
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-lg line-clamp-1">{ev.title}</h3>
                  <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {ev.location ? <span>{ev.location}</span> : null}
                    {ev.location && dateStr ? <span> • </span> : null}
                    {dateStr ? <span>{dateStr}</span> : null}
                  </div>
                  {ev.shortDescription ? (
                    <p className="text-sm mt-2 line-clamp-3">{ev.shortDescription}</p>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
