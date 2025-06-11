import React, { useState, useContext } from "react";
import { BooksContext } from "../../contexts/BooksContext";
import { useSelectedEntity } from "../../contexts/SelectedEntityContext";
import { useAuthors } from "../../contexts/AuthorsContext";
import './Sidebar.css';

const Sidebar = () => {
  const { books } = useContext(BooksContext);
  const { authors, loading: authorsLoading } = useAuthors();
  const {
    selectedBookId,
    selectedAuthorId,
    setSelectedBookId,
    setSelectedAuthorId,
    clearSelection
  } = useSelectedEntity();

  const [tab, setTab] = useState('books');
  const [filter, setFilter] = useState('');

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(filter.toLowerCase())
  );

  const filteredAuthors = authors.filter(author =>
    author.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="sidebar-wrapper">
      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-button ${tab === 'books' ? 'active' : ''}`}
          onClick={() => {
            setTab('books');
            setFilter('');
            clearSelection();
          }}
        >
          Books
        </button>
        <button
          className={`tab-button ${tab === 'authors' ? 'active' : ''}`}
          onClick={() => {
            setTab('authors');
            setFilter('');
            clearSelection();
          }}
        >
          Authors
        </button>
      </div>

      {/* Filter */}
      <input
        type="text"
        placeholder={`Filter ${tab === 'books' ? 'books' : 'authors'}...`}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="sidebar-filter"
      />

      {/* List */}
      <div className="list-container">
        {tab === 'books' && (
          <>
            <button
              onClick={clearSelection}
              className={`sidebar-button ${!selectedBookId && !selectedAuthorId ? 'active' : ''}`}
            >
              <span className="book-title">All Clippings</span>
            </button>

            {filteredBooks.map(book => (
              <button
                key={book.id}
                onClick={() => {
                  setSelectedBookId(book.id);
                  setSelectedAuthorId(null);
                }}
                className={`sidebar-button ${selectedBookId === book.id ? 'active' : ''}`}
              >
                <div className="book-title">{book.title}</div>
                <div className="book-author">by {book.author}</div>
              </button>
            ))}
          </>
        )}

        {tab === 'authors' && (
        <>
          {authorsLoading && <p>Loading authors...</p>}
          {!authorsLoading && filteredAuthors.length === 0 && <p>No authors found.</p>}
          {!authorsLoading && filteredAuthors.map(author => (
            <button
              key={author.id}
              onClick={() => {
                console.log(author.id);
                setSelectedAuthorId(author.id);
                console.log(author.id);
                setSelectedBookId(null);
              }}
              className={`sidebar-button ${selectedAuthorId === author.id ? 'active' : ''}`}
            >
              <span className="book-title">{author.name}</span>
            </button>
          ))}
        </>
      )}

      </div>
    </div>
  );
};

export default Sidebar;
