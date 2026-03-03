import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmergencyFloat from "@/components/EmergencyFloat";
import MobileBottomBar from "@/components/MobileBottomBar";

type Props = {
  children: ReactNode;
  hideEmergency?: boolean;
};

const PageShell = ({ children, hideEmergency = false }: Props) => (
  <div className="min-h-screen bg-background pb-16 md:pb-0">
    <Navbar />
    <main>{children}</main>
    <Footer />
    {!hideEmergency && <EmergencyFloat />}
    <MobileBottomBar />
  </div>
);

export default PageShell;
