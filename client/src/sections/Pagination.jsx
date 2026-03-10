import NavBtn from "../components/NavBtn";

// pagination is controlled by the parent; currentPage and a change handler are passed in
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <section className="pagination">
      <NavBtn
        label="Prev"
        bool={currentPage <= 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      />
      <NavBtn
        label="Next"
        bool={currentPage >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      />
      <span>
        {currentPage} / {totalPages}
      </span>
    </section>
  );
}
