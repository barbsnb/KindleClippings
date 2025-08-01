import React, { useEffect, useState } from 'react';
import { useBooks } from '../contexts/BooksContext';
import { useAuthors } from '../contexts/AuthorsContext';
import { useClippings } from '../contexts/ClippingsContext';
import { format, parseISO } from 'date-fns';
import './ClippingList.css';
import { Eye, Pencil, Save,  Plus, Heart, Minus, Loader2 } from 'lucide-react';


const ClippingList = ({ limit = null }) => {
  const { 
    clippings,
    loading,
    error,
    hideClipping,
    updateClipping, 
    filters, 
    setFilters,
    unfavClipping,
    favClipping,
   } = useClippings();
  const { updateBook } = useBooks();
  const { updateAuthor } = useAuthors();
  
  // editing
  const [editingId, setEditingId] = useState(null);
  const [showNoteEditor, setShowNoteEditor] = useState({});
  const [editedValues, setEditedValues] = useState({
    book: { id: null, title: '' },
    author: { id: null, name: '' },
    highlight: '',
  });

  const [originalValues, setOriginalValues] = useState({
    book: { id: null, title: '' },
    author: { id: null, name: '' },
    highlight: '',
  });

  //tags:
  const [openTagMenus, setOpenTagMenus] = useState({});
  const [newTagTextByClipId, setNewTagTextByClipId] = useState({});
  const [tagSuggestions, setTagSuggestions] = useState({});

  //filters:
  const [inputValue, setInputValue] = useState(filters.search);

  //favourites:
  const [favouredId, setfavouredId] = useState();

  //timeout to avoid fetching with every filer character
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: inputValue }));
    }, 300); // debounce: 300ms

    return () => clearTimeout(timeout);
  }, [inputValue]);

  if (loading) return <div className="loader-wrapper">  <Loader2 /> </div>;
  if (error) return <div className="error">Error loading clippings: {error.message}</div>;

  let clippinglist = clippings;

  if (limit !== null) {
    clippinglist = clippinglist.slice(0, limit);
  }

  //visibility
  const handleVisibilityClick = async (clip) => {
    try {
      hideClipping(clip.id);
    } catch (error) {
      console.error('Error hiding clipping:', error);
    }
  };

  //favourite:
  const handleFavClick = async (clip) => {
    try {
      favClipping(clip.id);
      // console.log(clip.id);
      // console.log(clip.favourite);
      // setfavouredId(!clip.favourite)
    } catch (error) {
      console.error('Error hiding clipping:', error);
    }
  };

  const handleUnFavClick = async (clip) => {
    try {
      unfavClipping(clip.id);
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
      highlight: clip.highlight || '',
      note: clip.note || '',
    });
    setOriginalValues({
      book: { id: clip.book.id, title: clip.book.title },
      author: { id: clip.book.author.id, name: clip.book.author.name },
      highlight: clip.highlight || '',
      note: clip.note || '',
    });
  };

  const handleSave = async () => {
    try {
      let updatedBook = null;
      let updatedAuthor = null;
      let highlightChanged = false;
      let noteChanged = false;


      // PATCH for book
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

      // PATCH for author
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

      // PATCH for highlight
      if (editedValues.highlight !== originalValues.highlight) {
        const responseHighlight = await fetch(`http://localhost:8000/api/clippings/${editingId}/edit_highlight/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ highlight: editedValues.highlight }),
        });

        if (!responseHighlight.ok) throw new Error('Failed to update highlight');
        const updatedClip = await responseHighlight.json();
        highlightChanged = true;
        updateClipping(updatedClip); 
      }

      // PATCH for note
      if (editedValues.note !== originalValues.note) {
        const responseNote = await fetch(`http://localhost:8000/api/clippings/${editingId}/edit_note/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ note: editedValues.note }),
        });

        if (!responseNote.ok) throw new Error('Failed to update note');
        const updatedClip = await responseNote.json();  // pełny clipping z backendu
        updateClipping(updatedClip);
        noteChanged = true;
      }


      if (updatedBook || updatedAuthor || highlightChanged || noteChanged) {
        clippings.forEach((clip) => {
          const isSameClip = clip.id === editingId;
          const sameBook = updatedBook && clip.book.id === updatedBook.id;
          const sameAuthor = updatedAuthor && clip.book.author.id === updatedAuthor.id;

          let updated = { ...clip };

          if (sameBook) {
            // Zmieniona książka
            updated.book = {
              ...updatedBook,
              author: sameAuthor
                ? updatedAuthor
                : updatedBook.author || clip.book.author,
            };
          } else if (sameAuthor) {
            // Zmieniony autor (ale książka ta sama)
            updated.book = {
              ...clip.book,
              author: updatedAuthor,
            };
          }

          // Jeśli zmieniono highlight i to jest edytowany klip
          if (isSameClip && highlightChanged) {
            updated.highlight = editedValues.highlight;
          }

          // Jeśli zmieniono notatkę i to jest edytowany klip
          if (isSameClip && noteChanged) {
            updated.note = editedValues.note;
          }

          // Uaktualnij clipa tylko jeśli coś się zmieniło
          if (
            sameBook ||
            sameAuthor ||
            (isSameClip && highlightChanged) ||
            (isSameClip && noteChanged)
          ) {
            updateClipping(updated);
          }
        });
        highlightChanged = false;
        noteChanged = false;
        setShowNoteEditor({});
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
      {limit === null && ( 
        <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Search..."
        className="clipping-filter"
      />
      )}

      {clippings.length === 0 ? (
        <p>No clippings found.</p>
      ) : (
        <div className="clipping-grid">
          {clippinglist.map((clip) => (
            <div key={clip.id} className="clipping-card">
              <div className="clipping-header">
                {editingId === clip.id ? (
                  <>
                    {/* book name edit */}
                    <input
                      className="edit-input"
                      value={editedValues.book.title}
                      onChange={(e) =>
                        setEditedValues((prev) => ({
                          ...prev,
                          book: { ...prev.book, title: e.target.value },
                        }))
                      }
                    />
                    {/* author name edit */}
                    <input
                      className="edit-input"
                      value={editedValues.author.name}
                      onChange={(e) =>
                        setEditedValues((prev) => ({
                          ...prev,
                          author: { ...prev.author, name: e.target.value },
                        }))
                      }
                    />
                    {/* highlight edit */}
                    <textarea
                      className="edit-textarea"
                      value={editedValues.highlight}
                      onChange={(e) =>
                        setEditedValues((prev) => ({ ...prev, highlight: e.target.value }))
                      }
                    />
                    {/* note edit */}
                    {(editedValues.note || showNoteEditor[clip.id]) ? (
                      <textarea
                        className="edit-textarea"
                        value={editedValues.note}
                        onChange={(e) =>
                          setEditedValues((prev) => ({ ...prev, note: e.target.value }))
                        }
                      />
                    ) : (
                      <div
                        className="add-note-button"
                        onClick={() => {
                          setShowNoteEditor(prev => ({ ...prev, [clip.id]: true }));
                          setEditedValues(prev => ({ ...prev, note: '' }));
                        }}
                      >
                        <Plus size={16} className="mr-1" />
                        <span>Add note</span>
                      </div>
                    )}

                  </>
                ) : (
                  <>
                    <div className="book-title">{clip.book.title}</div>
                    <div className="book-author">by {clip.book.author.name}</div>
                  </>
                )}
              </div>

              {editingId !== clip.id && (
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
              )}

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
                  {clip.favourite === true || favouredId === clip.id ? (
                      <Heart
                      size={15}
                      style={{ marginRight: '5px' }}
                      className="text-green-600 hover:text-green-800 cursor-pointer"
                      color='red'
                      onClick={() => handleUnFavClick(clip)}
                      />
                  ) : (
                      <Heart
                      size={15}
                      style={{ marginRight: '5px' }}
                      className="text-green-600 hover:text-green-800 cursor-pointer"
                      onClick={() => handleFavClick(clip)}
                      />
                  )}
                  
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
