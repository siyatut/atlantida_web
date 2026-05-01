import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import { isHomeHashLink, scrollToHashTarget } from "../../utils/hash-scroll";

export default function AppLayout() {
  const location = useLocation();
  const isProductDetailsPage = location.pathname.startsWith("/catalog/product/");

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    if (!isHomeHashLink(location.pathname, location.hash)) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      scrollToHashTarget(location.hash, { behavior: "smooth" });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [location.pathname, location.hash]);

  return (
    <div
      className={`flex min-h-screen flex-col ${isProductDetailsPage ? "bg-[#F5F5F6]" : "bg-[#E7F5FB]"}`}
    >
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
