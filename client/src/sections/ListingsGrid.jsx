import * as utilsLib from "../js/utils-library.js";

export default function ListingsGrid({ listings }) {
 

  return (
    <section className="listings">
      {listings.length === 0 && <p>No rentals found.</p>}

      {listings.map((l, idx) => {
        const listingHref = utilsLib.getListingHref(l);

        return (
          <div key={l.listingURL || idx} className="rental-listing">
            <div className="rental-title">{l.title || "Untitled"}</div>
            <div className="rental-price">{l.price || "N/A"}</div>
            <div className="rental-location">{l.location || "N/A"}</div>
            <a className="rental-link" href={listingHref} target="_blank" rel="noopener noreferrer">
              View Listing
            </a>
          </div>
        );
      })}
    </section>
  );
}
