const Product = require("./models/Product");
const InvestorDocument = require("./models/InvestorDocument");
require("./db");

async function seed() {
  await Product.deleteMany({});
  await Product.insertMany([
    { name: "Product A", description: "Description A", image: "productA.jpg" },
    { name: "Product B", description: "Description B", image: "productB.jpg" }
  ]);

  await InvestorDocument.deleteMany({});
  await InvestorDocument.insertMany([
    { title: "Annual Report 2024", category: "Annual Report", file: "report2024.pdf" },
    { title: "Corporate Policy", category: "Policy", file: "policy.pdf" }
  ]);

  console.log("Seed complete!");
  process.exit();
}

seed();

