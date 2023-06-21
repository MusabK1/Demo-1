import Product from "../models/Product.js";
import {
  BadRequestError,
  NotFoundError,
  UnAuthenticatedError,
} from "../errors/index.js";
import { isAdmin } from "../utils/checkPermissions.js";

export const syncProducts = async (req, res) => {
  const { products } = req.body;
  const { authorization } = req.headers;

  var [user, pass] = new Buffer.from(authorization.split(" ")[1], "base64")
    .toString()
    .split(":");

  if (user != "tirecenter" || pass != "maU22qt#8S2G")
    throw new UnAuthenticatedError("Authentication Invalid.");

  Promise.all([
    products.every(async (product) => {
      await Product.updateOne(
        { productId: product.productId },
        {
          ...product,
          dimension: product.width + product.depth + product.radius,
        },
        { upsert: true }
      );
    }),
  ]);

  res.status(200).json({ msg: "Products updated successfully." });
};

export const getProduct = async (req, res) => {
  const { id } = req.params;

  const product = await Product.findOne(
    { _id: id },
    { createdAt: 0, updatedAt: 0, __v: 0 }
  );

  if (!product) throw new NotFoundError("Produkti nuk u gjet.");

  res.status(200).json(product);
};

export const getProducts = async (req, res) => {
  const { search, season, manufacturer } = req.query;

  const isAdmin = req?.user?.role === "user" || req?.user?.role === "admin";

  let queryObject = {};

  if (search) {
    queryObject = {
      ...queryObject,
      $or: [{ dimension: { $regex: search, $options: "i" } }],
    };
  }

  if (season) queryObject.season = { $in: season.split(",") };

  if (manufacturer) queryObject.manufacturer = { $in: manufacturer.split(",") };

  const page = Number(req.query.page) || 1;
  const limit =
    Number(req.query.limit) > 100 ? 10 : Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let allProdcuts = await Product.aggregate([
    {
      $addFields: {
        quantity: {
          $sum: {
            $map: {
              input: "$quantity",
              as: "location",
              in: { $toDouble: "$$location.qty" },
            },
          },
        },
      },
    },
    { $match: { ...queryObject, quantity: { $gt: isAdmin ? -1 : 0 } } },
    {
      $facet: {
        metadata: [
          { $group: { _id: null, totalProducts: { $sum: 1 } } },
          { $project: { _id: 0, totalProducts: 1 } },
        ],
        data: [
          { $sort: { quantity: -1 } },
          { $project: { __v: 0, createdAt: 0, updatedAt: 0 } },
          { $skip: skip },
          { $limit: limit },
        ],
      },
    },
  ]);

  const totalProducts = allProdcuts[0]?.metadata[0]?.totalProducts || 0;

  const numOfPages = Math.ceil(totalProducts / limit) || 0;
  res
    .status(200)
    .json({ products: allProdcuts[0].data, totalProducts, numOfPages });
};
