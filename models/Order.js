import mongoose from "mongoose";

const ProductOrderSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Types.ObjectId,
    ref: "Product",
    required: [true, "Please provide product."],
  },
  quantity: {
    type: Number,
    required: [true, "Please provide quantity."],
  },
  subtotal: {
    type: Number,
    required: [true, "Please provide subtotal."],
  },
});

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user"],
    },
    products: {
      type: [ProductOrderSchema],
    },
    total: {
      type: Number,
      required: [true, "Please provide total."],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "confirmed", "rejected", "cancelled"],
        message: "Status is not valid.",
      },
      required: [true, "Please provide status"],
    },
    message: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", OrderSchema);
