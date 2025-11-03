import mongoose from 'mongoose';

export interface IUploadedImage {
  _id?: string;
  filename: string;
  originalName: string;
  s3Key: string;
  cloudFrontUrl: string;
  s3Url: string;
  fileSize: number;
  fileType: string;
  width?: number;
  height?: number;
  uploadMethod: 'direct' | 'signed-url';
  tags?: string[];
  description?: string;
  altText?: string;
  uploadedBy?: string;
  uploadedAt: Date;
  updatedAt: Date;
  isActive: boolean;
  etag?: string;
}

const uploadedImageSchema = new mongoose.Schema<IUploadedImage>({
  filename: {
    type: String,
    required: true,
    index: true
  },
  originalName: {
    type: String,
    required: true
  },
  s3Key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  cloudFrontUrl: {
    type: String,
    required: true,
    index: true
  },
  s3Url: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: [
      // images
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      // videos
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime',
      'video/x-msvideo'
    ]
  },
  width: {
    type: Number,
    default: null
  },
  height: {
    type: Number,
    default: null
  },
  uploadMethod: {
    type: String,
    enum: ['direct', 'signed-url'],
    default: 'direct'
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  altText: {
    type: String,
    trim: true,
    maxlength: 200
  },
  uploadedBy: {
    type: String,
    default: 'anonymous'
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  etag: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
uploadedImageSchema.index({ uploadedAt: -1 });
uploadedImageSchema.index({ fileType: 1, isActive: 1 });
uploadedImageSchema.index({ tags: 1 });
uploadedImageSchema.index({ 'uploadedBy': 1, 'uploadedAt': -1 });

// Virtual for file size in human readable format
uploadedImageSchema.virtual('fileSizeFormatted').get(function() {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Virtual for relative upload time
uploadedImageSchema.virtual('uploadedAgo').get(function() {
  const now = new Date();
  const uploaded = new Date(this.uploadedAt);
  const diffInMs = now.getTime() - uploaded.getTime();
  
  const minutes = Math.floor(diffInMs / (1000 * 60));
  const hours = Math.floor(diffInMs / (1000 * 60 * 60));
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Pre-save middleware to update timestamps
uploadedImageSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods
uploadedImageSchema.statics.findByS3Key = function(s3Key: string) {
  return this.findOne({ s3Key, isActive: true });
};

uploadedImageSchema.statics.findByFileType = function(fileType: string) {
  return this.find({ fileType, isActive: true }).sort({ uploadedAt: -1 });
};

uploadedImageSchema.statics.findByTags = function(tags: string[]) {
  return this.find({ tags: { $in: tags }, isActive: true }).sort({ uploadedAt: -1 });
};

uploadedImageSchema.statics.getUploadStats = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalFiles: { $sum: 1 },
        totalSize: { $sum: '$fileSize' },
        avgSize: { $avg: '$fileSize' },
        fileTypes: { $addToSet: '$fileType' }
      }
    }
  ]);
};

// Ensure model is recompiled in dev/hot-reload environments
if (mongoose.models && mongoose.models.UploadedImage) {
  // Delete the cached model so the updated schema (enum additions) is applied
  delete mongoose.models.UploadedImage;
}

const UploadedImage = mongoose.models.UploadedImage || mongoose.model<IUploadedImage>('UploadedImage', uploadedImageSchema);

export default UploadedImage;