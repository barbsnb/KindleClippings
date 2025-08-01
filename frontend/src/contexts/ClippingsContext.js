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
      if (filters.favourite !== null) params.append('favourite', filters.favourite);
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

  const unhideClipping = async (id) => {
    try {
      await axios.patch(`http://localhost:8000/api/clippings/${id}/`, {
        visibility: true,
      });

      setClippings((prev) => prev.filter((clip) => clip.id !== id));
    } catch (err) {
      console.error("Error uncovering clipping:", err);
    }
  };

  const favClipping = async (id) => {
    try {
      const response = await axios.patch(`http://localhost:8000/api/clippings/${id}/`, {
        favourite: true,
      });

      updateClipping(response.data);
    } catch (err) {
      console.error("Error hiding clipping:", err);
    }
  };

  const unfavClipping = async (id) => {
    try {
      const response = await axios.patch(`http://localhost:8000/api/clippings/${id}/`, {
        favourite: false,
      });

      updateClipping(response.data);
    } catch (err) {
      console.error("Error uncovering clipping:", err);
    }
  };
  
  const deleteClipping = async (id) => {
    try {
      await fetch(`http://localhost:8000/api/clippings/${id}/`, {
        method: 'DELETE',
      });
      setClippings((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error deleting clipping:', error);
    }
  }

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
        unhideClipping,
        updateClipping,
        favClipping,
        unfavClipping,
        fetchClippings,
        filters,
        setFilters,
        deleteClipping,
      }}
    >
      {children}
    </ClippingsContext.Provider>
  );
}

export const useClippings = () => useContext(ClippingsContext);
