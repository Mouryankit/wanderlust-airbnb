//  adding asynchronous functions of listing.js files 

const Listing = require("../models/listing.js")
const axios = require("axios");
const getCoordinates = require("../utils/geocode"); //for geocode.js file

module.exports.index = async(req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", { allListing });
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListings = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path:"reviews",
        populate: {
            path:"author",
        }
    })
    .populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested for deletion does not exist"); 
        res.redirect("/listings");
    }
    // console.log(listing); 
    // console.log(currentUser); 
    res.render("listings/show.ejs", {listing}); 
}


// after saperating geocode.js 
module.exports.createListing = async (req, res, next) => {
  try {
    const locationText = req.body.listing.location;

    if (!locationText) {
      req.flash("error", "Location is required");
      return res.redirect("/listings/new");
    }

    try {
      const geoData = await getCoordinates(locationText);

      if (!geoData) {
        req.flash("error", "Location not found");
        return res.redirect("/listings/new");
      }
      const newListing = new Listing(req.body.listing);

      newListing.owner = req.user._id;
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
      newListing.location = geoData;

      await newListing.save();

      req.flash("success", "New Listing Created!");
      res.redirect("/listings");

    } catch (err) {
      req.flash("error", err.message);
      return res.redirect("/listings/new");
    }
  } catch (error) {
    req.flash("error", error.message);
    next(error);
  }
};

module.exports.rednderEditForm = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you want to Edit does not exist"); 
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl.replace("/upload", "/upload/h_10,w_250"); 
    res.render("listings/edit.ejs", {listing, originalImageUrl}); 
}

// for geocode updation
module.exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const locationText = req.body.listing.location;

    let updatedData = { ...req.body.listing };

    if (locationText) {
      const geoData = await getCoordinates(locationText);
      console.log(geoData); 

      if (!geoData) {
        req.flash("error", "Location not found");
        return res.redirect(`/listings/${id}/edit`);
      }

      updatedData.location = geoData;
      // req.flash("success", "Location Updated!");
    }

    let listing = await Listing.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (req.file) {
      listing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
      await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);

  } catch (error) {
    req.flash("error", error.message);
    next(error);
  }
};


module.exports.destroyListing = async (req, res) => {
    let {id} = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success", "Listing Deleted! "); 
    res.redirect("/listings");
}




module.exports.searchListings = async (req, res) => {
    const { query } = req.query;

    // 1 Validate query
    if (!query || query.trim() === "") {
        req.flash("error", "Please enter something to search!");
        return res.redirect("/listings");
    }

    // 2 Escape special regex characters (security + clean search)
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedQuery, "i"); // case-insensitive

    // 3 Create search conditions
    const searchConditions = [
        { title: regex },
        // { description: regex },
        { category: regex },
        { country: regex },
        { "location.name": regex }
    ];

    console.log(searchConditions); 

    // 4 If user enters number → search in price also
    if (!isNaN(query)) {
        searchConditions.push({ price: Number(query) });
        // console.log("route checking"); 
    }

    // // 5 Search database
    const listings = await Listing.find({
        $or: searchConditions
    });
    // console.log(listings.length); 
    // 6 Handle no results
    if (listings.length === 0) {
        req.flash("error", "No matching listings found!");
        // return res.redirect("/listings");
        return res.redirect("/listings/search?query=");
    }

    // 7 Render results
    res.render("listings/index", { allListing:listings });
};





module.exports.filterByCategory = async (req, res) => {
    try {
        const { category } = req.params;

        const listings = await Listing.find({ category: category });
        // console.log(listings.length); 
        if(listings.length === 0){          
          req.flash("error", "No listing found of this type");
          // res.redirect("/listings");
        }

        res.render("listings/index", { allListing: listings });

    } catch (err) {
        console.error("Error in filterByCategory:", err);

        req.flash("error", "Something went wrong while filtering listings.");
        res.redirect("/listings");
    }
};
