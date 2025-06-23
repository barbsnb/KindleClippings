import React, { useState } from 'react';
import { useBooks } from '../contexts/BooksContext';
import { useAuthors } from '../contexts/AuthorsContext';
import { useClippings } from '../contexts/ClippingsContext';
import { format, parseISO } from 'date-fns';
import './ClippingList.css';
import { Eye, Pencil, Save,  Plus, Minus } from 'lucide-react';


const ClippingList = () => {
  const { clippings, loading, error, hideClipping, updateClipping } = useClippings();
  const { updateBook } = useBooks();
  const { updateAuthor } = useAuthors();
  
  // editing
  const [editingId, setEditingId] = useState(null);
  const [editedValues, setEditedValues] = useState({
    book: { id: null, title: '' },
    author: { id: null, name: '' },
  });

  const [originalValues, setOriginalValues] = useState({
    book: { id: null, title: '' },
    author: { id: null, name: '' },
  });

  //filters
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClippings = clippings.filter((clip) => {
    const textMatch =
      (clip.highlight && clip.highlight.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (clip.note && clip.note.toLowerCase().includes(searchTerm.toLowerCase()));

    const tagMatch =
      clip.tags &&
      clip.tags.some(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return textMatch || tagMatch;
  });

  //tags:
  const [openTagMenus, setOpenTagMenus] = useState({});
  const [newTagTextByClipId, setNewTagTextByClipId] = useState({});
  const [tagSuggestions, setTagSuggestions] = useState({});

  if (loading) return <div className="loading">Loading clippings...</div>;
  if (error) return <div className="error">Error loading clippings: {error.message}</div>;

  //visibility
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

  //editing
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

  //tags:
  const toggleTagMenu = (clipId) => {
    setOpenTagMenus((prev) => ({
      ...prev,
      [clipId]: !prev[clipId],
    }));
  };

  const handleAddTag = async (clipId) => {
    const newTagName = newTagTextByClipId[clipId]?.trim();
    if (!newTagName) return; // ignoruj puste tagi

    try {
      const response = await fetch(`http://localhost:8000/api/clippings/${clipId}/add_tag/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName }),
      });

      if (!response.ok) throw new Error('Failed to add tag');

      const updatedClipping = await response.json();
      updateClipping(updatedClipping);

      // wyczyść input tagu
      setNewTagTextByClipId(prev => ({ ...prev, [clipId]: '' }));
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const fetchTagSuggestions = async (clipId, query) => {
    try {
      const response = await fetch(`http://localhost:8000/api/tags/?search=${query}`);
      const tags = await response.json();

      console.log('Sugestie z backendu:', tags);

      // odfiltruj tagi już przypisane do tego klipu
      const existingTagNames = clippings.find(c => c.id === clipId)?.tags.map(t => t.name);
      const filtered = tags.filter(tag => !existingTagNames.includes(tag.name));

      setTagSuggestions(prev => ({ ...prev, [clipId]: filtered }));
    } catch (error) {
      console.error('Error fetching tag suggestions:', error);
    }
  };

  const handleAddExistingTag = async (clipId, tagName) => {
    try {
      const response = await fetch(`http://localhost:8000/api/clippings/${clipId}/add_tag/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tagName }),
      });

      if (!response.ok) throw new Error('Failed to add tag');

      const updatedClipping = await response.json();
      updateClipping(updatedClipping);

      // wyczyść input i podpowiedzi
      setNewTagTextByClipId(prev => ({ ...prev, [clipId]: '' }));
      setTagSuggestions(prev => ({ ...prev, [clipId]: [] }));
    } catch (error) {
      console.error('Error adding existing tag:', error);
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

              <div className="clipping-tags">
                
                {clip.tags && clip.tags.length > 0 &&
                  clip.tags.map(tag => (
                    <span key={tag.id} className="tag">
                      {tag.name}
                    </span>
                  )
                )}
              </div>
              
              {openTagMenus[clip.id] && (
                <div className="tag-menu mt-2">
                  <input
                    type="text"
                    placeholder="Add a tag..."
                    className="border rounded px-2 py-1 w-full"
                    value={newTagTextByClipId[clip.id] || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewTagTextByClipId(prev => ({ ...prev, [clip.id]: value }));
                      fetchTagSuggestions(clip.id, value);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(clip.id);
                        setNewTagTextByClipId(prev => ({ ...prev, [clip.id]: '' }));
                        setTagSuggestions(prev => ({ ...prev, [clip.id]: [] }));
                      }
                    }}
                  />
                  {tagSuggestions[clip.id]?.length > 0 && (
                    <ul className="tag-suggestions absolute bg-white border border-gray-300 rounded mt-1 shadow z-10 w-full">
                      {tagSuggestions[clip.id].map(tag => (
                        <li
                          key={tag.id}
                          className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleAddExistingTag(clip.id, tag.name)}
                        >
                          {tag.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}


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
                  {openTagMenus[clip.id] ? (
                    <Minus
                      size={16}
                      style={{ marginLeft: '5px' }}
                      className="text-gray-600 hover:text-black cursor-pointer ml-2"
                      onClick={() => toggleTagMenu(clip.id)}
                    />
                  ) : (
                    <Plus
                      size={16}
                      style={{ marginLeft: '5px' }}
                      className="text-gray-600 hover:text-black cursor-pointer ml-2"
                      onClick={() => toggleTagMenu(clip.id)}
                    />
                  )}

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
