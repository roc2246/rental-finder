// pagination is controlled by the parent; currentPage and a change handler are passed in
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <section className="pagination">
      <button
        disabled={currentPage <= 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      >
        Prev
      </button>
      <span>
        {currentPage} / {totalPages}
      </span>
      <button
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      >
        Next
      </button>
    </section>
  );
}
