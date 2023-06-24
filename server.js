import express from "express";
import fileUpload from "express-fileupload";
import dotenv from "dotenv";
import cors from "cors";
import "express-async-errors";
import dbConn from "./db.js";
import defaultPorts from "./port.js";

const app = express();
dotenv.config();

import connectDB from "./db/connect.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import productsRoutes from "./routes/productsRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

// middleware
import authMiddleware from "./middleware/authMiddleware.js";
import notFoundMiddleware from "./middleware/notFoundMiddleware.js";
import errorHandlerMiddleware from "./middleware/errorHandlerMiddleware.js";

app.use("/public", express.static("public"));

app.use(express.json({ limit: "1mb" }));
app.use(cors());

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", authMiddleware, userRoutes);
app.use("/api/v1/product", productRoutes); // sync
app.use("/api/v1/products", authMiddleware, productsRoutes);
app.use("/api/v1/order", authMiddleware, orderRoutes);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 6000;

(async () => {
  try {
    console.log("dsadsaewq", process.env.MONGO_URL);
    await connectDB(dbConn.production.database);
    app.listen(port, () => {
      console.log(`Server is listing on port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
})();
