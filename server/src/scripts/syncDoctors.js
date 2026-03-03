const { connectDb } = require("../config/db");
const Doctor = require("../models/Doctor");

async function run() {
  await connectDb();

  await Doctor.deleteMany({});

  const doctors = await Doctor.insertMany([
    {
      name: "Dr. B. P. Rai",
      specialization: "M.S. (Ophthalmology)",
      fees: 700,
      bio: "Eye surgery and emergency care specialist.",
      registrationNumber: "JNP-OPH-001",
      image: "/doctor-poster.jpg",
      email: "doctor1@sharavatclinic.com",
      isActive: true,
    },
    {
      name: "Dr. A. K. Vishwakarma",
      specialization: "B.A.M.S., D.Ph",
      fees: 500,
      bio: "Ayurveda and general physician.",
      registrationNumber: "JNP-AYU-002",
      image: "/doctor-poster.jpg",
      email: "doctor2@sharavatclinic.com",
      isActive: true,
    },
    {
      name: "Dr. Anu Vishwakarma",
      specialization: "B.A.M.S. (BHU)",
      fees: 500,
      bio: "Women and pediatric care specialist.",
      registrationNumber: "JNP-AYU-003",
      image: "/doctor-poster.jpg",
      email: "doctor3@sharavatclinic.com",
      isActive: true,
    },
  ]);

  console.log("Doctors synced:", doctors.map((d) => d.name));
  process.exit(0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
