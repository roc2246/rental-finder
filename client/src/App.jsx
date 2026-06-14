import "./App.css";
import React from "react";
import * as fetchLib from "./js/fetch-library.js";
import Filters from "./sections/Filters.jsx";
import Pagination from "./sections/Pagination.jsx";
import ListingsGrid from "./sections/ListingsGrid.jsx";

function App() {
  // filter / sort / pagination state lifted to app level
  const [sortBy, setSortBy] = React.useState("price"); // API uses price/rent
  const [locationQuery, setLocationQuery] = React.useState("");
  const [page, setPage] = React.useState(1);

  // data returned from server
  const [listings, setListings] = React.useState([]);
  const [totalPages, setTotalPages] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);

  // Reset page to 1 when filters change, but handle it carefully to avoid double-fetching
  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const filters = locationQuery.trim() 
          ? { location: locationQuery.trim() } 
          : {};

        const sort = { [sortBy]: 1 };
        const data = await fetchLib.fetchListings(filters, page, 20, sort);
        
        setListings(data.results || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("failed to load listings", err);
        setListings([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [sortBy, page, locationQuery]);

  return (
    <div className="app-container">
      {/* Filters (zip code, sort by) */}
      <Filters
        sortBy={sortBy}
        setSortBy={handleFilterChange(setSortBy)}
        locationQuery={locationQuery}
        setLocationQuery={handleFilterChange(setLocationQuery)}
      />

      {/* Listings grid */}
      {isLoading ? (
        <div className="loading-spinner">Loading properties...</div>
      ) : (
        <ListingsGrid listings={listings} />
      )}

      {/* simple pagination controls */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

export default App;
