// Realty Hub specific data and functions
localStorageKey = 'realtyHubListings';

timeBasedListings = {
    morning: [
        {
            id: 1,
            title: "Downtown Office Studio",
            location: "Business District, Financial Center",
            bedrooms: 0,
            bathrooms: 1,
            sqft: 450,
            price: 1200,
            image: "🏢 Office Studio",
            tags: ["COMMUTE FRIENDLY", "WiFi", "Laundry"],
            timeBadge: "MORNING DEAL"
        },
        {
            id: 2,
            title: "Transit Hub Apartment",
            location: "Metro Station Area, Midtown",
            bedrooms: 1,
            bathrooms: 1,
            sqft: 650,
            price: 1500,
            image: "🚇 Transit Apt",
            tags: ["QUICK ACCESS", "Metro", "Gym"],
            timeBadge: "COMMUTE SPECIAL"
        },
        {
            id: 3,
            title: "Early Bird Loft",
            location: "Creative Quarter, Arts District",
            bedrooms: 1,
            bathrooms: 1,
            sqft: 750,
            price: 1750,
            image: "🎨 Creative Loft",
            tags: ["WORKSPACE", "Fast WiFi", "Meeting Rooms"],
            timeBadge: "MORNING PRODUCTIVE"
        }
    ],
    afternoon: [
        {
            id: 4,
            title: "Family Townhouse",
            location: "Residential Neighborhood, Suburbs",
            bedrooms: 3,
            bathrooms: 2.5,
            sqft: 1800,
            price: 2800,
            image: "🏠 Family Home",
            tags: ["FAMILY FRIENDLY", "Garage", "Yard"],
            timeBadge: "AFTERNOON PICKUP"
        },
        {
            id: 5,
            title: "Modern 2BR with Balcony",
            location: "Urban District, City Center",
            bedrooms: 2,
            bathrooms: 2,
            sqft: 1100,
            price: 2200,
            image: "🌆 City Views",
            tags: ["BALCONY", "Modern", "Parking"],
            timeBadge: "FAMILY TIME"
        },
        {
            id: 6,
            title: "Pet-Friendly Condo",
            location: "Green Neighborhood, Midtown",
            bedrooms: 2,
            bathrooms: 2,
            sqft: 950,
            price: 1950,
            image: "🐕 Pet Friendly",
            tags: ["PET WELCOME", "Garden", "Storage"],
            timeBadge: "AFTERNOON WALK"
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
            image: "🎭 Arts Loft",
            tags: ["NIGHTLIFE", "Rooftop", "Concierge"],
            timeBadge: "EVENING OUT"
        },
        {
            id: 8,
            title: "Rooftop Terrace Condo",
            location: "Skyline Area, Midtown",
            bedrooms: 2,
            bathrooms: 2,
            sqft: 1300,
            price: 3500,
            image: "🌃 Rooftop View",
            tags: ["TERRACE", "Luxury", "Valet"],
            timeBadge: "EVENING VIEWS"
        },
        {
            id: 9,
            title: "Luxury Penthouse",
            location: "Elite District, Downtown",
            bedrooms: 3,
            bathrooms: 3,
            sqft: 2000,
            price: 5500,
            image: "🏙️ Luxury Penthouse",
            tags: ["PREMIUM", "Concierge", "Private Elevator"],
            timeBadge: "EVENING LUXURY"
        }
    ],
    night: [
        {
            id: 10,
            title: "Emergency Short-Term Studio",
            location: "Central Location, Downtown",
            bedrooms: 0,
            bathrooms: 1,
            sqft: 350,
            price: 800,
            image: "🏨 Short Term",
            tags: ["EMERGENCY", "Flexible", "No Deposit"],
            timeBadge: "NIGHT STAY"
        },
        {
            id: 11,
            title: "Monthly Flex Apartment",
            location: "Midtown, Business District",
            bedrooms: 1,
            bathrooms: 1,
            sqft: 500,
            price: 950,
            image: "📅 Flex Lease",
            tags: ["MONTH-TO-MONTH", "Utilities Included", "Furnished"],
            timeBadge: "TEMPORARY"
        },
        {
            id: 12,
            title: "Budget Crash Pad",
            location: "Residential Area, Near Transit",
            bedrooms: 1,
            bathrooms: 1,
            sqft: 400,
            price: 700,
            image: "🛏️ Crash Pad",
            tags: ["BUDGET", "Basic", "Quick Move-in"],
            timeBadge: "OVERNIGHT"
        }
    ]
};

