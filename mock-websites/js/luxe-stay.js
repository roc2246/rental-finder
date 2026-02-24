// Luxe Stay specific data and functions
localStorageKey = 'luxeStayListings';

timeBasedListings = {
    morning: [
        {
            id: 1001,
            title: "Executive Downtown Suite",
            type: "Entire Suite · Business District",
            location: "📍 Financial Center - 0.3 km away",
            bedrooms: 1,
            bathrooms: 1,
            sqft: 650,
            price: 1850,
            rating: 4.93,
            reviews: 87,
            imageClass: "",
            badge: "BUSINESS TRAVEL"
        },
        {
            id: 1002,
            title: "Commuter Luxury Studio",
            type: "Studio · Transit Hub",
            location: "📍 Metro Station - 0.1 km away",
            bedrooms: 0,
            bathrooms: 1,
            sqft: 400,
            price: 1350,
            rating: 4.89,
            reviews: 124,
            imageClass: "beachfront",
            badge: "COMMUTE FRIENDLY"
        },
        {
            id: 1003,
            title: "Corporate Housing Premium",
            type: "Entire Apartment · Corporate Zone",
            location: "📍 Business Park - 0.8 km away",
            bedrooms: 2,
            bathrooms: 2,
            sqft: 950,
            price: 2250,
            rating: 4.96,
            reviews: 56,
            imageClass: "",
            badge: "EXECUTIVE"
        }
    ],
    afternoon: [
        {
            id: 2001,
            title: "Family Luxury Townhome",
            type: "Entire Townhome · Family District",
            location: "📍 School Area - 1.2 km away",
            bedrooms: 4,
            bathrooms: 3,
            sqft: 2200,
            price: 3800,
            rating: 4.94,
            reviews: 203,
            imageClass: "",
            badge: "FAMILY FRIENDLY"
        },
        {
            id: 2002,
            title: "Pet-Friendly Modern Home",
            type: "Entire House · Residential Area",
            location: "📍 Park District - 0.9 km away",
            bedrooms: 3,
            bathrooms: 2.5,
            sqft: 1800,
            price: 2950,
            rating: 4.91,
            reviews: 167,
            imageClass: "luxury",
            badge: "PET WELCOME"
        },
        {
            id: 2003,
            title: "Suburban Paradise Villa",
            type: "Entire Villa · Countryside",
            location: "📍 Green Valley - 3.5 km away",
            bedrooms: 5,
            bathrooms: 4,
            sqft: 3200,
            price: 5500,
            rating: 4.98,
            reviews: 89,
            imageClass: "mountain",
            badge: "LUXURY VILLA"
        }
    ],
    evening: [
        {
            id: 3001,
            title: "Entertainment District Penthouse",
            type: "Penthouse · Nightlife Quarter",
            location: "📍 Arts & Theater - 0.4 km away",
            bedrooms: 3,
            bathrooms: 3,
            sqft: 2000,
            price: 6200,
            rating: 4.97,
            reviews: 145,
            imageClass: "luxury",
            badge: "NIGHTLIFE CENTRAL"
        },
        {
            id: 3002,
            title: "Rooftop Luxury Condo",
            type: "Condo · City Center",
            location: "📍 Skyline Views - 0.6 km away",
            bedrooms: 2,
            bathrooms: 2.5,
            sqft: 1400,
            price: 4100,
            rating: 4.95,
            reviews: 112,
            imageClass: "",
            badge: "CITY VIEWS"
        },
        {
            id: 3003,
            title: "Designer Loft Space",
            type: "Loft · Creative District",
            location: "📍 Arts Quarter - 0.7 km away",
            bedrooms: 1,
            bathrooms: 1.5,
            sqft: 1200,
            price: 3200,
            rating: 4.92,
            reviews: 98,
            imageClass: "beachfront",
            badge: "ARTISTIC"
        }
    ],
    night: [
        {
            id: 4001,
            title: "Emergency Luxury Stay",
            type: "Suite · City Center",
            location: "📍 24/7 Access - 0.2 km away",
            bedrooms: 1,
            bathrooms: 1,
            sqft: 500,
            price: 250,
            rating: 4.85,
            reviews: 234,
            imageClass: "",
            badge: "NIGHT RATE"
        },
        {
            id: 4002,
            title: "Last Minute Premium",
            type: "Apartment · Downtown",
            location: "📍 Express Check-in - 0.5 km away",
            bedrooms: 2,
            bathrooms: 2,
            sqft: 900,
            price: 350,
            rating: 4.88,
            reviews: 156,
            imageClass: "luxury",
            badge: "AVAILABLE NOW"
        },
        {
            id: 4003,
            title: "Overnight Executive Suite",
            type: "Suite · Business District",
            location: "📍 Corporate Center - 0.3 km away",
            bedrooms: 1,
            bathrooms: 1.5,
            sqft: 700,
            price: 300,
            rating: 4.90,
            reviews: 89,
            imageClass: "beachfront",
            badge: "SHORT TERM"
        }
    ]
};

