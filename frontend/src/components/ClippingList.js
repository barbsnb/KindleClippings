import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import Sidebar from './common/Sidebar';

const ClippingList = () => {
  const [clippings, setClippings] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8000/api/clippings/')
      .then(res => setClippings(res.data))
      .catch(console.error);
  }, []);

  const books = Array.from(new Set(clippings.map(clip => clip.book)));
  const filteredClippings = selectedBook
    ? clippings.filter(c => c.book === selectedBook)
    : [];

  return (
    <div className="flex h-screen">
      <Sidebar
        books={books}
        selectedBook={selectedBook}
        onSelect={setSelectedBook}
      />
      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">
          {selectedBook ? `Highlights from "${selectedBook}"` : 'Select a book'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClippings.map((clip) => (
            <div key={clip.id} className="border rounded p-4 shadow bg-white">
              <div className="text-sm text-gray-500 mb-2">
                {clip.time ? format(parseISO(clip.time), 'dd MMM yyyy, HH:mm') : null}
              </div>
              <p className="text-gray-800">{clip.highlight || clip.note}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ClippingList;
