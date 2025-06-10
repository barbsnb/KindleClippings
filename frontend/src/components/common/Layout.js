import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  const [selectedBookId, setSelectedBookId] = useState(null);

  return (
    <>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar onSelectBook={setSelectedBookId} selectedBookId={selectedBookId} />
        <main
          style={{
            marginTop: "60px",
            padding: "20px",
            flex: 1,
            marginLeft: "200px",
          }}
        >
        </main>
      </div>
    </>
  );
};

export default Layout;
