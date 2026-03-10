import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, ArrowRight, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const blogs = [
  {
    id: 1,
    category: "Wellness",
    title: "10 Essential Steps to Boost Your Immunity This Winter",
    excerpt: "Discover the scientifically proven methods to strengthen your immune system and protect your family from seasonal illnesses.",
    date: "Jan 15, 2024",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: 2,
    category: "Emergency Care",
    title: "Recognizing the Early Signs of Cardiac Arrest",
    excerpt: "Learn how to quickly identify cardiovascular warning signs. Your swift action could easily save a life before the ambulance arrives.",
    date: "Jan 12, 2024",
    image: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: 3,
    category: "Ayurveda",
    title: "Integrating Holistic Ayurvedic Practices in Daily Life",
    excerpt: "Ancient wisdom for modern wellness. Explore how natural remedies and daily Ayurvedic routines can drastically improve vitality.",
    date: "Jan 10, 2024",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80"
  }
];

const BlogSection = () => {
  return (
    <section className="py-24 bg-slate-50 relative">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <Badge
              variant="outline"
              className="mb-6 rounded-full border-primary/20 bg-primary/10 px-5 py-1.5 text-sm font-bold uppercase tracking-widest text-primary-dark shadow-sm inline-flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Health Insights
            </Badge>
            <h2 className="font-heading font-extrabold text-4xl md:text-5xl text-slate-900 mb-4 tracking-tight">
              Latest Medical <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">News & Tips</span>
            </h2>
            <p className="text-slate-600 text-lg">Stay informed with expert advice and updates directly from our specialists.</p>
          </motion.div>
          <Link 
            href="/blog"
            className="hidden md:inline-flex items-center gap-2 bg-white border-2 border-slate-200 text-slate-700 hover:border-primary hover:text-primary px-6 py-3 rounded-full font-bold transition-all shadow-sm group"
          >
            View All Articles <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog, i) => (
            <motion.article
              key={blog.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="bg-white rounded-[2rem] overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group flex flex-col border border-slate-100"
            >
              <div className="relative h-56 overflow-hidden">
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors z-10"></div>
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-700 ease-in-out"
                />
                <div className="absolute top-4 left-4 z-20">
                  <span className="bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-slate-800 shadow-md">
                    {blog.category}
                  </span>
                </div>
              </div>
              
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>{blog.date}</span>
                </div>
                
                <h3 className="font-heading font-extrabold text-2xl text-slate-900 mb-3 group-hover:text-primary transition-colors leading-tight">
                  <Link href={`/blog/${blog.id}`} className="focus:outline-none">
                    {blog.title}
                  </Link>
                </h3>
                
                <p className="text-slate-600 mb-6 line-clamp-3 leading-relaxed flex-1">
                  {blog.excerpt}
                </p>
                
                <Link 
                  href={`/blog/${blog.id}`}
                  className="inline-flex items-center gap-2 text-slate-900 font-bold text-sm uppercase tracking-wide group-hover:text-primary transition-colors mt-auto w-max"
                >
                  Read Full Article <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="text-center mt-10 md:hidden">
          <Link 
            href="/blog"
            className="inline-flex items-center justify-center gap-2 w-full bg-slate-900 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-md active:scale-95"
          >
            Load More Articles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
