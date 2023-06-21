import User from "../models/User.js";
import { BadRequestError, UnAuthenticatedError } from "../errors/index.js";
import { UserMapping } from "../utils/mappings/UserMapping.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    throw new BadRequestError("Ju lutemi jepni të gjitha vlerat.");

  const checkEmail = await User.findOne({ email });
  if (checkEmail) throw new BadRequestError("Email already in use.");

  const user = await User.create({
    name,
    email,
    password,
    role: "user",
  });

  const token = user.createJWT();

  res.status(201).json({
    user: UserMapping(user),
    token,
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new BadRequestError("Ju lutemi jepni të gjitha vlerat.");

  const user = await User.findOne({ email, deleted: false }).select(
    "+password"
  );

  if (!user) throw new UnAuthenticatedError("Invalid Credentials.");

  //   if (!user.active) throw new UnAuthenticatedError("User is not active.");

  const checkPassword = await user.comparePassword(password);
  if (!checkPassword) throw new UnAuthenticatedError("Invalid Credentials.");

  const token = user.createJWT();

  res.status(200).json({
    user: UserMapping(user),
    token,
  });
};
