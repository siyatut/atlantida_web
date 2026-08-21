import { useEffect, useLayoutEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import { animatedScrollTo, isHomeHashLink, scrollToHashTarget } from "../../utils/hash-scroll";
import { hasPendingCatalogScrollTarget } from "../../utils/catalog-scroll";

export default function AppLayout() {
  const location = useLocation();
  const isProductDetailsPage = location.pathname.startsWith("/catalog/product/");
  const isWhitePage = location.pathname === "/reviews";

  const prevPathnameRef = useRef(location.pathname);

  // Runs before browser paint: set body background and reset scroll only on page change.
  useLayoutEffect(() => {
    const bg = isProductDetailsPage ? "#F5F5F6" : isWhitePage ? "#ffffff" : "#E7F5FB";
    document.body.style.backgroundColor = bg;

    const pathnameChanged = prevPathnameRef.current !== location.pathname;
    prevPathnameRef.current = location.pathname;

    if (pathnameChanged) {
      const returningToCatalogCategory =
        !isProductDetailsPage &&
        location.pathname.startsWith("/catalog/category/") &&
        hasPendingCatalogScrollTarget();
      if (!returningToCatalogCategory) {
        animatedScrollTo(0);
      }
    }
  }, [location.pathname, location.hash, isProductDetailsPage, isWhitePage]);

  // Runs after paint: smooth scroll to hash target.
  useEffect(() => {
    if (!location.hash) return;
    if (!isHomeHashLink(location.pathname, location.hash)) return;

    const frameId = window.requestAnimationFrame(() => {
      scrollToHashTarget(location.hash, { behavior: "smooth" });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [location.pathname, location.hash]);

  return (
    <div
      className={`flex min-h-screen flex-col ${
        isProductDetailsPage ? "bg-[#F5F5F6]" : isWhitePage ? "bg-white" : "bg-[#E7F5FB]"
      }`}
    >
      <Header />
      <div className="flex-1">
        <div key={isProductDetailsPage ? location.pathname : location.pathname.startsWith("/catalog") ? "catalog" : location.pathname} className="animate-[page-enter_200ms_ease-out]">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
}
