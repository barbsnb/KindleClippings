// contexts/AuthorsContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const AuthorsContext = createContext();

export const AuthorsProvider = ({ children }) => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuthors = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:8000/api/authors/');
        setAuthors(res.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthors();
  }, []);

  return (
    <AuthorsContext.Provider value={{ authors, loading, error }}>
      {children}
    </AuthorsContext.Provider>
  );
};

export const useAuthors = () => useContext(AuthorsContext);
