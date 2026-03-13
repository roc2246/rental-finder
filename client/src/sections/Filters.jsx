import Filter from "../components/Filter";

// filters are controlled by the parent app; state is lifted
export default function Filters({ sortBy, setSortBy, locationQuery, setLocationQuery }) {
  return (
    <section className="filters">
      <label>
        Location:
        <input
          type="text"
          value={locationQuery}
          onChange={(e) => setLocationQuery(e.target.value)}
          placeholder="e.g. Boston"
        />
      </label>
      <Filter label="Sort By:" sortBy={sortBy} setSortBy={setSortBy} />
    </section>
  );
}
