import React, { useContext } from "react";
import CustomNavbar from "./Navbar";
import Sidebar from "./Sidebar";
import "./Layout.css";

const Layout = ({ children }) => {
  return (
    <>
      <CustomNavbar />
      <div className="layout-wrapper">
        <div className="sidebar-wrapper">
          <Sidebar />
        </div>
        <main className="content-wrapper">
          {children}
        </main>
      </div>
    </>
  );
};


export default Layout;