// Override renderListings for realty-hub specific DOM structure
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
        listingEl.className = 'listing-card rental-listing';
        listingEl.innerHTML = `
            <div class="listing-image">${listing.image}</div>
            <div class="listing-content">
                <div class="price rental-price">$${listing.price.toLocaleString()}</div>
                <div class="price-per-month">per month</div>
                <div class="address rental-title">
                    ${listing.timeBadge ? `<span class="time-badge">${listing.timeBadge}</span>` : ''}
                    ${listing.title}
                </div>
                <div class="location rental-location">${listing.location}</div>
                <div class="property-details">
                    <div class="detail">
                        <div class="detail-value">${listing.bedrooms}</div>
                        <div class="detail-label">Beds</div>
                    </div>
                    <div class="detail">
                        <div class="detail-value">${listing.bathrooms}</div>
                        <div class="detail-label">Baths</div>
                    </div>
                    <div class="detail">
                        <div class="detail-value">${listing.sqft.toLocaleString()}</div>
                        <div class="detail-label">Sqft</div>
                    </div>
                </div>
                <div class="listing-tags">
                    ${listing.tags.map(tag => `<span class="tag ${tag.toLowerCase() === 'featured' ? 'featured' : ''}">${tag}</span>`).join('')}
                </div>
                ${listing.id >= 1000000000000 ? `<button class="delete-button" onclick="deleteListing(${listing.id})">×</button>` : ''}
            </div>
        `;
        listingsContainer.appendChild(listingEl);
    });

    // Add form for new listing
    const addForm = document.createElement('div');
    addForm.className = 'listing-card';
    addForm.innerHTML = `
        <div class="listing-image">➕ Add New</div>
        <div class="listing-content">
            <input type="text" id="new-title" placeholder="Title" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <input type="text" id="new-location" placeholder="Location" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <input type="number" id="new-price" placeholder="Price" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <input type="number" id="new-bedrooms" placeholder="Bedrooms" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <input type="number" step="0.5" id="new-bathrooms" placeholder="Bathrooms" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <input type="number" id="new-sqft" placeholder="Sqft" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <input type="text" id="new-image" placeholder="Image emoji/text" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <input type="text" id="new-tags" placeholder="Tags (comma separated)" style="width: 100%; margin-bottom: 8px; padding: 8px;">
            <button onclick="addListing()" style="background: green; color: white; padding: 10px; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Add Listing</button>
        </div>
    `;
    listingsContainer.appendChild(addForm);
}

// Override addListing for realty-hub specific fields
function addListing() {
    const title = document.getElementById('new-title').value.trim();
    const location = document.getElementById('new-location').value.trim();
    const price = parseFloat(document.getElementById('new-price').value);
    const bedrooms = parseInt(document.getElementById('new-bedrooms').value);
    const bathrooms = parseFloat(document.getElementById('new-bathrooms').value);
    const sqft = parseInt(document.getElementById('new-sqft').value);
    const image = document.getElementById('new-image').value.trim();
    const tags = document.getElementById('new-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);

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
        image: image || '🏠 New Listing',
        tags: tags.length > 0 ? tags : ['New']
    };

    listings.push(newListing);
    saveListings();
    renderListings();

    // Clear form
    document.getElementById('new-title').value = '';
    document.getElementById('new-location').value = '';
    document.getElementById('new-price').value = '';
    document.getElementById('new-bedrooms').value = '';
    document.getElementById('new-bathrooms').value = '';
    document.getElementById('new-sqft').value = '';
    document.getElementById('new-image').value = '';
    document.getElementById('new-tags').value = '';
}

// Initialize on page load
window.onload = function() {
    renderListings();
};