import { mockPosts } from '../../lib/mock-data';
import { OpenAI } from 'openai';
import { MongoClient } from 'mongodb';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Connect to MongoDB
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db("superx");
    const collection = db.collection('posts');

    // Process each post
    const processedPosts = await Promise.all(
      mockPosts.map(async (post) => {
        // Generate embedding using text-embedding-3-small
        const embedding = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: post.text,
          encoding_format: "float"
        });

        console.log(post.id, 'post');
        console.log(embedding, 'embedding')

        return {
          ...post,
          date: new Date(post.date),
          embedding: embedding.data[0].embedding
        };
      })
    );

    // Insert all posts
    await collection.insertMany(processedPosts);
    
    await client.close();

    res.status(200).json({ 
      message: `Successfully added ${processedPosts.length} posts with embeddings`,
      postsCount: processedPosts.length
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      message: 'Error populating database', 
      error: error.message,
      details: error.response?.data || error.stack
    });
  }
}