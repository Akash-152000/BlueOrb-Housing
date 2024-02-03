import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    name: {
      type: String,
      minLength: [3, "Name cannot be less than 3 characters"],
      required: [true, "Name is required"],
    },
    profileImage: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      maxLength: [10, "Phone number cannot be more than 10 characters"],
      minLength: [10, "Phone number cannot be less than 10 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [8, "Password cannot be less than 8 characters"],
      // select: false,
    },
    role: {
      type: String,
      enum: ["user", "owner","admin"],
      default: "user",
    },
    history: [
      {
        type: Schema.Types.ObjectId,
        ref: "Property",
      },
    ],
    refreshToken: {
      type: String,
    },
    isSubscribed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  console.log("Pass", this.password);
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
