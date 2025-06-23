import React, { useEffect, useState } from "react";
import axios from "axios";
import "./StatsPanel.css";

const StatsPanel = () => {
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [authorSuggestions, setAuthorSuggestions] = useState([]);

    useEffect(() => {
    if (searchTerm.length < 2) {
        setAuthorSuggestions([]);
        return;
    }

    axios.get("http://localhost:8000/api/authors/")
        .then(res => {
        const filtered = res.data.filter(author =>
            author.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setAuthorSuggestions(filtered.slice(0, 5)); // max 5 sugestii
        })
        .catch(err => console.error("Autocomplete failed", err));
    }, [searchTerm]);


  useEffect(() => {
    axios.get("http://localhost:8000/api/stats/")
      .then(res => setStats(res.data))
      .catch(err => console.error("Error fetching stats", err));
  }, []);

  const handleSearch = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/authors/`);
      const found = res.data.find(author =>
        author.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (!found) return setSearchResult(null);

      const noteCount = await axios.get(
        `http://localhost:8000/api/authors/${found.id}/clippings/`
      );

      const notes = noteCount.data.filter(c => c.note !== null).length;
      const highlights = noteCount.data.filter(c => c.highlight !== null).length;

      setSearchResult({
        ...found,
        noteCount: notes,
        highlightCount: highlights,
      });
    } catch (e) {
      console.error("Search failed", e);
    }
  };

  return (
    <div className="stats-panel">
      <h2>Statistics</h2>

      {stats && (
        <>
          <div className="top-stats">
            <div className="stat-circle">
                <div className="circle-title">Top Book</div>
                <div className="circle-value">{stats.top_book.highlight_count}</div>
                <div className="circle-desc">{stats.top_book.title} by {stats.top_book.author}</div>
            </div>

            <div className="stat-circle">
                <div className="circle-title">Top Author</div>
                <div className="circle-value">{stats.top_author.note_count}</div>
                <div className="circle-desc">{stats.top_author.name}</div>
            </div>
            </div>
        </>
      )}

      <div className="search-section">
        <h3>Search Author</h3>
        <input
          type="text"
          placeholder="Enter author name..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
        <ul className="autocomplete-list">
        {authorSuggestions.map(author => (
            <li
            key={author.id}
            onClick={() => {
                setSearchTerm(author.name);
                setAuthorSuggestions([]);
            }}
            >
            {author.name}
            </li>
        ))}
        </ul>


        {searchResult && (
          <div className="stat-block">
            <strong>{searchResult.name}</strong> — {searchResult.highlightCount} highlights, {searchResult.noteCount} notes
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsPanel;
