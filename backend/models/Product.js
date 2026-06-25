const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, default: '' },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ['Electronics', 'Clothing', 'Books', 'Accessories', 'Sports'],
    },
    stock: { type: Number, required: true, default: 0, min: 0 },
    image: { type: String, default: '' },
    ratings: [ratingSchema],
    avgRating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Recompute average rating from the ratings array
productSchema.methods.computeAvgRating = function () {
  if (!this.ratings || this.ratings.length === 0) {
    this.avgRating = 0;
  } else {
    const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
    this.avgRating = Math.round((sum / this.ratings.length) * 10) / 10;
  }
  return this.avgRating;
};

module.exports = mongoose.model('Product', productSchema);
