import { useState } from "react";
export default function Filters() {
  const [zip, setZip] = useState("");

  return (
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
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="dailyRate">Price</option>
          <option value="city">City</option>
        </select>
      </label>
    </section>
  );
}
