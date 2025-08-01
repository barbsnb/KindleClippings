import React, { useState, useContext } from "react";
import { BooksContext } from "../../contexts/BooksContext";
import { useClippings } from "../../contexts/ClippingsContext";
import { useAuthors } from "../../contexts/AuthorsContext";
import { useSelectedEntity } from "../../contexts/SelectedEntityContext";
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import { Home, Heart, EyeClosed, Brain, Upload, Highlighter } from 'lucide-react';

const Sidebar = () => {
  const { books } = useContext(BooksContext);
  const { setFilters } = useClippings();
  const { authors, loading: authorsLoading } = useAuthors();
  const {
    selectedBookId,
    selectedAuthorId,
    setSelectedBookId,
    setSelectedAuthorId,
    clearSelection
  } = useSelectedEntity();
  const navigate = useNavigate();

  const [tab, setTab] = useState('books');
  const [filter, setFilterLocal] = useState('');

  const goToClippings = () => {
    navigate(`/`);
  };

  const handleAllClippingsClick = () => {
    clearSelection();
    setSelectedBookId(null);
    setSelectedAuthorId(null);
    setFilters({ search: '', visibility: true });
    goToClippings();
  };

  const goToFavourites = () => {
    setFilters((prev) => ({ ...prev, visibility: true, favourite: true }));
    navigate(`/favourites`);
  };

  const goToUpload = () => {
    navigate(`/import`);
  };

  const goToHome = () => {
    navigate(`/`);
  };

  const goToHidden = () => {
    setFilters((prev) => ({ ...prev, visibility: false }));
    navigate(`/hidden`);
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(filter.toLowerCase())
  );

  const filteredAuthors = authors.filter(author =>
    author.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="sidebar-wrapper">
      <div className="icon-column">
        <div className="icon-wrapper" onClick={goToHome}>
          <Home size={17} className="icon-margin"/>
          <span>Home</span>
        </div>
        <div className="icon-wrapper" onClick={goToUpload}>
          <Upload size={17} className="icon-margin"/>
          <span>Import</span>
        </div>
        <div className="icon-wrapper" onClick={handleAllClippingsClick}>
          <Highlighter size={17} className="icon-margin"/>
          <span>All highlights</span>
        </div>
        <div className="icon-wrapper" onClick={goToFavourites}>
          <Heart size={17} className="icon-margin"/>
          <span>Favourites</span>
        </div>
        <div className="icon-wrapper" onClick={goToHidden}>
          <EyeClosed size={17} className="icon-margin"/>
          <span>Hidden</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-button ${tab === 'books' ? 'active' : ''}`}
          onClick={() => {
            setTab('books');
            setFilterLocal('');
            clearSelection();
          }}
        >
          Books
        </button>
        <button
          className={`tab-button ${tab === 'authors' ? 'active' : ''}`}
          onClick={() => {
            setTab('authors');
            setFilterLocal('');
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
        onChange={(e) => setFilterLocal(e.target.value)}
        className="sidebar-filter"
      />

      {/* List */}
      <div className="list-container">
        {tab === 'books' && (
          <>
            {filteredBooks.map(book => (
              <button
                key={book.id}
                onClick={() => {
                  goToClippings()
                  setSelectedBookId(book.id);
                  setSelectedAuthorId(null);
                }}
                className={`sidebar-button ${selectedBookId === book.id ? 'active' : ''}`}
              >
              <div className="tooltip-container">
                <div className="book-title">{book.title}</div>
                <div className="tooltip-text">{book.title}</div>
              </div>
              
              <div className="tooltip-container">
                <div className="book-author">by {book.author.name}</div>
                <div className="tooltip-text">{book.author.name}</div>
              </div>
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
                goToClippings()
                setSelectedAuthorId(author.id);
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
