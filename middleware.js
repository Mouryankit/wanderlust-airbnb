const Listing = require("./models/listing");
const Review = require("./models/review"); 
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema} = require("./schema.js");
const multer = require("multer");
const { storage } = require("./cloudConfig.js");

module.exports.isLoggedIn = (req, res, next) => {
    // console.log("REQ.USER...", req.user);
    // console.log(req.path, ".. ", req.originalUrl);
    if(!req.isAuthenticated()){
        // redirectUrl store karne ke liye
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in first!");
        return res.redirect("/login");
    }  
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};


module.exports.isOwner = async(req, res, next) => {
    const {id} = req.params;
    let listing = await Listing.findById(id);
    if(res.locals.currentUser && !listing.owner._id.equals(res.locals.currentUser._id)){
        req.flash("error", "You do not have permission to do Edit!"); 
        return res.redirect(`/listings/${id}`);
    }
    next(); 
};

module.exports.validateListing = async (req, res, next) => {
    // let result = await listingSchema.validate(req.body);
    // console.log(result);
    const {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map(el => el.message).join(",");
        // throw new ExpressError(400, error);
        throw new ExpressError(400, errMsg);
    }
    else{
        next();
    }
};


module.exports.validateReview = async (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    else{
        next();
    }
}

module.exports.isreviewAuthor = async(req, res, next) => {
    const {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(res.locals.currentUser && !review.author._id.equals(res.locals.currentUser._id)){
        req.flash("error", "You are not the author of this review!"); 
        return res.redirect(`/listings/${id}`);
    }
    next(); 
};


// multur logic to set the image uploaiding limit

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});


module.exports.uploadListingImage = async(req, res, next) => {
    await upload.single("listing[image]")(req, res, function (err) {
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                req.flash("error", "File too large! Max 2MB allowed.");
            } else {
                req.flash("error", err.message);
            }

            // req.flash("error", "File too large! Max 2MB allowed.");
            //  If updating listing (has id)
            if (req.params.id) {
                return res.redirect(`/listings/${req.params.id}/edit`);
            }

            //  If creating listing (no id)
            return res.redirect("/listings/new");
        }
        next();
    });
};
