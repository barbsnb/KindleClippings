import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";   

import { BooksProvider } from './contexts/BooksContext';
import { ClippingsProvider } from './contexts/ClippingsContext';
import { SelectedEntityProvider } from './contexts/SelectedEntityContext';
import { AuthorsProvider } from './contexts/AuthorsContext';

import Layout from './components/common/Layout'; 
import ClippingList from './components/ClippingList';   
import StatsPanel from './components/StatsPanel';
import ImportPage from './components/ImportPage';
import HiddenList from './components/Hidden';
import FavouritesList from './components/Favourites';
import Home from './components/Home';
 

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
                      <Home />
                    </Layout>
                  }
                />

                <Route
                  path="/favourites"
                  element={
                    <Layout>
                      <FavouritesList />
                    </Layout>
                  }
                />

                <Route
                  path="/allclippings"
                  element={
                    <Layout>
                      <ClippingList />
                    </Layout>
                  }
                />

                <Route path="/stats" 
                element={
                  <Layout>
                  <StatsPanel />
                  </Layout>
                } 
                />

                <Route path="/import" 
                element={
                  <Layout>
                  <ImportPage />
                  </Layout>
                } 
                />

                <Route path="/hidden" 
                element={
                  <Layout>
                  <HiddenList />
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
