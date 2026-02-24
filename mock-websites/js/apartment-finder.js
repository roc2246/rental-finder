// Apartment Finder specific data and functions
localStorageKey = 'apartmentFinderListings';

timeBasedListings = {
    morning: [
        {
            id: 1,
            title: "Budget Studio Near Office",
            location: "123 Business District - 0.3 miles away",
            bedrooms: 0,
            bathrooms: 1,
            sqft: 400,
            description: "Perfect for early risers. Close to downtown offices with excellent public transport.",
            amenities: ["WiFi", "Laundry", "Public Transport"],
            price: 950,
            image: "Office Studio",
            timeBadge: "MORNING DEAL"
        },
        {
            id: 2,
            title: "1BR Commuter Special",
            location: "456 Transit Hub - 0.8 miles away",
            bedrooms: 1,
            bathrooms: 1,
            sqft: 650,
            description: "Ideal for professionals. Walking distance to metro station.",
            amenities: ["Metro Access", "Gym", "Coffee Shop"],
            price: 1350,
            image: "Commuter Apt",
            timeBadge: "COMMUTE FRIENDLY"
        },
        {
            id: 3,
            title: "Shared Workspace Loft",
            location: "789 Creative Quarter - 1.2 miles away",
            bedrooms: 1,
            bathrooms: 1,
            sqft: 800,
            description: "Great for freelancers and remote workers. Includes workspace.",
            amenities: ["Workspace", "Fast WiFi", "Meeting Rooms"],
            price: 1650,
            image: "Workspace Loft",
            timeBadge: "WORK FROM HOME"
        }
    ],
    afternoon: [
        {
            id: 4,
            title: "Family Townhouse",
            location: "321 Family Neighborhood - 2.5 miles away",
            bedrooms: 3,
            bathrooms: 2,
            sqft: 1600,
            description: "Perfect afternoon viewing. Spacious family home with backyard.",
            amenities: ["Backyard", "Garage", "Family Room"],
            price: 2850,
            image: "Family Home",
            timeBadge: "FAMILY FRIENDLY"
        },
        {
            id: 5,
            title: "Modern 2BR Apartment",
            location: "654 Urban Center - 1.1 miles away",
            bedrooms: 2,
            bathrooms: 2,
            sqft: 1100,
            description: "Contemporary living with city amenities. Great for couples.",
            amenities: ["Rooftop", "Gym", "Concierge"],
            price: 2450,
            image: "Modern Apt",
            timeBadge: "CITY LIVING"
        },
        {
            id: 6,
            title: "Suburban Retreat",
            location: "987 Quiet Suburbs - 3.2 miles away",
            bedrooms: 4,
            bathrooms: 2.5,
            sqft: 2200,
            description: "Peaceful neighborhood perfect for afternoon relaxation.",
            amenities: ["Garden", "Deck", "Quiet Street"],
            price: 3200,
            image: "Suburban House",
            timeBadge: "PEACEFUL"
        }
    ],
    evening: [
        {
            id: 7,
            title: "Luxury Penthouse",
            location: "111 Sky Tower - 0.1 miles away",
            bedrooms: 3,
            bathrooms: 3,
            sqft: 2000,
            description: "Stunning city views perfect for evening entertaining.",
            amenities: ["City Views", "Wine Cellar", "Private Elevator"],
            price: 5500,
            image: "Luxury Penthouse",
            timeBadge: "EVENING VIEWS"
        },
        {
            id: 8,
            title: "Entertainment District Loft",
            location: "222 Arts & Theater - 0.4 miles away",
            bedrooms: 2,
            bathrooms: 2,
            sqft: 1200,
            description: "Walking distance to theaters, restaurants, and nightlife.",
            amenities: ["Theater Access", "Rooftop Bar", "Valet"],
            price: 3800,
            image: "Entertainment Loft",
            timeBadge: "NIGHTLIFE"
        },
        {
            id: 9,
            title: "Rooftop Terrace Condo",
            location: "333 Downtown Heights - 0.6 miles away",
            bedrooms: 2,
            bathrooms: 2,
            sqft: 1400,
            description: "Private terrace perfect for evening gatherings and city lights.",
            amenities: ["Private Terrace", "Hot Tub", "Skyline Views"],
            price: 4200,
            image: "Terrace Condo",
            timeBadge: "TERRACE LIVING"
        }
    ],
    night: [
        {
            id: 10,
            title: "Emergency Short-Term Stay",
            location: "444 Central Location - 0.2 miles away",
            bedrooms: 1,
            bathrooms: 1,
            sqft: 500,
            description: "Available immediately for emergency situations. Flexible terms.",
            amenities: ["24/7 Access", "Flexible Lease", "Utilities Included"],
            price: 120,
            image: "Emergency Stay",
            timeBadge: "EMERGENCY",
            priceQualifier: "per night"
        },
        {
            id: 11,
            title: "Business Traveler Suite",
            location: "555 Airport Area - 0.8 miles away",
            bedrooms: 1,
            bathrooms: 1,
            sqft: 600,
            description: "Perfect for late arrivals. Close to airport and business centers.",
            amenities: ["Airport Shuttle", "Business Center", "Late Check-in"],
            price: 180,
            image: "Business Suite",
            timeBadge: "BUSINESS TRAVEL",
            priceQualifier: "per night"
        },
        {
            id: 12,
            title: "Student Housing Emergency",
            location: "666 Campus Area - 1.0 miles away",
            bedrooms: 1,
            bathrooms: 1,
            sqft: 450,
            description: "Temporary housing for students. Available for short terms.",
            amenities: ["Campus Access", "Study Areas", "Meal Plan"],
            price: 85,
            image: "Student Housing",
            timeBadge: "STUDENT",
            priceQualifier: "per night"
        }
    ]
};

