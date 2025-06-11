import React from 'react';
import ClippingList from './components/ClippingList';
import { BooksProvider } from './contexts/BooksContext';
import { ClippingsProvider } from './contexts/ClippingsContext';
import { SelectedEntityProvider } from './contexts/SelectedEntityContext';
import { AuthorsProvider } from './contexts/AuthorsContext';
import Layout from './components/common/Layout';    
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";    

function App() {
  return (
    <AuthorsProvider>
    <BooksProvider>
      <SelectedEntityProvider>
      <ClippingsProvider>
        <Router> 
          <Routes>
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
      </ClippingsProvider>
      </SelectedEntityProvider>
    </BooksProvider>
    </AuthorsProvider>
  );
}

export default App;
