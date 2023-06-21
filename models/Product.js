import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
    },
    dimension: {
      type: String,
      //   required: [true, "Please provide dimension."],
    },
    manufacturer: {
      type: String,
      required: [true, "Please provide manufacturer."],
    },
    model: {
      type: String,
    },
    expenses: {
      type: String,
    },
    inhibition: {
      type: String,
    },
    noise: {
      type: String,
    },
    weightAndSpeedIndex: {
      type: String,
    },
    vehicle: {
      type: String,
    },
    season: {
      type: String,
    },
    price: {
      type: Number,
    },
    quantity: {
      type: Array,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", ProductSchema);
