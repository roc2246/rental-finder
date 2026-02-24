// Quick Rent specific data and functions
localStorageKey = 'quickRentListings';

timeBasedListings = {
    morning: [
        {
            id: 1,
            title: "Office District Studio",
            location: "Business Center, Downtown",
            bedrooms: 0,
            bathrooms: 1,
            sqft: 450,
            price: 1100,
            imageClass: "",
            badge: "MORNING COMMUTE"
        },
        {
            id: 2,
            title: "Transit Hub Apartment",
            location: "Metro Station Area, Midtown",
            bedrooms: 1,
            bathrooms: 1,
            sqft: 650,
            price: 1450,
            imageClass: "alt1",
            badge: "QUICK ACCESS"
        },
        {
            id: 3,
            title: "Early Bird Special",
            location: "Financial District, Downtown",
            bedrooms: 1,
            bathrooms: 1,
            sqft: 550,
            price: 1250,
            imageClass: "alt2",
            badge: "BREAKFAST INCLUDED"
        }
    ],
    afternoon: [
        {
            id: 4,
            title: "Family Townhouse",
            location: "Residential Area, Suburbs",
            bedrooms: 3,
            bathrooms: 2,
            sqft: 1800,
            price: 2650,
            imageClass: "",
            badge: "FAMILY FRIENDLY"
        },
        {
            id: 5,
            title: "Modern 2BR with Balcony",
            location: "Urban District, City Center",
            bedrooms: 2,
            bathrooms: 2,
            sqft: 1100,
            price: 2100,
            imageClass: "alt1",
            badge: "CITY VIEWS"
        },
        {
            id: 6,
            title: "Pet-Friendly Home",
            location: "Green Neighborhood, Suburbs",
            bedrooms: 3,
            bathrooms: 2.5,
            sqft: 1600,
            price: 2400,
            imageClass: "alt2",
            badge: "PET WELCOME"
        }
    ],
    evening: [
        {
            id: 7,
            title: "Entertainment District Loft",
            location: "Arts Quarter, Downtown",
            bedrooms: 2,
            bathrooms: 2,
            sqft: 1200,
            price: 3200,
            imageClass: "",
            badge: "NIGHTLIFE"
        },
        {
            id: 8,
            title: "Rooftop Terrace Condo",
            location: "Skyline Area, Midtown",
            bedrooms: 2,
            bathrooms: 2,
            sqft: 1300,
            price: 3500,
            imageClass: "alt1",
            badge: "EVENING VIEWS"
        },
        {
            id: 9,
            title: "Luxury Penthouse",
            location: "Elite District, Downtown",
            bedrooms: 3,
            bathrooms: 3,
            sqft: 2000,
            price: 4800,
            imageClass: "alt2",
            badge: "PREMIUM"
        }
    ],
    night: [
        {
            id: 10,
            title: "Emergency Short-Term",
            location: "Central Hub, Downtown",
            bedrooms: 1,
            bathrooms: 1,
            sqft: 400,
            price: 150,
            imageClass: "",
            badge: "NIGHT RATE"
        },
        {
            id: 11,
            title: "Business Traveler Suite",
            location: "Airport District, Outskirts",
            bedrooms: 1,
            bathrooms: 1,
            sqft: 500,
            price: 200,
            imageClass: "alt1",
            badge: "AVAILABLE NOW"
        },
        {
            id: 12,
            title: "Last Minute Stay",
            location: "Express Check-in, City Center",
            bedrooms: 0,
            bathrooms: 1,
            sqft: 350,
            price: 100,
            imageClass: "alt2",
            badge: "SHORT TERM"
        }
    ]
};

// Override renderListings for quick-rent specific DOM structure
function renderListings() {
    loadListings();
    updateTimeBasedListings();

    const listingsContainer = document.querySelector('.listing-grid');
    if (!listingsContainer) return;

    listingsContainer.innerHTML = '';

    // Add time badge
    const timePeriod = getCurrentTimePeriod();
    const timeBadge = document.createElement('div');
    timeBadge.className = 'time-badge';
    timeBadge.textContent = `${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} Listings`;
    listingsContainer.appendChild(timeBadge);

    listings.forEach(listing => {
        const listingDiv = document.createElement('div');
        listingDiv.className = 'list-listing rental-listing';

        listingDiv.innerHTML = `
            <div class="list-image ${listing.imageClass}">
                <div class="price-tag rental-price">$${listing.price.toLocaleString()}</div>
                ${listing.id >= 1000000000000 ? '<button class="delete-button" onclick="deleteListing(' + listing.id + ')">×</button>' : ''}
            </div>
            <div class="list-body">
                ${listing.badge ? '<span class="badge ' + (listing.badge === 'FEATURED' || listing.badge === 'POPULAR' ? 'featured' : '') + '">' + listing.badge + '</span>' : ''}
                <div class="list-title rental-title">${listing.title}</div>
                <div class="list-address rental-location">${listing.location}</div>
                <div class="list-meta">
                    <span class="meta-item">${listing.bedrooms} <strong>bed${listing.bedrooms !== 1 ? 's' : ''}</strong></span>
                    <span class="meta-item">${listing.bathrooms} <strong>bath${listing.bathrooms !== 1 ? 's' : ''}</strong></span>
                    <span class="meta-item">${listing.sqft.toLocaleString()} <strong>sqft</strong></span>
                </div>
                <div class="list-footer">
                    <div class="price-display">
                        <span class="price-amount">$${listing.price.toLocaleString()}</span>
                        <span class="price-label">per month</span>
                    </div>
                    <button class="btn-primary">View</button>
                </div>
            </div>
        `;

        listingsContainer.appendChild(listingDiv);
    });

    // Add form for new listings
    const addForm = document.createElement('div');
    addForm.className = 'list-listing rental-listing add-form';
    addForm.innerHTML = `
        <div class="list-image">
            <div class="price-tag">Add New</div>
        </div>
        <div class="list-body">
            <input type="text" id="new-title" placeholder="Title" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <input type="text" id="new-location" placeholder="Location" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <input type="number" id="new-price" placeholder="Price" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <input type="number" id="new-bedrooms" placeholder="Bedrooms" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <input type="number" step="0.5" id="new-bathrooms" placeholder="Bathrooms" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <input type="number" id="new-sqft" placeholder="Sqft" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <input type="text" id="new-badge" placeholder="Badge (optional)" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <button onclick="addListing()" style="background: green; color: white; padding: 10px; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Add Listing</button>
        </div>
    `;
    listingsContainer.appendChild(addForm);

    // Update header count
    const header = document.querySelector('.listing-header h2');
    if (header) {
        header.textContent = `Available Rentals (${listings.length} Properties)`;
    }
}