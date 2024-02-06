import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const propertySchema = new Schema(
  {
    name: {
      type: String,
      minLength: [5, "Property name should be more than 5 characters"],
      required: true,
    },
    description: {
      type: String,
      minLength: [10, "Please describe the property in detail"],
      required: true,
    },
    address: {
      type: String,
      minLength: [8, "Please provide proper address"],
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: Number,
      required: true,
    },
    availableFrom: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    propertyType: {
      type: String,
      required: true,
    },
    rooms: {
      type: Number,
      required: true,
    },
    bathrooms: {
      type: Number,
      required: true,
    },
    area: {
      type: Number,
      required: true,
    },
    images: {
      type: [
        {
          type: String,
        },
      ],
      required: [true, "At least one image is required"],
      validate: {
        validator: (array) => array.length > 0,
        message: "At least one image is required",
      },
    },
    transactionType: {
      type: String,
      required: true,
    },
    furnished: {
      type: String,
      enum: ["Furnished", "Semi-Furnished", "Unfurnished"],
      required: true,
    },
    balconies: {
      type: Number,
      required: true,
    },
    parking: {
      type: String,
      required: true,
      enum: ["Available", "Unavailable"],
    },
    yearOfConstruction: {
      type: Number,
      required: true,
    },
    tenantType: {
      type: String,
      enum: ["Single-Men", "Family", "Single-Women", "All"],
      required: true,
    },
    videos: {
      type: [
        {
          type: String,
        },
      ],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gym: {
      type: String,
      enum: ["Available", "Unavailable"],
      default: "Unavailable",
    },
    visitorParking: {
      type: String,
      enum: ["Available", "Unavailable"],
      default: "Unavailable",
    },
    garden: {
      type: String,
      enum: ["Available", "Unavailable"],
      default: "Unavailable",
    },
    swimmingPool: {
      type: String,
      enum: ["Available", "Unavailable"],
      default: "Unavailable",
    },
    clubHouse: {
      type: String,
      enum: ["Available", "Unavailable"],
      default: "Unavailable",
    },
    nearbySchool: {
      type: Number,
      required: true,
    },
    nearbyHospital: {
      type: Number,
      required: true,
    },
    nearbyBusStation: {
      type: Number,
      required: true,
    },
    nearbyRailwayStation: {
      type: Number,
      required: true,
    },
    views: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

propertySchema.plugin(mongooseAggregatePaginate);

export const Property = mongoose.model("Property", propertySchema);
