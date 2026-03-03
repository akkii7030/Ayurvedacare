const { connectDb } = require("../config/db");
const Product = require("../models/Product");

async function run() {
  await connectDb();

  await Product.deleteMany({});

  const products = await Product.insertMany([
    {
      name: "Triphala Churna",
      price: 120,
      description: "Digestive and detox Ayurvedic support.",
      category: "Ayurveda",
      stock: 40,
      featured: true,
      active: true,
      image: "/logo.png",
      offerBadge: "Top Seller",
    },
    {
      name: "Ashwagandha Capsules",
      price: 250,
      description: "Stress relief and immunity support.",
      category: "Ayurveda",
      stock: 50,
      active: true,
      image: "/logo.png",
    },
    {
      name: "Neem Tablets",
      price: 180,
      description: "Skin wellness and blood purifier support.",
      category: "Ayurveda",
      stock: 35,
      active: true,
      image: "/logo.png",
    },
    {
      name: "Joint Relief Oil",
      price: 200,
      description: "Ayurvedic pain relief massage oil.",
      category: "Pain Care",
      stock: 30,
      active: true,
      image: "/logo.png",
    },
  ]);

  console.log("Products synced:", products.map((p) => p.name));
  process.exit(0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
