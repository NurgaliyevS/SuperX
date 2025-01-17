import { useState } from 'react';

export default function PopulateDB() {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handlePopulate = async () => {
    try {
      setStatus('loading');
      const response = await fetch('/api/populate-db', {
        method: 'POST'
      });
      
      const data = await response.json();
      setMessage(data.message);
      setStatus('success');
    } catch (error) {
      setMessage(error.message);
      setStatus('error');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Populate Database</h1>
      
      <button 
        onClick={handlePopulate}
        disabled={status === 'loading'}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
      >
        {status === 'loading' ? 'Processing...' : 'Populate DB'}
      </button>

      {message && (
        <div className={`mt-4 p-4 rounded ${
          status === 'error' ? 'bg-red-100' : 'bg-green-100'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}