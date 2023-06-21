import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please provide First Name."],
      minlength: 3,
      maxlength: 20,
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Please provide Last Name."],
      minlength: 3,
      maxlength: 20,
      trim: true,
    },
    companyName: {
      type: String,
      required: [true, "Please provide Company Name."],
      minlength: 3,
    },
    email: {
      type: String,
      required: [true, "Please provide email."],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please provide password."],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 20,
      default: null,
    },
    profileImg: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      maxlength: 1000,
      default: null,
    },
    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: "The role type is not valid.",
      },
      required: [true, "Please provide role"],
    },
    resetToken: {
      type: String,
      default: null,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, role: this.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );
};

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

export default mongoose.model("User", UserSchema);
