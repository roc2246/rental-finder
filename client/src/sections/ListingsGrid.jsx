export default function ListingsGrid({ listings }) {
  function handleListingClick(url) {
    if (url) {
      window.open(url, "_blank");
    }
  }

  return (
    <section className="listings">
      {listings.length === 0 && <p>No rentals found.</p>}

      {listings.map((l, idx) => {
        const isThereRent = l?.rent ? `$${l.rent}` : "";
        const rateOrRent =
          l?.dailyRate != null ? `$${l.dailyRate}` : isThereRent;

        return (
          <div
            key={l.listingURL || idx}
            className="rental-listing"
            onClick={() => handleListingClick(l.listingURL)}
            style={{ cursor: l.listingURL ? "pointer" : "default" }}
          >
            <div className="rental-title">{l.title || "Untitled"}</div>
            <div className="rental-price">{rateOrRent}</div>
            <div className="rental-location">{l.city || l.location || ""}</div>
          </div>
        );
      })}
    </section>
  );
}
