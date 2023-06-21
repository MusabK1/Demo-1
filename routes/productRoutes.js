import express from "express";

const router = express.Router();

import { syncProducts } from "../controllers/productController.js";

router.route("/sync").post(syncProducts);

export default router;
