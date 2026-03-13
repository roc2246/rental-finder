import * as utilsLib from "../js/utils-library.js";

export default function ListingsGrid({ listings }) {
 

  return (
    <section className="listings">
      {listings.length === 0 && <p>No rentals found.</p>}

      {listings.map((l, idx) => {
        const isThereRent = l?.rent ? `${l.rent}` : "";
        const priceOrRent = l?.price != null ? `${l.price}` : isThereRent;
        const listingHref = utilsLib.getListingHref(l);

        return (
          <div key={l.listingURL || idx} className="rental-listing">
            <div className="rental-title">{l.title || "Untitled"}</div>
            <div className="rental-price">{priceOrRent}</div>
            <div className="rental-location">{l.city || l.location || ""}</div>
            <a href={listingHref} target="_blank" rel="noopener noreferrer">
              View Listing
            </a>
          </div>
        );
      })}
    </section>
  );
}
