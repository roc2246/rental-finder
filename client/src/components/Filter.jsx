export default function Filter({label, sortBy, setSortBy}) {
  return (
    <label>
      {label}
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="dailyRate">Price</option>
        <option value="location">Location</option>
      </select>
    </label>
  );
}
