import Filter from "../components/Filter";

// filters are controlled by the parent app; state is lifted
export default function Filters({ sortBy, setSortBy }) {
  return (
    <section className="filters">
      <Filter label="Sort By:" sortBy={sortBy} setSortBy={setSortBy} />
    </section>
  );
}
