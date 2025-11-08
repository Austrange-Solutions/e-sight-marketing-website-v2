import mongoose, { Schema, Document, Model } from "mongoose";

export interface EventDocument extends Document {
  title: string;
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

const EventModel: Model<EventDocument> =
  mongoose.models.Event || mongoose.model<EventDocument>("Event", EventSchema);

export default EventModel;
