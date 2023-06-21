import express from "express";

const router = express.Router();

import {
  cancelOrder,
  confirmOrder,
  deleteOrder,
  getOrder,
  getOrders,
  rejectOrder,
  createOrder,
  updateOrder,
} from "../controllers/orderController.js";

router.route("/").post(createOrder).get(getOrders);

router.route("/:id").get(getOrder).patch(updateOrder).delete(deleteOrder);

router.route("/:id/reject").patch(rejectOrder);

router.route("/:id/confirm").patch(confirmOrder);

router.route("/:id/cancel").patch(cancelOrder);

export default router;
