const Admin = require("./models/Admin");
const bcrypt = require("bcryptjs");
require("./db");

async function seedAdmin() {
  const hashedPassword = await bcrypt.hash("admin123", 10); // change password as needed
  await Admin.deleteMany({});
  await Admin.create({ username: "admin", password: hashedPassword });
  console.log("Admin user created!");
  process.exit();
}

seedAdmin();
