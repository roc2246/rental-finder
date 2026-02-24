// Shared rental listing management functions
let listings = [];
let localStorageKey = 'rentalListings'; // Default key, can be overridden

// Time-based listings data - to be defined by each site
let timeBasedListings = {
    morning: [],
    afternoon: [],
    evening: [],
    night: []
};

function loadListings() {
    const saved = localStorage.getItem(localStorageKey);
    if (saved) {
        // Only load user listings, not time-based ones
        const allSaved = JSON.parse(saved);
        listings = allSaved.filter(listing => listing.id >= 1000000000000);
    } else {
        listings = [];
    }
    updateTimeBasedListings();
}

function saveListings() {
    // Only save user listings (not time-based ones)
    const userListings = listings.filter(listing => listing.id >= 1000000000000);
    localStorage.setItem(localStorageKey, JSON.stringify(userListings));
}

function getCurrentTimePeriod() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 24) return 'evening';
    return 'night';
}

function updateTimeBasedListings() {
    const period = getCurrentTimePeriod();
    const timeListings = timeBasedListings[period];

    // Get user listings (should already be in the listings array)
    const userListings = listings.filter(listing => listing.id >= 1000000000000);
    listings = [...timeListings, ...userListings];
    // Don't save here - time-based listings shouldn't be persisted
}

function addListing() {
    const title = document.getElementById('new-title').value.trim();
    const location = document.getElementById('new-location').value.trim();
    const price = parseFloat(document.getElementById('new-price').value);
    const bedrooms = parseInt(document.getElementById('new-bedrooms').value);
    const bathrooms = parseFloat(document.getElementById('new-bathrooms').value);
    const sqft = parseInt(document.getElementById('new-sqft').value);
    const badge = document.getElementById('new-badge').value.trim();

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
        imageClass: `alt${listings.length % 5}`,
        badge: badge || null
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
    document.getElementById('new-badge').value = '';
}

function deleteListing(id) {
    if (confirm('Are you sure you want to delete this listing?')) {
        listings = listings.filter(listing => listing.id !== id);
        saveListings();
        renderListings();
    }
}

// Load listings on page load
window.onload = function() {
    renderListings();
    // Check for time changes every minute
    setInterval(() => {
        const currentPeriod = getCurrentTimePeriod();
        const currentTimeListings = timeBasedListings[currentPeriod];
        const currentIds = currentTimeListings.map(l => l.id);

        // Check if time period changed by comparing current time-based listing IDs
        const displayedTimeIds = listings.filter(l => l.id < 1000000000000).map(l => l.id);
        if (JSON.stringify(currentIds.sort()) !== JSON.stringify(displayedTimeIds.sort())) {
            updateTimeBasedListings();
            renderListings();
        }
    }, 60000); // Check every minute
};

// Testing functions for chron/index.js logic validation
function testScrapingCompatibility() {
    console.log('🧪 Testing scraping compatibility for chron/index.js logic...');

    const rentalListings = document.querySelectorAll('.rental-listing');
    console.log(`Found ${rentalListings.length} rental listings with .rental-listing class`);

    let validListings = 0;
    let issues = [];

    rentalListings.forEach((listing, index) => {
        const title = listing.querySelector('.rental-title');
        const price = listing.querySelector('.rental-price');
        const location = listing.querySelector('.rental-location');

        if (!title) issues.push(`Listing ${index + 1}: Missing .rental-title element`);
        if (!price) issues.push(`Listing ${index + 1}: Missing .rental-price element`);
        if (!location) issues.push(`Listing ${index + 1}: Missing .rental-location element`);

        if (title && price && location) {
            validListings++;
            console.log(`✅ Listing ${index + 1}: "${title.textContent.trim()}" - "${price.textContent.trim()}" - "${location.textContent.trim()}"`);
        }
    });

    console.log(`📊 Scraping compatibility: ${validListings}/${rentalListings.length} listings are scrapeable`);

    if (issues.length > 0) {
        console.warn('⚠️ Issues found:', issues);
    } else {
        console.log('✅ All listings are compatible with chron/index.js scraping logic');
    }

    return { total: rentalListings.length, valid: validListings, issues };
}

