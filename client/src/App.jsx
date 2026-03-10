import "./App.css";
import React from "react";
import * as fetchLib from "./js/fetch-library.js";
import Pagination from "./sections/Pagination.jsx";
import ListingsGrid from "./sections/ListingsGrid.jsx";

function App() {
  // UI state for filters and data
  const [sortBy, setSortBy] = React.useState("dailyRate"); // API uses dailyRate/rent
  const [listings, setListings] = React.useState([]);
  const [totalPages, setTotalPages] = React.useState(1);

  // load data whenever filters/page/sort change
  // whenever filters or pagination state change we need to fetch new data
  React.useEffect(() => {
    async function loadData() {
      try {
        const filters = {};
        if (zip.trim()) {
          // server accepts arbitrary filters; using 'zip' here for demonstration
          filters.zip = zip.trim();
        }
        const sort = {};
        if (sortBy) {
          sort[sortBy] = 1; // ascending
        }

        const data = await fetchLib.fetchListings(filters, page, 20, sort);
        setListings(data.results || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("failed to load listings", err);
        setListings([]);
        setTotalPages(1);
      }
    }

    loadData();
  }, [zip, sortBy, page]);

  // reset to first page when user changes filters or sort
  React.useEffect(() => {
    setPage(1);
  }, [zip, sortBy]);

  return (
    <div className="app-container">
      {/* Filters (zip code, sort by) */}
      <Filters />

      {/* Listings grid */}
      <ListingsGrid listings={listings} />

      {/* simple pagination controls */}
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} />
      )}
    </div>
  );
}

export default App;
