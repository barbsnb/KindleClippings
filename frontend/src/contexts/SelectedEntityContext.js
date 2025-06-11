// SelectedEntityContext.js
import { createContext, useContext, useState } from "react";

const SelectedEntityContext = createContext();

export const SelectedEntityProvider = ({ children }) => {
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [selectedAuthorId, setSelectedAuthorId] = useState(null);

  const clearSelection = () => {
    setSelectedBookId(null);
    setSelectedAuthorId(null);
  };

  return (
    <SelectedEntityContext.Provider
      value={{
        selectedBookId,
        setSelectedBookId,
        selectedAuthorId,
        setSelectedAuthorId,
        clearSelection,
      }}
    >
      {children}
    </SelectedEntityContext.Provider>
  );
};

export const useSelectedEntity = () => useContext(SelectedEntityContext);
