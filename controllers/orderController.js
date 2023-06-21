import nodemailer from "nodemailer";

import Order from "../models/Order.js";
import { BadRequestError, NotFoundError } from "../errors/index.js";
import { isAdmin, isAdminOrCurrentUser } from "../utils/checkPermissions.js";

export const createOrder = async (req, res) => {
  const { userId, products, total } = req.body;

  if (!userId || !products || !total)
    throw new BadRequestError("Ju lutemi jepni të gjitha fushat.");

  // TODO: Check quantity

  const order = await Order.create({
    userId,
    products,
    total,
    status: "pending",
  });

  res.status(201).json(order);
};

export const getOrder = async (req, res) => {
  const { id } = req.params;

  const order = await Order.findOne(
    { _id: id },
    { userId: 1, products: 1, total: 1, status: 1, message: 1, createdAt: 1 }
  );

  if (!order) throw new NotFoundError("Porosia nuk u gjet.");

  res.status(200).json(order);
};

export const getOrders = async (req, res) => {
  const { userId, status } = req.query;

  let queryObject = {};

  if (userId) queryObject.userId = userId;

  if (req.user.role === "user") {
    queryObject.userId = req?.user?.userId;
  }

  if (status && typeof status === "string") queryObject.status = status;

  let result = Order.find(queryObject).populate([
    {
      path: "userId",
      model: "User",
      select: "_id firstName lastName companyName phone",
    },
    {
      path: "products.productId",
      model: "Product",
      select: "_id productId manufacturer model dimension price season",
    },
  ]);

  result = result.sort({ createdAt: -1 });

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  let orders = await result;

  orders = orders.map((order) => {
    const { _id, userId, products, total, status, message, createdAt } = order;

    return {
      _id,
      user: userId,
      products,
      total,
      status,
      message,
      createdAt,
    };
  });

  const totalOrders = await Order.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalOrders / limit);

  res.status(200).json({ orders, totalOrders, numOfPages });
};

export const getMyOrders = async (req, res) => {};

export const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { products, total, status } = req.body;

  if (!id || !products || !total || !status)
    throw new BadRequestError("Ju lutemi jepni të gjitha vlerat.");

  const order = await Order.findOne({ _id: id });

  isAdminOrCurrentUser(req.user, order?.userId);

  if (!order) throw new NotFoundError("Porosia nuk u gjet.");

  order.products = products;
  order.total = total;
  order.status = status;

  await order.save();

  res.status(200).json({ msg: "Porosia është përditësuar." });
};

export const confirmOrder = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  isAdmin(req.user);

  const order = await Order.findOne({
    _id: id,
    status: { $in: ["pending", "rejected"] },
  }).populate("userId");

  if (!order) throw new NotFoundError("Porosia nuk u gjet.");

  order.status = "confirmed";
  order.message = message;

  if (!order?.userId?.deleted) {
    let mailOptions = {
      from: { name: "Veç Goma", address: process.env.EMAIL_USER },
      to: order?.userId?.email,
      subject: `Porosia është konfirmuar`,
      html: `<!doctype html>
      <html>
        <head>
        </head>
        <body>
          Përshëndetje <b>${order?.userId?.companyName}</b>, <br><br>
          Porosia juaj me nr. #${order._id} është konfirmuar.
          <br><br>
          © Veç Goma
        </body>
      </html>`,
    };

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process?.env?.EMAIL_USER, pass: process?.env?.EMAIL_PASS },
    });

    transporter.sendMail(mailOptions, function (error) {
      if (error) return res.status(400).json({ error });
    });
  }

  await order.save();

  res.status(200).json({ msg: "Porosia është konfirmuar." });
};

export const rejectOrder = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  isAdmin(req.user);

  const order = await Order.findOne({
    _id: id,
    status: { $in: ["pending", "confirmed"] },
  }).populate("userId");

  if (!order) throw new NotFoundError("Porosia nuk u gjet.");

  order.status = "rejected";
  order.message = message;

  if (!order?.userId?.deleted) {
    let mailOptions = {
      from: { name: "Veç Goma", address: process.env.EMAIL_USER },
      to: order?.userId?.email,
      subject: `Porosia është refuzuar`,
      html: `<!doctype html>
      <html>
        <head>
        </head>
        <body>
          Përshëndetje <b>${order?.userId?.companyName}</b>, <br><br>
          Porosia juaj me nr. #${order._id} është refuzuar.
         <br><br>
          © Veç Goma
        </body>
      </html>`,
    };

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process?.env?.EMAIL_USER, pass: process?.env?.EMAIL_PASS },
    });

    transporter.sendMail(mailOptions, function (error) {
      if (error) return res.status(400).json({ error });
    });
  }

  await order.save();

  res.status(200).json({ msg: "Porosia është refuzuar." });
};

export const cancelOrder = async (req, res) => {
  const { id } = req.params;

  const { userId } = req.body;

  if (!userId) throw new BadRequestError("Ju lutemi jepni të gjitha vlerat.");

  isAdminOrCurrentUser(req.user, userId);

  const order = await Order.findOne({ _id: id, status: "pending" }).populate(
    "userId"
  );

  if (!order) throw new NotFoundError("Porosia nuk u gjet.");

  order.status = "cancelled";

  await order.save();

  res.status(200).json({ msg: "Porosia është anuluar." });
};

export const deleteOrder = async (req, res) => {
  const { id } = req.params;

  if (!id) throw new BadRequestError("Ju lutemi jepni të gjitha vlerat.");

  isAdmin(req.user);

  const order = await Order.deleteOne({ _id: id });

  if (!order.deletedCount) throw new NotFoundError("Porosia nuk u gjet.");

  res.status(200).json({ msg: "Porosia është fshirë." });
};
