export interface Post {
  id: string;
  text: string;
  author: string;
  date: string;
  likes: number;
  retweets: number;
  embedding?: number[];
}

export interface SearchResult {
  posts: Post[];
  totalCount: number;
}