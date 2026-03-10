import "./App.css";
import "./App.css";
import React from "react";
import * as fetchLib from "./js/fetch-library.js";
import Filters from "./sections/Filters.jsx";
import Pagination from "./sections/Pagination.jsx";
import ListingsGrid from "./sections/ListingsGrid.jsx";

function App() {
  // filter / sort / pagination state lifted to app level
  const [sortBy, setSortBy] = React.useState("dailyRate"); // API uses dailyRate/rent
  const [page, setPage] = React.useState(1);

  // data returned from server
  const [listings, setListings] = React.useState([]);
  const [totalPages, setTotalPages] = React.useState(1);

  // load data whenever filters/page/sort change
  React.useEffect(() => {
    async function loadData() {
      try {
        const filters = {};
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
  }, [sortBy, page]);

  // reset to first page when user changes filters or sort
  React.useEffect(() => {
    setPage(1);
  }, [sortBy]);

  return (
    <div className="app-container">
      {/* Filters (zip code, sort by) */}
      <Filters
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Listings grid */}
      <ListingsGrid listings={listings} />

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
