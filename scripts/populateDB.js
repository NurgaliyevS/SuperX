import { mockPosts } from '../lib/mock-data';
import connectDB from '../lib/mongodb';
import Post from '../models/Post';
import { generateEmbedding } from '../lib/openai';

async function populateDatabase() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing posts
    await Post.deleteMany({});
    console.log('Cleared existing posts');

    // Generate embeddings and insert posts
    for (const post of mockPosts) {
      const embedding = await generateEmbedding(post.text);
      
      await Post.create({
        text: post.text,
        author: post.author,
        date: new Date(post.date),
        likes: post.likes,
        retweets: post.retweets,
        embedding: embedding
      });
      
      console.log(`Created post for ${post.author}`);
    }

    console.log('Database populated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error populating database:', error);
    process.exit(1);
  }
}

populateDatabase(); 