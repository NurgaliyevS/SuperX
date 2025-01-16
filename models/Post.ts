const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    index: true
  },
  author: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  likes: {
    type: Number,
    default: 0
  },
  retweets: {
    type: Number,
    default: 0
  },
  embedding: {
    type: [Number],
    required: true,
    index: true
  }
});

// Create vector search index
postSchema.index({ embedding: "2dsphere" });

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

export default Post; 