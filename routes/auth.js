const express = require("express")
const passport = require("passport")
const multer = require("multer")
const User = require("../models/User")

const PATH = "./public/uploads"

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PATH)
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(" ").join("-") + "-" + Date.now()
    cb(null, fileName)
  },
})

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg" ||
      file.mimetype == "image/gif"
    ) {
      cb(null, true)
    } else {
      cb(null, false)
      return cb(new Error("Allowed only .png, .jpg, .jpeg and .gif"))
    }
  },
})

const router = express.Router()

// @desc    Auth with google
// @route   GET /auth/google
router.get("/google", passport.authenticate("google", { scope: ["profile"] }))

// @desc    Google auth callback
// @route   GET /auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/dashboard")
  }
)

// @desc    Login/Login user using email & password
// @route   POST /login
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/",
    failureFlash: true,
  })
)

// @desc    Register/Register user
// @route   POST /register
router.post("/register", upload.single("image"), async (req, res) => {
  const newUser = {
    displayName: req.body.first_name + " " + req.body.last_name,
    firstName: req.body.first_name,
    lastName: req.body.last_name,
    email: req.body.email,
    password: req.body.password,
    image: "uploads/" + req.file.filename,
  }

  try {
    let user = await User.findOne({ email: req.body.email })

    if (user) {
      req.flash("Email already exist.")
      res.redirect("/register")
    } else {
      await User.create(newUser)
      req.flash("Registered successfully.")
      res.redirect("/")
    }

    await User.create(newUser)
  } catch (err) {
    console.log(err)
  }
})

// @desc    Logout User
// @route   GET /auth/logout
router.get("/logout", (req, res) => {
  req.logout()
  res.redirect("/")
})

module.exports = router
