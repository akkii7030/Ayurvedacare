const bcrypt = require("bcryptjs");
const { connectDb } = require("../config/db");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Product = require("../models/Product");
const Blog = require("../models/Blog");
const Testimonial = require("../models/Testimonial");

async function run() {
  await connectDb();
  const passwordHash = await bcrypt.hash("Admin@123", 10);

  const [admin, receptionist, accountant] = await Promise.all([
    User.findOneAndUpdate(
      { phone: "9000000001" },
      { name: "Clinic Admin", phone: "9000000001", email: "admin@sharavatclinic.com", role: "admin", passwordHash },
      { upsert: true, new: true }
    ),
    User.findOneAndUpdate(
      { phone: "9000000002" },
      { name: "Front Desk", phone: "9000000002", email: "reception@sharavatclinic.com", role: "receptionist", passwordHash },
      { upsert: true, new: true }
    ),
    User.findOneAndUpdate(
      { phone: "9000000003" },
      { name: "Accounts Team", phone: "9000000003", email: "accounts@sharavatclinic.com", role: "accountant", passwordHash },
      { upsert: true, new: true }
    ),
  ]);

  await Doctor.deleteMany({});
  const doctors = await Doctor.insertMany([
    {
      name: "Dr. A. K. Vishwakarma",
      specialization: "B.A.M.S., D.Ph",
      fees: 500,
      bio: "Ayurveda and general physician.",
      registrationNumber: "JNP-AYU-001",
      image: "/placeholder.svg",
      email: "doctor1@sharavatclinic.com",
    },
    {
      name: "Dr. Anu Vishwakarma",
      specialization: "B.A.M.S. (BHU)",
      fees: 500,
      bio: "Women and pediatric care specialist.",
      registrationNumber: "JNP-AYU-002",
      image: "/placeholder.svg",
      email: "doctor2@sharavatclinic.com",
    },
  ]);

  await Product.deleteMany({});
  await Product.insertMany([
    { name: "Triphala Churna", price: 120, description: "Digestive support", category: "Ayurveda", stock: 40, active: true, featured: true, offerBadge: "Top Seller" },
    { name: "Ashwagandha Capsules", price: 250, description: "Stress support", category: "Ayurveda", stock: 50, active: true },
    { name: "Neem Tablets", price: 180, description: "Skin wellness", category: "Ayurveda", stock: 35, active: true },
  ]);

  await Blog.deleteMany({});
  await Blog.insertMany([
    {
      title: "Emergency First Response Checklist",
      slug: "emergency-first-response-checklist",
      excerpt: "Essential steps before reaching the clinic.",
      content: "In any emergency, ensure patient airway, breathing and circulation, then call the clinic emergency number immediately.",
      category: "Emergency awareness",
      published: true,
    },
    {
      title: "Ayurvedic Lifestyle Tips for Joint Care",
      slug: "ayurvedic-lifestyle-tips-joint-care",
      excerpt: "Daily habits for better movement and pain reduction.",
      content: "Consistent sleep, anti-inflammatory diet and supervised herbal support can help joint function over time.",
      category: "Ayurvedic lifestyle",
      published: true,
    },
  ]);

  await Testimonial.deleteMany({});
  await Testimonial.insertMany([
    { name: "Rajesh Kumar", city: "Jaunpur", rating: 5, reviewText: "Excellent emergency care support.", approved: true },
    { name: "Sunita Devi", city: "Singra Mau", rating: 5, reviewText: "Very smooth cataract treatment and follow-up.", approved: true },
  ]);

  console.log("Seed completed");
  console.log({
    adminPhone: admin.phone,
    receptionistPhone: receptionist.phone,
    accountantPhone: accountant.phone,
    doctorCount: doctors.length,
  });
  process.exit(0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
