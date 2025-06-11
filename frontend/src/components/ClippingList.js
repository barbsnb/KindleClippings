import React from 'react';
import { useClippings } from '../contexts/ClippingsContext';
import { format, parseISO } from 'date-fns';
import './ClippingList.css';

const ClippingList = () => {
  const { clippings, selectedBookId, loading, error } = useClippings();

  if (loading) return <div className="loading">Loading clippings...</div>;
  if (error) return <div className="error">Error loading clippings: {error.message}</div>;

  return (
    <div className="clipping-list">
      {clippings.length === 0 ? (
        <p>No clippings found.</p>
      ) : (
        <div className="clipping-grid">
          {clippings.map((clip) => (
            <div key={clip.id} className="clipping-card">
              <div className="clipping-header">
                <div className="book-title">{clip.book}</div>
                <div className="book-author text-sm text-gray-600">by {clip.author}</div>
              </div>
              <div className="clipping-content">{clip.highlight || clip.note}</div>
              <div className="clipping-footer text-xs text-gray-500">
                {clip.time ? format(parseISO(clip.time), 'dd MMM yyyy, HH:mm') : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClippingList;
