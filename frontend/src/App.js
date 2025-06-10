import React from 'react';
import ClippingList from './components/ClippingList';
import { BooksProvider } from './contexts/BooksContext';
import Layout from './components/common/Layout';    
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";    

function App() {
  return (
    <BooksProvider>
      <Router> 
        <Routes>
              {/* Publiczne strony (bez sidebar) */}
              <Route
                path="/"
                element={
                  <Layout>
                    <ClippingList />
                  </Layout>
                }
              />
          </Routes>
      </Router>
    </BooksProvider>
  );
}

export default App;
