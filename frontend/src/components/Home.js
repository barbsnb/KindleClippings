import React, { useEffect } from 'react';
import FavouritesList from './Favourites';
import ClippingList from './ClippingList';
import StatsPanel from './StatsPanel';
import { useClippings } from '../contexts/ClippingsContext';
import './Home.css';

const Home = () => {
  const { setFilters } = useClippings();

  useEffect(() => {
    setFilters({
      visibility: true,
      favourite: null,
      search: '',
    });
  }, []);

  return (
    <div className="home-container">
      <div className="home-top-row">
        {/* <div className="home-column">
            <h2 className="home-section-title">Favourite Highlights</h2>
            <FavouritesList limit={4} randomize />
        </div> */}
        <div className="home-column">
            <h2 className="home-section-title">Recently Added</h2>
            <ClippingList limit={5} />
        </div>
        
        <div className="home-column">
            <h2 className="home-section-title">This Month's Stats</h2>
            <StatsPanel />
        </div>
      </div>

        

    </div>
  );
};

export default Home;
