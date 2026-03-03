const { connectDb } = require("../config/db");
const Blog = require("../models/Blog");

async function run() {
  await connectDb();

  await Blog.deleteMany({});

  const blogs = await Blog.insertMany([
    {
      title: "Eye Care Tips for Daily Life",
      slug: "eye-care-tips-daily-life",
      excerpt: "Simple daily habits to protect your eyes and reduce strain.",
      content:
        "Use proper lighting while reading, reduce mobile screen time, and get periodic eye checkups. Maintain hydration and include vitamin-rich foods for better eye health.",
      category: "Eye care tips",
      published: true,
      seoTitle: "Eye Care Tips - Sharavat Pali Clinic",
      seoDescription: "Daily eye care tips by Sharavat Pali Clinic Jaunpur.",
      coverImage: "/logo.png",
    },
    {
      title: "Ayurvedic Lifestyle for Better Immunity",
      slug: "ayurvedic-lifestyle-better-immunity",
      excerpt: "Diet and routine suggestions to improve immunity naturally.",
      content:
        "Follow regular sleep cycles, include warm water, seasonal fruits, and balanced Ayurvedic herbs as advised by your doctor. Avoid processed food and stress.",
      category: "Ayurvedic lifestyle",
      published: true,
      seoTitle: "Ayurvedic Lifestyle - Sharavat Pali Clinic",
      seoDescription: "Improve immunity with Ayurvedic routine and diet tips.",
      coverImage: "/logo.png",
    },
    {
      title: "Emergency Awareness: What to Do First",
      slug: "emergency-awareness-what-to-do-first",
      excerpt: "Critical first steps before reaching hospital in emergencies.",
      content:
        "Stay calm, check airway-breathing-circulation, call emergency support immediately, and avoid unnecessary delay. Keep patient history and medicines ready.",
      category: "Emergency awareness",
      published: true,
      seoTitle: "Emergency Awareness - Sharavat Pali Clinic",
      seoDescription: "First response guide for common emergencies.",
      coverImage: "/logo.png",
    },
    {
      title: "Women Health: PCOS and Holistic Care",
      slug: "women-health-pcos-holistic-care",
      excerpt: "PCOS symptoms, lifestyle correction and treatment planning.",
      content:
        "PCOS management needs diet planning, weight control, stress reduction, and medical follow-up. Ayurveda and modern medicine can be combined under supervision.",
      category: "Women health",
      published: true,
      seoTitle: "PCOS Holistic Care - Sharavat Pali Clinic",
      seoDescription: "PCOS care guidance by Sharavat Pali Clinic doctors.",
      coverImage: "/logo.png",
    },
  ]);

  console.log("Blogs synced:", blogs.map((b) => b.slug));
  process.exit(0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