function simulateCronJob() {
    console.log('🔄 Simulating chron/index.js cron job logic...');

    // Test scraping compatibility first
    const scrapingResult = testScrapingCompatibility();

    if (scrapingResult.valid === 0) {
        console.error('❌ Cannot simulate cron job - no scrapeable listings found');
        return;
    }

    // Simulate the scraping process from scrape.js
    const simulatedRentals = [];
    const rentalListings = document.querySelectorAll('.rental-listing');

    rentalListings.forEach((listing) => {
        const title = listing.querySelector('.rental-title');
        const price = listing.querySelector('.rental-price');
        const location = listing.querySelector('.rental-location');

        if (title && price && location) {
            simulatedRentals.push({
                title: title.textContent.trim(),
                price: price.textContent.trim(),
                location: location.textContent.trim()
            });
        }
    });

    console.log(`📋 Simulated scraping found ${simulatedRentals.length} rentals`);

    // Simulate the annotation process from chron/index.js
    const currentUrl = window.location.pathname.split('/').pop() || 'index.html';
    const annotatedRentals = simulatedRentals.map(rental => ({
        ...rental,
        listingURL: `${currentUrl}#${rental.title.replace(/\s+/g, '-').toLowerCase()}`
    }));

    console.log('🏷️ Annotated rentals for database:', annotatedRentals);

    // Simulate batch processing
    const batchSize = 10;
    const batches = [];
    for (let i = 0; i < annotatedRentals.length; i += batchSize) {
        batches.push(annotatedRentals.slice(i, i + batchSize));
    }

    console.log(`📦 Would process ${batches.length} batch(es) of max ${batchSize} rentals each`);
    console.log('🔄 Would call: addRental, updateRental, deleteRental for each batch');

    return {
        scraped: simulatedRentals,
        annotated: annotatedRentals,
        batches: batches.length,
        batchSize
    };
}

function validateDatabaseOperations() {
    console.log('🗄️ Validating database operation compatibility...');

    const scrapingResult = testScrapingCompatibility();

    if (scrapingResult.valid === 0) {
        console.error('❌ No valid listings for database operations');
        return false;
    }

    // Check if listings have required fields for database operations
    const rentalListings = document.querySelectorAll('.rental-listing');
    let dbCompatible = 0;

    rentalListings.forEach((listing, index) => {
        const title = listing.querySelector('.rental-title')?.textContent.trim();
        const price = listing.querySelector('.rental-price')?.textContent.trim();
        const location = listing.querySelector('.rental-location')?.textContent.trim();

        if (title && price && location) {
            // Simulate what would be sent to database
            const dbListing = {
                title,
                price,
                location,
                listingURL: `${window.location.pathname.split('/').pop()}#${title.replace(/\s+/g, '-').toLowerCase()}`
            };

            console.log(`💾 DB Compatible Listing ${index + 1}:`, dbListing);
            dbCompatible++;
        }
    });

    console.log(`✅ ${dbCompatible} listings are database operation compatible`);
    return dbCompatible > 0;
}

// Add testing UI to the page
function addTestingUI() {
    const testContainer = document.createElement('div');
    testContainer.id = 'chron-testing-ui';
    testContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 15px;
        border-radius: 8px;
        font-family: monospace;
        font-size: 12px;
        z-index: 10000;
        max-width: 300px;
    `;

    testContainer.innerHTML = `
        <div style="margin-bottom: 10px; font-weight: bold;">🧪 Chron Testing</div>
        <button onclick="testScrapingCompatibility()" style="width: 100%; margin-bottom: 5px; padding: 5px;">Test Scraping</button>
        <button onclick="simulateCronJob()" style="width: 100%; margin-bottom: 5px; padding: 5px;">Simulate Cron</button>
        <button onclick="validateDatabaseOperations()" style="width: 100%; margin-bottom: 10px; padding: 5px;">Validate DB Ops</button>
        <button onclick="document.getElementById('chron-testing-ui').remove()" style="width: 100%; padding: 3px; background: #666;">Close</button>
    `;

    document.body.appendChild(testContainer);
    console.log('🧪 Chron testing UI added. Check browser console for test results.');
}

// Auto-add testing UI in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.addEventListener('load', () => {
        setTimeout(addTestingUI, 1000);
    });
}

// Make testing functions globally available
window.testScrapingCompatibility = testScrapingCompatibility;
window.simulateCronJob = simulateCronJob;
window.validateDatabaseOperations = validateDatabaseOperations;