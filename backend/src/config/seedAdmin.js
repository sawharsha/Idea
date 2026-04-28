const User = require("../models/User");

const seedAdmin = async () => {
  try {
    const existing = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (existing) return console.log("Admin already exists");

    await User.create({
      name: process.env.ADMIN_NAME || "Super Admin",
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: "admin",
      department: "Management",
      photoUrl: "",
    });

    console.log("Default admin created successfully");
  } catch (error) {
    console.error("Failed to seed admin:", error.message);
  }
};

module.exports = seedAdmin;