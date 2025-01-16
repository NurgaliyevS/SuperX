import SearchInterface from '../components/SearchInterface';

export default function Home() {
  return (
    <main className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Semantic Search
        </h1>
        <SearchInterface />
      </div>
    </main>
  );
} 