import { useState } from "react";

export default function Pagination({ currentPage, totalPages }) {
  const [page, setPage] = useState(1);

  return (
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
  );
}
