import User from "../models/User.js";
import {
  BadRequestError,
  NotFoundError,
  UnAuthenticatedError,
} from "../errors/index.js";
import { UserMapping } from "../utils/mappings/UserMapping.js";
import { isAdmin, isAdminOrCurrentUser } from "../utils/checkPermissions.js";

export const createUser = async (req, res) => {
  isAdmin(req.user);

  const {
    firstName,
    lastName,
    companyName,
    email,
    password,
    role,
    profileImg,
  } = req.body;

  if (!firstName || !lastName || !companyName || !email || !password)
    throw new BadRequestError("Ju lutemi jepni të gjitha vlerat.");

  const checkEmail = await User.findOne({ email });
  if (checkEmail) throw new BadRequestError("Email already in user.");

  const user = await User.create({
    firstName,
    lastName,
    companyName,
    email,
    password,
    role: role || "user",
    profileImg,
  });

  res.status(201).json(UserMapping(user));
};

export const getUser = async (req, res) => {
  const { id } = req.params;

  isAdminOrCurrentUser(req.user, id);

  const user = await User.findOne(
    { _id: id },
    {
      firstName: 1,
      lastName: 1,
      companyName: 1,
      email: 1,
      phone: 1,
      profileImg: 1,
      role: 1,
      description: 1,
    }
  );

  if (!user) throw new NotFoundError("User not found.");

  res.status(200).json(user);
};

export const getUsers = async (req, res) => {
  isAdmin(req.user);

  const { search, role } = req.query;

  let queryObject = {
    deleted: false,
  };

  if (search) {
    queryObject = {
      ...queryObject,
      $or: [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ],
    };
  }

  if (role) queryObject.role = { $in: role.split(",") };

  let result = User.find(queryObject);

  result = result.sort({ createdAt: -1 });

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  result = result.skip(skip).limit(limit);

  const users = await result;

  const totalUsers = await User.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalUsers / limit);

  res.status(200).json({
    users: users.map((user) => UserMapping(user)),
    totalUsers,
    numOfPages,
  });
};

export const updateUser = async (req, res) => {
  const { firstName, lastName, companyName, email, phone, description, role } =
    req.body;

  const { id } = req.params;

  if (!id || !firstName || !lastName || !companyName || !email)
    throw new BadRequestError("Please provide all values");

  isAdminOrCurrentUser(req.user, id);

  const user = await User.findOne({ _id: id });

  if (!user) throw new NotFoundError("Përdoruesi nuk u gjet.");

  user.firstName = firstName;
  user.lastName = lastName;
  user.companyName = companyName;
  user.email = email;
  user.phone = phone;
  user.description = description;
  user.role = role;

  await user.save();

  const token = user.createJWT();

  res.status(200).json({
    user: UserMapping(user),
    token,
    msg: "Përdoruesi është përditësuar.",
  });
};

export const changePassword = async (req, res) => {
  const { newPassword, confirmPassword } = req.body;
  const { id: userId } = req.params;

  isAdminOrCurrentUser(req.user, userId);

  if (!userId || !newPassword || !confirmPassword)
    throw new BadRequestError("Please provide all values");

  if (newPassword !== confirmPassword)
    throw new BadRequestError(
      "New password and confirm password must be the same."
    );

  const user = await User.findOne({ _id: userId }).select("+password");

  if (!user) throw new NotFoundError("Përdoruesi nuk u gjet.");

  user.password = newPassword;

  await user.save();

  res.status(200).json({
    user: UserMapping(user),
    msg: "Fjalëkalimi u ndryshua me sukses.",
  });
};

// export const uploadImage = async (req, res) => {
//   const { id: userId } = req.params;
//   const { profileImg } = req.files;

//   const allowedMimetype = ["image/png", "image/jpeg"];

//   isAdminOrCurrentUser(req.user, userId);

//   if (!req.files) throw new BadRequestError("Asnjë foto nuk u ngarkua.");

//   if (!allowedMimetype.includes(profileImg.mimetype))
//     throw new BadRequestError("Formati i lejuar është: .png, .jpg dhe .jpeg");

//   const date = new Date().getTime().toString();
//   const fileName = `${date}_${profileImg.name}`;

//   const path = `public/uploads/${fileName}`;

//   profileImg.mv(path, (err) => {
//     if (err) throw new BadRequestError(err);
//   });

//   const user = await User.findOne({ _id: userId });

//   if (!user) throw new NotFoundError("Përdoruesi nuk u gjet.");

//   user.profileImg = fileName;

//   await user.save();

//   res.status(200).json({ user: UserMapping(user), msg: "Foto u ndryshua me sukses." });
// };

export const uploadImage = async (req, res) => {
  const { id: userId } = req.params;
  const { profileImg } = req.body;

  isAdminOrCurrentUser(req.user, userId);

  if (!profileImg)
    throw new BadRequestError("Ju lutemi jepni të gjitha vlerat.");

  const user = await User.findOne({ _id: userId });

  if (!user) throw new NotFoundError("Përdoruesi nuk u gjet.");

  user.profileImg = profileImg;

  await user.save();

  res
    .status(200)
    .json({ user: UserMapping(user), msg: "Foto u ndryshua me sukses." });
};

export const deleteUser = async (req, res) => {
  isAdmin(req.user);

  const { id: userId } = req.params;

  if (!userId) throw new BadRequestError("Ju lutemi jepni të gjitha vlerat.");

  const user = await User.findOne({ _id: userId });

  if (!user) throw new NotFoundError("Përdoruesi nuk u gjet.");

  user.deleted = true;
  user.email = `${new Date().getTime()}@gmail.com`;

  await user.save();

  res.status(200).json({ msg: "Përdoruesi është fshirë." });
};
