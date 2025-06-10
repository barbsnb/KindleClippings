import './Sidebar.css';
import { useContext } from "react";
import { BooksContext } from "../../contexts/BooksContext";

const Sidebar = ({ onSelectBook, selectedBookId }) => {
  const { books } = useContext(BooksContext);

  return (
    <div>
      {books.map(book => (
        <button
          key={book.id}
          onClick={() => onSelectBook(book.id)}
          style={{
            display: "block",
            width: "100%",
            textAlign: "left",
            padding: "8px",
            backgroundColor: selectedBookId === book.id ? "#d0d0d0" : "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <strong>{book.title}</strong>
          <div className="text-sm text-gray-500">by {book.author}</div>
        </button>
      ))}
    </div>
  );
};

export default Sidebar;
