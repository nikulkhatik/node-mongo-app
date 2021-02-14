const express = require("express")
const { ensureAuth, ensureGuest } = require("../middleware/auth")
const User = require("../models/User")
const router = express.Router()
const App = require("../models/App")

// @desc    Login/Login Page
// @route   GET /
router.get("/", ensureGuest, (req, res) => {
  res.render("login", {
    layout: "login",
  })
})

// @desc    Login/Login Page
// @route   GET /
router.get("/register", ensureGuest, (req, res) => {
  res.render("register", {
    layout: "login",
  })
})

// @desc    Dashboard
// @route   GET /dashboard
router.get("/dashboard", ensureAuth, async (req, res) => {
  try {
    const apps = await App.find({ user: req.user.id }).lean()
    res.render("dashboard", {
      name: req.user.displayName,
      image: req.user.image,
      apps,
    })
  } catch (err) {
    console.log(err)
    res.render("error/500")
  }
})

module.exports = router
