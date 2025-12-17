import { connect } from "@/dbConfig/dbConfig";
import EventModel from "@/models/Event";
import { generatePresignedUrls } from "@/lib/s3-presigned";
import Link from "next/link";
import dynamic from "next/dynamic";

const GalleryGrid = dynamic(() => import("@/components/gallery/GalleryGrid"));

type PageProps = { params: Promise<{ slug: string }> };

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params; // slug param from URL
  await connect();

  // Try to find by slug first; if not found and slug looks like ObjectId, try by id
  let event = await EventModel.findOne({ slug }).populate("thumbnailImage").populate("galleryImages").lean();
  if (!event) {
    // fallback: if slug looks like an ObjectId, try as id
    const maybeId = slug;
    if (/^[0-9a-fA-F]{24}$/.test(maybeId)) {
      event = await EventModel.findById(maybeId).populate("thumbnailImage").populate("galleryImages").lean();
    }
  }

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

  // Generate signed URLs with error handling
  let signedMap = new Map<string, string>();
  try {
    if (imageKeys.length > 0) {
      signedMap = await generatePresignedUrls(imageKeys);
    }
  } catch (error) {
    console.error("Error generating presigned URLs:", error);
    // Continue without presigned URLs - images might still work with cloudFront URLs
  }

  for (let i = 0; i < imageKeys.length; i++) {
    const key = imageKeys[i];
    const url = signedMap.get(key) || `${process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN || process.env.CLOUDFRONT_DOMAIN}/${key}`;
    if (url) {
      images.push({ url, alt: (gallery[i] as any)?.altText || event.title });
    }
  }

  const thumbUrl = (event.thumbnailImage as any)?.fileUrl || (event.thumbnailImage as any)?.cloudFrontUrl || undefined;
  const dateStr = event.date ? new Date(event.date).toLocaleDateString() : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-4">
        <Link href="/gallery" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
          <span aria-hidden>←</span>
          <span>Back to gallery</span>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mt-1">{event.title}</h1>
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

      {images.length > 0 && (
        <GalleryGrid images={images} />
      )}
    </div>
  );
}
