// ClippingsContext.js
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useSelectedEntity } from "./SelectedEntityContext";

const ClippingsContext = createContext();

export const ClippingsProvider = ({ children }) => {
  const { selectedBookId, selectedAuthorId } = useSelectedEntity();
  const [clippings, setClippings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    visibility: true,
  });

  const fetchClippings = async () => {
    setLoading(true);
    setError(null);

    let baseUrl = "http://localhost:8000/api/clippings/";
    const params = new URLSearchParams();

    if (selectedBookId) {
      baseUrl = `http://localhost:8000/api/books/${selectedBookId}/clippings/`;
    } else if (selectedAuthorId) {
      baseUrl = `http://localhost:8000/api/authors/${selectedAuthorId}/clippings/`;
    } else {
      if (filters.search) params.append('search', filters.search);
      if (filters.visibility !== null) params.append('visibility', filters.visibility);
    }

    const fullUrl = `${baseUrl}?${params.toString()}`;

    try {
      const res = await axios.get(fullUrl);
      setClippings(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllClippings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:8000/api/clippings/");
      setClippings(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClippings();
  }, [selectedBookId, selectedAuthorId, filters]);

  const hideClipping = async (id) => {
    try {
      await axios.patch(`http://localhost:8000/api/clippings/${id}/`, {
        visibility: false,
      });

      setClippings((prev) => prev.filter((clip) => clip.id !== id));
    } catch (err) {
      console.error("Error hiding clipping:", err);
    }
  };

  const updateClipping = (updatedClip) => {
    setClippings((prev) =>
      prev.map((clip) => (clip.id === updatedClip.id ? updatedClip : clip))
    );
  };

  return (
    <ClippingsContext.Provider
      value={{
        clippings,
        loading,
        error,
        hideClipping,
        updateClipping,
        fetchClippings,
        fetchAllClippings,
        filters,
        setFilters,
      }}
    >
      {children}
    </ClippingsContext.Provider>
  );
}

export const useClippings = () => useContext(ClippingsContext);
