import mongoose, { Schema, Document, Model } from "mongoose";

export interface EventDocument extends Document {
  title: string;
  slug?: string;
  location?: string;
  date?: Date;
  participants?: string;
  shortDescription?: string;
  description?: string;
  thumbnailImage?: mongoose.Types.ObjectId; // ref UploadedImage
  galleryImages: mongoose.Types.ObjectId[]; // ref UploadedImage[]
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<EventDocument>(
  {
    title: { type: String, required: true, trim: true },
      // human-friendly URL slug (kebab-case). Auto-generated from title if not provided.
      slug: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    location: { type: String },
    date: { type: Date },
    participants: { type: String },
    shortDescription: { type: String },
    description: { type: String },
    thumbnailImage: { type: Schema.Types.ObjectId, ref: "UploadedImage" },
    galleryImages: [{ type: Schema.Types.ObjectId, ref: "UploadedImage" }],
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Generate a URL-friendly slug from title if not provided
function slugify(input: string) {
  return input
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 140);
}
EventSchema.pre('validate', async function (this: EventDocument, next) {
  try {
    // Only generate if slug is empty
    if (!this.slug && this.title) {
      const base = slugify(this.title);
      let candidate = base;
      let i = 1;
      const Model = (this.constructor as unknown) as Model<EventDocument>;
      // Ensure uniqueness by appending a numeric suffix when needed
      while (await Model.exists({ slug: candidate, _id: { $ne: this._id } })) {
        candidate = `${base}-${i++}`;
      }
      this.slug = candidate;
    }
    next();
  } catch (err) {
    next(err as any);
  }
});

const EventModel: Model<EventDocument> =
  mongoose.models.Event || mongoose.model<EventDocument>("Event", EventSchema);

export default EventModel;
