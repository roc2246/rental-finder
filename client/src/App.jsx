import "./App.css";
import React from "react";
import * as fetchLib from "./js/fetch-library.js";

function App() {
  const [price, setPrice] = React.useState([]);
  const [rating, setRating] = React.useState([]);

  React.useEffect(() => {
    // Fetch price and rating data from the server
    async function loadData() {
      try {
        const data = await fetchLib.fetchListings();
        setPrice(data.price);
        setRating(data.rating);
      } catch (err) {
        console.error("failed to load listings", err);
      }
    }

    loadData();
  }, []);

  return (
    <>
      <div>
        {/* Filters (zip code, sort by) */}
        <section className="filters">
          <label>
            Zip Code:
            <input type="text" placeholder="Enter zip code" />
          </label>
          <label>
            Sort By:
            <select>
              <option value="price">{price}</option>
              <option value="rating">{rating}</option>
            </select>
          </label>
        </section>

        {/* Sections for each rental site and listings */}
        {/* Each click on a listing will open a new tab */}
      </div>
    </>
  );
}

export default App;
