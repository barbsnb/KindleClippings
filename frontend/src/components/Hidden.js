import React, { useEffect } from 'react';
import { useClippings } from '../contexts/ClippingsContext';
import { format, parseISO } from 'date-fns';
import './ClippingList.css';
import { EyeClosed, Trash2, Loader2 } from 'lucide-react';

const HiddenList = () => {
  const {
    clippings,
    loading,
    error,
    unhideClipping,
    setFilters,
    setClippings,
    deleteClipping
  } = useClippings();

  if (loading) return <div className="loader-wrapper"><Loader2 /></div>;
  if (error) return <div className="error">Error loading clippings: {error.message}</div>;

  // Przywracanie widoczności
  const handleUnhide = async (clip) => {
    try {
      unhideClipping(clip.id); 
    } catch (error) {
      console.error('Error restoring clipping:', error);
    }
  };

  // Trwałe usunięcie z bazy
  const handleDelete = async (clip) => {
    deleteClipping(clip.id);
  };

  return (
    <div className="clipping-list">
      <h2 className="clipping-heading">Hidden Clippings</h2>

      {clippings.length === 0 ? (
        <p>No hidden clippings found.</p>
      ) : (
        <div className="clipping-grid">
          {clippings.map((clip) => (
            <div key={clip.id} className="clipping-card">
              <div className="clipping-header">
                <div className="book-title">{clip.book.title}</div>
                <div className="book-author">by {clip.book.author.name}</div>
              </div>

              <div className="clipping-content">
                {clip.highlight && (
                  <div className="highlight-text">{clip.highlight}</div>
                )}
                {clip.note && (
                  <div className="note-text mt-2 text-gray-600 italic">
                    {clip.note}
                  </div>
                )}
              </div>

              <div className="clipping-footer flex justify-between items-center mt-2">
                <div className="clipping-actions flex items-center gap-3">
                  <EyeClosed
                    size={16}
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    title="Unhide"
                    onClick={() => handleUnhide(clip)}
                  />
                  <Trash2
                    size={16}
                    className="text-red-600 hover:text-red-800 cursor-pointer"
                    title="Delete permanently"
                    onClick={() => handleDelete(clip)}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  {clip.time ? format(parseISO(clip.time), 'dd MMM yyyy, HH:mm') : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HiddenList;
