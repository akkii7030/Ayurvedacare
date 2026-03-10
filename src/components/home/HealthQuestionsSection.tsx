import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const questions = [
  "Do you have a family history of heart disease?",
  "Do you have a personal history of heart disease?",
  "Do you have high blood pressure?",
  "Do you have high cholesterol?",
  "Do you have diabetes?",
  "Are you overweight or obese?",
  "Do you smoke or use tobacco products?",
  "Do you have a sedentary lifestyle?"
];

const HealthQuestionsSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-teal-50 to-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src="https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg"
                alt="Health consultation"
                className="w-full h-[500px] object-cover rounded-2xl"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading font-bold text-4xl text-gray-900 mb-6">
              The most popular questions to discuss good health
            </h2>
            <p className="text-gray-600 mb-8">
              View a selection of questions
            </p>
            <div className="space-y-3">
              {questions.map((question, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 text-gray-700 hover:text-primary transition-colors cursor-pointer group"
                >
                  <ChevronRight className="w-5 h-5 text-primary flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                  <span className="text-sm">{question}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HealthQuestionsSection;
