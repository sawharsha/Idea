const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { successResponse } = require("../utils/apiResponse");

const buildAuthPayload = (user) => ({
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department || "",
    photoUrl: user.photoUrl || "",
  },
  token: generateToken({
    id: user._id,
    role: user.role,
  }),
});

const registerUser = async (req, res) => {
  const { name, email, password, department } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({
    name,
    email,
    password,
    department: department || "",
    role: "user",
    photoUrl: req.file ? req.file.path : "",
  });

  res
    .status(201)
    .json(successResponse("User registered successfully", buildAuthPayload(user)));
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  res
    .status(200)
    .json(successResponse("Login successful", buildAuthPayload(user)));
};

const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const { name, email, department, password } = req.body;

  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (department !== undefined) user.department = department;
  if (password) user.password = password;

  if (req.file) {
    user.photoUrl = req.file.path;
  }

  await user.save();

  res
    .status(200)
    .json(successResponse("Profile updated successfully", buildAuthPayload(user)));
};

const deleteProfile = async (req, res) => {
  await User.findByIdAndDelete(req.user._id);
  res.status(200).json(successResponse("Account deleted successfully"));
};

module.exports = {
  registerUser,
  loginUser,
  updateProfile,
  deleteProfile,
};