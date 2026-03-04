import "./App.css";
import React from "react";
import * as fetchLib from "./js/fetch-library.js";

function App() {
  // UI state for filters and data
  const [zip, setZip] = React.useState("");
  const [sortBy, setSortBy] = React.useState("dailyRate"); // API uses dailyRate/rent
  const [listings, setListings] = React.useState([]);
  const [page, setPage] = React.useState(1);
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

  function handleListingClick(url) {
    if (url) {
      window.open(url, "_blank");
    }
  }

  return (
    <div className="app-container">
      {/* Filters (zip code, sort by) */}
      <section className="filters">
        <label>
          Zip Code:
          <input
            type="text"
            placeholder="Enter zip code"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
          />
        </label>

        <label>
          Sort By:
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="dailyRate">Price</option>
            <option value="city">City</option>
          </select>
        </label>
      </section>

      {/* Listings grid */}
      <section className="listings">
        {listings.length === 0 && <p>No rentals found.</p>}

        {listings.map((l, idx) => (
          <div
            key={l.listingURL || idx}
            className="rental-listing"
            onClick={() => handleListingClick(l.listingURL)}
            style={{ cursor: l.listingURL ? "pointer" : "default" }}
          >
            <div className="rental-title">{l.title || "Untitled"}</div>
            <div className="rental-price">
              {l.dailyRate != null ? `$${l.dailyRate}` : l.rent ? `$${l.rent}` : ""}
            </div>
            <div className="rental-location">{l.city || l.location || ""}</div>
          </div>
        ))}
      </section>

      {/* simple pagination controls */}
      {totalPages > 1 && (
        <section className="pagination">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </section>
      )}
    </div>
  );
}

export default App;
