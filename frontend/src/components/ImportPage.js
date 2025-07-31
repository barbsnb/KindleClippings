import React, { useState } from "react";
import { Upload } from "lucide-react";
import "./ImportPage.css";

const ImportPage = () => {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const handleImport = async () => {
    setImporting(true);
    setResult(null);

    try {
      const response = await fetch("http://localhost:8000/api/import-clippings/");
      const data = await response.json();
      setResult({ status: data.status, message: data.message });
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
        {importing ? "Importing..." : "Start Import"}
      </button>

      {result && (
        <div className={`import-message ${result.status}`}>
          {result.message}
        </div>
      )}
    </div>
  );
};

export default ImportPage;
