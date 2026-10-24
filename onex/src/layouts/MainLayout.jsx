import { Outlet } from "react-router-dom";
import Navbar from "@/shared/components/Navbar";
import Footer from "@/shared/components/Footer";
import ScrollToTop from "@/shared/components/ScrollToTop";
import SiteBanner from "@/shared/components/SiteBanner";
import NotificationToastHost from "@/shared/components/Notifications/NotificationToastHost";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <ScrollToTop />
      <NotificationToastHost />
      <Navbar />
      <SiteBanner />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}