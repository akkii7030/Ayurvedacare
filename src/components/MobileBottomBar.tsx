import { Phone, MessageCircle, Calendar } from "lucide-react";
import Link from "next/link";

const MobileBottomBar = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-md border-t border-border shadow-card">
      <div className="flex items-center justify-around py-2">
        <a
          href="tel:+916386192882"
          className="flex flex-col items-center gap-0.5 text-emergency text-xs font-medium"
        >
          <Phone className="w-5 h-5" />
          Call
        </a>
        <a
          href="https://wa.me/916386192882"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-0.5 text-success text-xs font-medium"
        >
          <MessageCircle className="w-5 h-5" />
          WhatsApp
        </a>
        <Link
          href="/booking"
          className="flex flex-col items-center gap-0.5 -mt-4 bg-hero-gradient text-primary-foreground rounded-full p-3 shadow-card-hover"
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">Book</span>
        </Link>
        <a
          href="tel:+916386192882"
          className="flex flex-col items-center gap-0.5 text-xs font-medium animate-pulse-emergency"
        >
          <div className="w-5 h-5 rounded-full bg-emergency flex items-center justify-center">
            <Phone className="w-3 h-3 text-emergency-foreground" />
          </div>
          <span className="text-emergency">SOS</span>
        </a>
      </div>
    </div>
  );
};

export default MobileBottomBar;
