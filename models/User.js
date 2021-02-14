const mongoose = require("mongoose")
const crypto = require("crypto")
const bcrypt = require("bcryptjs")

const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
  },
  displayName: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  image: {
    type: String,
  },
  isAdmin: {
    type: Boolean,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
})

/** Hash the password before saving it to the database*/
UserSchema.pre("save", function (next) {
  /** this refers to the user passed as argument to the save method in /routes/user*/
  const user = this
  /** only hash the password if it has been modified or its new */
  if (!user.isModified("password")) return next()
  // generate the salt
  bcrypt.genSalt(10, (err, salt) => {
    /** hash the password using the generated salt */
    bcrypt.hash(user.password, salt, (err, hash) => {
      /** if an error has occured we stop hashing */
      if (err) return next(err);
      /** override the cleartext (user entered) passsword with the hashed one */
      user.password = hash;
      /** return a callback */
      next()
    })
  })
})

/** compare database password with user user entered password */
UserSchema.methods.comparePassword = (password, hash) => {
  return bcrypt.compareSync(password, hash)
}

/** add avator incase user does not have a profile picture */
UserSchema.methods.gravatar = (size) => {
  if (!this.size) size = 200
  if (!this.email) return "https://gravatar.com/avatar/?s" + size + "&d=retro"
  const md5 = crypto.createHash("md5").update(this.email).digest("hex")
  /** return avator to save to database*/
  return "https://gravatar.com/avatar/" + md5 + "?s=" + size + "&d=retro"
}

module.exports = mongoose.model("User", UserSchema)
