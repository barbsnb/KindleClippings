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

  useEffect(() => {
    const fetchClippings = async () => {
      setLoading(true);
      setError(null);

      let url = "http://localhost:8000/api/clippings/";

      if (selectedBookId) {
        url = `http://localhost:8000/api/books/${selectedBookId}/clippings/`;
      } else if (selectedAuthorId) {
        url = `http://localhost:8000/api/authors/${selectedAuthorId}/clippings/`;
      }

      try {
        const res = await axios.get(url);
        setClippings(res.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClippings();
  }, [selectedBookId, selectedAuthorId]);

  return (
    <ClippingsContext.Provider value={{ clippings, loading, error }}>
      {children}
    </ClippingsContext.Provider>
  );
};

export const useClippings = () => useContext(ClippingsContext);