// Override renderListings for apartment-finder specific DOM structure
function renderListings() {
    loadListings();
    updateTimeBasedListings();

    const listingsContainer = document.querySelector('.listings');
    if (!listingsContainer) return;

    listingsContainer.innerHTML = '';

    const currentPeriod = getCurrentTimePeriod();
    const periodDisplay = currentPeriod.charAt(0).toUpperCase() + currentPeriod.slice(1);

    // Add time badge
    const timeBadge = document.createElement('div');
    timeBadge.className = 'time-badge';
    timeBadge.textContent = `${periodDisplay} Listings`;
    listingsContainer.appendChild(timeBadge);

    listings.forEach(listing => {
        const listingEl = document.createElement('div');
        listingEl.className = 'listing rental-listing';
        listingEl.innerHTML = `
            <div class="listing-image">${listing.image || 'Property Image'}</div>
            <div class="listing-info">
                <div class="listing-header">
                    <div class="listing-title rental-title">
                        ${listing.timeBadge ? `<span class="time-badge">${listing.timeBadge}</span>` : ''}
                        ${listing.isNew ? '<span class="new-badge">NEW</span>' : ''}
                        ${listing.title}
                    </div>
                    <div class="listing-address rental-location">${listing.location}</div>
                </div>
                <div class="listing-details">
                    <div class="detail-item">
                        <span class="detail-item-label">${listing.bedrooms} Bed</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-item-label">${listing.bathrooms} Bath</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-item-label">${listing.sqft} Sqft</span>
                    </div>
                </div>
                <div class="listing-description">
                    ${listing.description || 'No description available'}
                </div>
                <div class="amenities">
                    ${(listing.amenities || []).map(amenity => `<span class="amenity">${amenity}</span>`).join('')}
                </div>
            </div>
            <div class="listing-price">
                <div>
                    <div class="price rental-price">$${listing.price}</div>
                    <div class="price-qualifier">${listing.priceQualifier || 'per month'}</div>
                </div>
                <button class="contact-button">Contact</button>
                ${listing.id >= 1000000000000 ? `<button class="delete-button" onclick="deleteListing(${listing.id})">×</button>` : ''}
            </div>
        `;
        listingsContainer.appendChild(listingEl);
    });

    // Add form for new listing
    const addForm = document.createElement('div');
    addForm.className = 'listing';
    addForm.innerHTML = `
        <div class="listing-image">Add New</div>
        <div class="listing-info">
            <input type="text" id="new-title" placeholder="Title" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <input type="text" id="new-location" placeholder="Location" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <input type="number" id="new-price" placeholder="Price" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <input type="number" id="new-bedrooms" placeholder="Bedrooms" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <input type="number" step="0.5" id="new-bathrooms" placeholder="Bathrooms" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <input type="number" id="new-sqft" placeholder="Sqft" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <textarea id="new-description" placeholder="Description" style="width: 100%; margin-bottom: 8px; padding: 8px;"></textarea>
            <input type="text" id="new-amenities" placeholder="Amenities (comma separated)" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <input type="text" id="new-image" placeholder="Image text" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <label><input type="checkbox" id="new-is-new"> Mark as NEW</label>
        </div>
        <div class="listing-price">
            <button onclick="addListing()" style="background: green; color: white; padding: 10px; border: none; border-radius: 4px; cursor: pointer;">Add Listing</button>
        </div>
    `;
    listingsContainer.appendChild(addForm);

    // Update results count and time period
    const resultsCount = document.querySelector('.results-count');
    if (resultsCount) {
        resultsCount.textContent = `${listings.length} Results Found (${periodDisplay})`;
    }
}

// Override addListing for apartment-finder specific fields
function addListing() {
    const title = document.getElementById('new-title').value.trim();
    const location = document.getElementById('new-location').value.trim();
    const price = parseFloat(document.getElementById('new-price').value);
    const bedrooms = parseInt(document.getElementById('new-bedrooms').value);
    const bathrooms = parseFloat(document.getElementById('new-bathrooms').value);
    const sqft = parseInt(document.getElementById('new-sqft').value);
    const description = document.getElementById('new-description').value.trim();
    const amenities = document.getElementById('new-amenities').value.split(',').map(a => a.trim()).filter(a => a);
    const image = document.getElementById('new-image').value.trim() || 'New Listing';
    const isNew = document.getElementById('new-is-new').checked;

    if (!title || !location || isNaN(price)) {
        alert('Please fill in at least title, location, and price');
        return;
    }

    const newListing = {
        id: Date.now(),
        title,
        location,
        price,
        bedrooms: bedrooms || 0,
        bathrooms: bathrooms || 0,
        sqft: sqft || 0,
        description,
        amenities,
        image,
        isNew,
        timeBadge: null
    };

    listings.push(newListing);
    saveListings();
    renderListings();

    // Clear form
    document.getElementById('new-title').value = '';
    document.getElementById('new-location').value = '';
    document.getElementById('new-bedrooms').value = '';
    document.getElementById('new-bathrooms').value = '';
    document.getElementById('new-sqft').value = '';
    document.getElementById('new-description').value = '';
    document.getElementById('new-amenities').value = '';
    document.getElementById('new-image').value = '';
    document.getElementById('new-is-new').checked = false;
}