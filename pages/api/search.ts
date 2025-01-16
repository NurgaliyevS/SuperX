import connectDB from '../../lib/mongodb';
import Post from '../../models/Post';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function getEmbedding(text: string) {
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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { query, limit = 10, page = 1 } = req.body;

    // Get vector embedding for search query
    // Note: You'll need to implement getEmbedding function using your preferred embedding service
    const queryEmbedding = await getEmbedding(query);

    const skip = (page - 1) * limit;

    const pipeline = [
      {
        $search: {
          index: "default",
          knnBeta: {
            vector: queryEmbedding,
            path: "embedding",
            k: limit
          }
        }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ];

    const results = await Post.aggregate(pipeline);
    const totalResults = await Post.countDocuments();

    return res.status(200).json({
      results,
      totalResults,
      currentPage: page
    });

  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 