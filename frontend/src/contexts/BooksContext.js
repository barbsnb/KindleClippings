import React, { createContext, useEffect, useState } from "react";
import client from "../axiosClient";

export const BooksContext = createContext(null);

export const BooksProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [shouldReload, setShouldReload] = useState(false);

  useEffect(() => {
    client
      .get("/api/books/")
      .then((res) => {
        setBooks(res.data);
        setShouldReload(false);
        console.log("Fetched books:", res.data);
      })
      .catch((error) => {
        console.error("Failed to fetch books:", error);
      });
  }, [shouldReload]);

  return (
    <BooksContext.Provider value={{ books, setBooks, shouldReload, setShouldReload }}>
      {children}
    </BooksContext.Provider>
  );
};
