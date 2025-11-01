import { connect } from "@/dbConfig/dbConfig";
import EventModel from "@/models/Event";
import { generatePresignedUrls } from "@/lib/s3-presigned";
import Link from "next/link";

type PageProps = { params: Promise<{ id: string }> };

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params; // Next.js 15 requires awaiting params
  await connect();
  const event = await EventModel.findById(id)
    .populate("thumbnailImage")
    .populate("galleryImages")
    .lean();

  if (!event || event.isPublished === false) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-muted-foreground">Event not found.</p>
        <Link href="/gallery" className="text-primary underline mt-4 inline-block">Back to Gallery</Link>
      </div>
    );
  }

  const images = [] as { url: string; alt?: string }[];
  const gallery = Array.isArray(event.galleryImages) ? event.galleryImages : [];
  const imageKeys: string[] = [];
  for (const img of gallery as any[]) {
    if (img?.s3Key) imageKeys.push(img.s3Key);
  }

  const signedMap = imageKeys.length ? await generatePresignedUrls(imageKeys) : new Map<string, string>();
  for (let i = 0; i < imageKeys.length; i++) {
    const key = imageKeys[i];
    const url = signedMap.get(key);
    if (url) {
      images.push({ url, alt: (gallery[i] as any)?.altText || event.title });
    }
  }

  const thumbUrl = (event.thumbnailImage as any)?.fileUrl || (event.thumbnailImage as any)?.cloudFrontUrl || undefined;
  const dateStr = event.date ? new Date(event.date).toLocaleDateString() : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link href="/gallery" className="text-primary underline">← Back to Gallery</Link>

      <h1 className="text-3xl font-bold mt-4">{event.title}</h1>
      <div className="text-sm text-muted-foreground mt-2">
        {event.location ? <span>{event.location}</span> : null}
        {event.location && dateStr ? <span> • </span> : null}
        {dateStr ? <span>{dateStr}</span> : null}
      </div>

      {/* Main image: display the thumbnail as the primary image */}
      <div className="mt-6">
        {thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbUrl} alt={event.title} className="w-full h-80 sm:h-96 object-cover rounded-lg" />
        ) : (
          <div className="w-full h-80 bg-muted rounded-lg" />
        )}
      </div>

      {event.shortDescription ? (
        <p className="mt-6 text-lg">{event.shortDescription}</p>
      ) : null}

      {event.description ? (
        <div className="prose max-w-none mt-4 whitespace-pre-wrap">{event.description}</div>
      ) : null}

      {/* Additional images: displayed below the description */}
      {images.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Gallery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={img.url}
                alt={img.alt || `${event.title} image ${i + 1}`}
                className="w-full h-56 object-cover rounded-lg"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
