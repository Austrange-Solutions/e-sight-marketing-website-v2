import mongoose from 'mongoose';

export interface ReviewDocument extends mongoose.Document {
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  username: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new mongoose.Schema<ReviewDocument>({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

const Review = mongoose.models.Review || mongoose.model<ReviewDocument>('Review', reviewSchema);

export default Review;
