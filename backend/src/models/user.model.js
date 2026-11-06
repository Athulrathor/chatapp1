import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },

    e2eePublicKey: {
      type: String,
<<<<<<< HEAD
=======
      default: undefined,
>>>>>>> 325a7844f74174e37195cc97e8090c120b165731
    },

    e2eeKeyVersion: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
