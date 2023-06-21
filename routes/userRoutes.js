import express from "express";

const router = express.Router();

import {
  createUser,
  getUser,
  getUsers,
  updateUser,
  changePassword,
  deleteUser,
  uploadImage,
} from "../controllers/userController.js";

router.route("/").post(createUser).get(getUsers);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);
router.route("/:id/change-password").patch(changePassword);
router.route("/:id/upload-image").patch(uploadImage);

export default router;
