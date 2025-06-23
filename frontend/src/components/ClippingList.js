import React, { useState } from 'react';
import { useBooks } from '../contexts/BooksContext';
import { useAuthors } from '../contexts/AuthorsContext';
import { useClippings } from '../contexts/ClippingsContext';
import { format, parseISO } from 'date-fns';
import './ClippingList.css';
import { Eye, Pencil, Save } from 'lucide-react';


const ClippingList = () => {
  const { clippings, loading, error, hideClipping, updateClipping } = useClippings();
  const { updateBook } = useBooks();
  const { updateAuthor } = useAuthors();
  
  const [editingId, setEditingId] = useState(null);
  const [editedValues, setEditedValues] = useState({
    book: { id: null, title: '' },
    author: { id: null, name: '' },
  });

  const [originalValues, setOriginalValues] = useState({
    book: { id: null, title: '' },
    author: { id: null, name: '' },
  });

  const [searchTerm, setSearchTerm] = useState('');

  const filteredClippings = clippings.filter((clip) =>
    (clip.highlight && clip.highlight.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (clip.note && clip.note.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="loading">Loading clippings...</div>;
  if (error) return <div className="error">Error loading clippings: {error.message}</div>;

  const handleVisibilityClick = async (clip) => {
    try {
      await fetch(`/api/clippings/${clip.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visibility: false }),
      });
      hideClipping(clip.id);
    } catch (error) {
      console.error('Error hiding clipping:', error);
    }
  };

  const handleEditClick = (clip) => {
    console.log('clip in handleEditClick:', clip);
    if (!clip) {
      console.error('clip is undefined or null!');
      return;
    }
    if (!clip.book) {
      console.error('clip.book is undefined or null!', clip);
      return;
    }
    if (!clip.book.author) {
      console.error('clip.book.author is undefined or null!', clip);
      return;
    }

    setEditingId(clip.id);
    setEditedValues({
      book: { id: clip.book.id, title: clip.book.title },
      author: { id: clip.book.author.id, name: clip.book.author.name },
    });
    setOriginalValues({
      book: { id: clip.book.id, title: clip.book.title },
      author: { id: clip.book.author.id, name: clip.book.author.name },
    });
  };

  const handleSave = async () => {
    try {
      let updatedBook = null;
      let updatedAuthor = null;

      if (editedValues.book.title !== originalValues.book.title) {
        const responseBook = await fetch(`http://localhost:8000/api/books/${editedValues.book.id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: editedValues.book.title }),
        });
        if (!responseBook.ok) throw new Error('Failed to update book');
        updatedBook = await responseBook.json();
        updateBook(updatedBook);
      }

      if (editedValues.author.name !== originalValues.author.name) {
        const responseAuthor = await fetch(`http://localhost:8000/api/authors/${editedValues.author.id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: editedValues.author.name }),
        });
        if (!responseAuthor.ok) throw new Error('Failed to update author');
        updatedAuthor = await responseAuthor.json();
        updateAuthor(updatedAuthor);
      }

      if (updatedBook || updatedAuthor) {
        clippings.forEach((clip) => {
          if (updatedBook && clip.book.id === updatedBook.id) {
            // Jeśli mamy nową książkę, aktualizujemy ją
            let newAuthor = clip.book.author;
            if (updatedAuthor && updatedAuthor.id === clip.book.author.id) {
              // Jeśli mamy nowego autora i pasuje do autora tej książki
              newAuthor = updatedAuthor;
            } else if (updatedBook.author) {
              // Jeśli nie ma aktualizacji autora, ale updatedBook ma autora, użyjemy go
              newAuthor = updatedBook.author;
            }
            updateClipping({ ...clip, book: { ...updatedBook, author: newAuthor } });
          } else if (updatedAuthor && clip.book.author.id === updatedAuthor.id) {
            // Jeśli tylko autor się zmienił, ale książka nie
            updateClipping({ ...clip, book: { ...clip.book, author: updatedAuthor } });
          }
        });
      }

      setEditingId(null);
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };


  return (
    <div className="clipping-list">
      {/* input do filtrowania */}
      <input
        type="text"
        className="clipping-filter"
        placeholder="Filter clippings by text..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {filteredClippings.length === 0 ? (
        <p>No clippings found.</p>
      ) : (
        <div className="clipping-grid">
          {filteredClippings.map((clip) => (
            <div key={clip.id} className="clipping-card">
              <div className="clipping-header">
                {editingId === clip.id ? (
                  <>
                    <input
                      value={editedValues.book.title}
                      onChange={(e) =>
                        setEditedValues((prev) => ({
                          ...prev,
                          book: { ...prev.book, title: e.target.value },
                        }))
                      }
                    />
                    <input
                      value={editedValues.author.name}
                      onChange={(e) =>
                        setEditedValues((prev) => ({
                          ...prev,
                          author: { ...prev.author, name: e.target.value },
                        }))
                      }
                    />
                  </>
                ) : (
                  <>
                    <div className="book-title">{clip.book.title}</div>
                    <div className="book-author">by {clip.book.author.name}</div>
                  </>
                )}
              </div>

              <div className="clipping-content">{clip.highlight || clip.note}</div>

              <div className="clipping-footer flex justify-between items-center mt-2">
                <div className="clipping-actions">
                  {editingId === clip.id ? (
                    <Save
                      size={15}
                      className="text-green-600 hover:text-green-800 cursor-pointer"
                      onClick={() => handleSave(clip.id)}
                    />
                  ) : (
                    <Pencil
                      size={15}
                      className="text-gray-600 hover:text-black cursor-pointer"
                      onClick={() => handleEditClick(clip)}
                    />
                  )}
                  <Eye
                    size={16}
                    style={{ marginLeft: '5px' }}
                    className="text-gray-600 hover:text-black cursor-pointer ml-2"
                    onClick={() => handleVisibilityClick(clip)}
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

export default ClippingList;
