

const express = require("express");
// const router = express.Router(); //from this line we do not get :id from parent route 
const router = express.Router({mergeParams: true}); // to access :id from parent route  
const wrapAsync = require("../utils/wrapAsync.js"); 
const Review = require("../models/review.js"); 
const Listing = require("../models/listing.js");
const { validateReview, isLoggedIn, isreviewAuthor } = require("../middleware.js");

const reviewController = require("../controllers/review.js"); 

// Post Route 
router.post(
    "/",
    isLoggedIn, 
    validateReview, 
    wrapAsync(reviewController.createReview)
);

// delete route for listing reviews
router.delete(
    "/:reviewId",
    isreviewAuthor, 
    wrapAsync(reviewController.destroyReview)
); 

module.exports = router;



