
const express = require("express");
const router = express.Router();

const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js"); 
const listingController = require("../controllers/listing.js"); 
const userController = require("../controllers/user.js"); 
const { render } = require("ejs");

router.route("/signup")
    .get(userController.renderSignUpForm)
    .post(wrapAsync(userController.signUp));

router.route("/login")
    .get(userController.renderLoginForm)
    .post( 
        saveRedirectUrl,
        passport.authenticate("local", { 
            failureRedirect: "/login" , 
            failureFlash: true
        }), 
        userController.login        
    );

router.route("/logout")
    .get(userController.logout)

router.get( // index route
    "/",
    wrapAsync(listingController.index)
);  
    

module.exports = router;
