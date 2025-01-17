import { MongoClient } from 'mongodb';
import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Function to generate embeddings
async function getEmbedding(text: string) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text.trim(),
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let client;
  try {
    const { query, limit = 10 } = req.body;

    if (!query?.trim()) {
      return res.status(400).json({ message: 'Query is required' });
    }

    // Generate embedding for search query
    const queryEmbedding = await getEmbedding(query);

    // Connect to MongoDB
    client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db("superx");
    const collection = db.collection('posts');

    // Perform vector search
    const results = await collection.aggregate([
      {
        $vectorSearch: {
          index: "embedding",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: limit * 2,
          limit: limit
        }
      },
      {
        $project: {
          _id: 0,
          id: 1,
          text: 1,
          author: 1,
          date: 1,
          likes: 1,
          retweets: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]).toArray();

    return res.status(200).json({
      results,
      totalResults: results.length,
    });

  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  } finally {
    // Always close the client connection
    if (client) {
      await client.close();
    }
  }
}