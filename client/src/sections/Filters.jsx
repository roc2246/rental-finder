// filters are controlled by the parent app; state is lifted
export default function Filters({ zip, setZip, sortBy, setSortBy }) {
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
