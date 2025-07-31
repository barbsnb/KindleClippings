import React, { useState } from "react";
import { Upload } from "lucide-react";
import "./ImportPage.css";

const ImportPage = () => {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [newClippings, setNewClippings] = useState([]);

  const handleImport = async () => {
    setImporting(true);
    setResult(null);
    setNewClippings([]);

    try {
      const response = await fetch("http://localhost:8000/api/import-clippings/");
      const data = await response.json();
      setResult({ status: data.status, message: data.message });

      if (data.new_clippings) {
        setNewClippings(data.new_clippings);
      }
    } catch (err) {
      setResult({ status: "error", message: "Import failed. Try again." });
    } finally {
      setImporting(false);
    }
  };

  return (
      <div className="import-page-wrapper">
        <h2>
          <Upload size={20} className="icon-margin" />
          Import New Clippings
        </h2>

        <p>This will import only newly added Kindle clippings since the last import.</p>

        <button className="import-button" onClick={handleImport} disabled={importing}>
          <Upload size={20} className="upload-icon" />
          {importing ? "Importing..." : "Import Clippings"}
        </button>

        {result && (
          <div className={`import-message ${result.status}`}>
            {result.message}
          </div>
        )}

        {newClippings.length > 0 && (
          <div className="imported-clippings">
            <h3>New Clippings Imported:</h3>
            <ul>
              {newClippings.map((clip, index) => (
                <li key={index} className="clipping-card">
                  <p><strong>Book:</strong> {clip.book}</p>
                  <p><strong>Author:</strong> {clip.author}</p>
                  <p><strong>Text:</strong> {clip.text}</p>
                  <p><strong>Type:</strong> {clip.type}</p>
                  <p><strong>Added on:</strong> {new Date(clip.added_on).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  export default ImportPage;
