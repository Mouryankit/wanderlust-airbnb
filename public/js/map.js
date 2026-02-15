const mapElement = document.getElementById("map"); 
const listingString = mapElement.dataset.listing;
const listing = JSON.parse(listingString);
const long = listing.location.coordinates[0]; 
const lat = listing.location.coordinates[1]; 
const listingTitle = listing.title; 
// console.log(lat, long)
// console.log(listing.title);

var map = L.map('map').setView([lat, long], 10); // indore

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Add marker
L.marker([lat, long])
    .addTo(map)
    .bindPopup(listingTitle)
    .openPopup();

// console.log(listing); 

