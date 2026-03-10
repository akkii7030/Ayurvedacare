import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmergencyFloat from "@/components/EmergencyFloat";
import MobileBottomBar from "@/components/MobileBottomBar";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  hideEmergency?: boolean;
  showNavbar?: boolean;
  showFooter?: boolean;
  showMobileBar?: boolean;
};

const PageShell = ({ children, hideEmergency = false, showNavbar = true, showFooter = true, showMobileBar = true }: Props) => (
  <div className={cn("min-h-screen bg-background", showMobileBar && "pb-16 md:pb-0")}>
    {showNavbar && <Navbar />}
    <main className={cn(showNavbar && "pt-20 lg:pt-0")}>{children}</main>
    {showFooter && <Footer />}
    {!hideEmergency && showMobileBar && <EmergencyFloat />}
    {showMobileBar && <MobileBottomBar />}
  </div>
);

export default PageShell;
