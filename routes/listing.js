
if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}



const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing, uploadListingImage } = require("../middleware.js");
const listingController = require("../controllers/listing.js"); 



// Search Route
router.get("/search", wrapAsync(listingController.searchListings));
router.get("/category/:category", listingController.filterByCategory);

//  "/"  -> path
router.route("/")
    .get(wrapAsync(listingController.index))  // index route
    .post(      //create route
        isLoggedIn, 
        // upload.single('listing[image]'),
        uploadListingImage,
        validateListing,         
        wrapAsync(listingController.createListing)
    );

// New Route 
router.get(
    "/new", 
    isLoggedIn, 
    listingController.renderNewForm
);



router.route("/:id")
    .get( // show route 
        wrapAsync(listingController.showListings)
    )
    .put(   // update route
        isLoggedIn,
        isOwner, 
        // upload.single('listing[image]'),
        uploadListingImage,
        validateListing, 
        wrapAsync(listingController.updateListing)
    )
    .delete(   // delete route 
        isLoggedIn, 
        isOwner, 
        wrapAsync(listingController.destroyListing)
    );

router.get(
    "/:id/edit", 
    isLoggedIn,
    isOwner, 
    wrapAsync(listingController.rednderEditForm)
);

module.exports = router;