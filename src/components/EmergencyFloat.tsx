import { Phone, MessageCircle } from "lucide-react";

const EmergencyFloat = () => {
  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-40 flex flex-col gap-3">
      <a
        href="https://wa.me/916386192882"
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 rounded-full bg-success text-success-foreground flex items-center justify-center shadow-card-hover hover:scale-110 transition-transform"
        aria-label="WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </a>
      <a
        href="tel:+916386192882"
        className="w-12 h-12 rounded-full bg-emergency text-emergency-foreground flex items-center justify-center shadow-emergency animate-pulse-emergency"
        aria-label="Emergency Call"
      >
        <Phone className="w-6 h-6" />
      </a>
    </div>
  );
};

export default EmergencyFloat;