// Override renderListings for luxe-stay specific DOM structure
function renderListings() {
    loadListings();
    updateTimeBasedListings();

    const listingsContainer = document.querySelector('.listings-grid');
    if (!listingsContainer) return;

    listingsContainer.innerHTML = '';

    // Add time badge
    const timePeriod = getCurrentTimePeriod();
    const timeBadge = document.createElement('div');
    timeBadge.className = 'time-badge';
    timeBadge.textContent = `${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} Luxury Listings`;
    listingsContainer.appendChild(timeBadge);

    listings.forEach(listing => {
        const listingEl = document.createElement('div');
        listingEl.className = 'listing-card rental-listing';
        listingEl.innerHTML = `
            <div class="listing-image ${listing.imageClass}">
                <div class="rating-badge"><span class="star">★</span> ${listing.rating} (${listing.reviews})</div>
                <div class="price-badge rental-price">$${listing.price}/mo</div>
                ${listing.id >= 1000000000000 ? '<button class="delete-button" onclick="deleteListing(' + listing.id + ')">×</button>' : ''}
            </div>
            <div class="listing-details">
                <div class="listing-type">${listing.type}</div>
                <div class="listing-title rental-title">${listing.title}</div>
                <div class="listing-location rental-location">${listing.location}</div>
                <div class="property-features">
                    <span class="feature">🛏️ ${listing.bedrooms} Bedrooms</span>
                    <span class="feature">🚿 ${listing.bathrooms} Baths</span>
                    <span class="feature">📏 ${listing.sqft} sqft</span>
                </div>
                ${listing.badge ? `<div class="super-host">${listing.badge}</div>` : ''}
                <div class="listing-footer">
                    <div class="price-info">
                        <span class="price">$${listing.price}</span>
                        <span class="price-unit">per month</span>
                    </div>
                    <button class="book-button">View Details</button>
                </div>
            </div>
        `;
        listingsContainer.appendChild(listingEl);
    });

    // Add form for new listing
    const addForm = document.createElement('div');
    addForm.className = 'listing-card';
    addForm.innerHTML = `
        <div class="listing-image">
            <div class="price-badge">Add New</div>
        </div>
        <div class="listing-details">
            <input type="text" id="new-title" placeholder="Title" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <input type="text" id="new-type" placeholder="Type (e.g., Entire House · Downtown)" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <input type="text" id="new-location" placeholder="Location" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <input type="number" id="new-price" placeholder="Price" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <input type="number" id="new-bedrooms" placeholder="Bedrooms" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <input type="number" step="0.5" id="new-bathrooms" placeholder="Bathrooms" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <input type="number" id="new-sqft" placeholder="Sqft" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <input type="number" step="0.01" id="new-rating" placeholder="Rating (e.g., 4.95)" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <input type="number" id="new-reviews" placeholder="Reviews count" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <input type="text" id="new-badge" placeholder="Badge (optional)" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <button onclick="addListing()" style="background: green; color: white; padding: 10px; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Add Listing</button>
        </div>
    `;
    listingsContainer.appendChild(addForm);
}

// Override addListing for luxe-stay specific fields
function addListing() {
    const title = document.getElementById('new-title').value.trim();
    const type = document.getElementById('new-type').value.trim();
    const location = document.getElementById('new-location').value.trim();
    const price = parseFloat(document.getElementById('new-price').value);
    const bedrooms = parseInt(document.getElementById('new-bedrooms').value);
    const bathrooms = parseFloat(document.getElementById('new-bathrooms').value);
    const sqft = parseInt(document.getElementById('new-sqft').value);
    const rating = parseFloat(document.getElementById('new-rating').value);
    const reviews = parseInt(document.getElementById('new-reviews').value);
    const badge = document.getElementById('new-badge').value.trim();

    if (!title || !type || !location || isNaN(price)) {
        alert('Please fill in at least title, type, location, and price');
        return;
    }

    const newListing = {
        id: Date.now(),
        title,
        type,
        location,
        price,
        bedrooms: bedrooms || 0,
        bathrooms: bathrooms || 0,
        sqft: sqft || 0,
        rating: rating || 4.5,
        reviews: reviews || 0,
        imageClass: '',
        badge: badge || null
    };

    listings.push(newListing);
    saveListings();
    renderListings();

    // Clear form
    document.getElementById('new-title').value = '';
    document.getElementById('new-type').value = '';
    document.getElementById('new-location').value = '';
    document.getElementById('new-price').value = '';
    document.getElementById('new-bedrooms').value = '';
    document.getElementById('new-bathrooms').value = '';
    document.getElementById('new-sqft').value = '';
    document.getElementById('new-rating').value = '';
    document.getElementById('new-reviews').value = '';
    document.getElementById('new-badge').value = '';
}