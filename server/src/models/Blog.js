const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    excerpt: { type: String, trim: true },
    content: { type: String, required: true, trim: true },
    category: { type: String, trim: true, default: "General" },
    coverImage: { type: String, trim: true },
    published: { type: Boolean, default: true },
    seoTitle: { type: String, trim: true },
    seoDescription: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
