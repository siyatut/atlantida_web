import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CatalogPage from "./pages/CatalogPage";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import ReviewsPage from "./pages/ReviewsPage";
import FavoritesPage from "./pages/FavoritesPage";

function App() {
  const location = useLocation();
  const isProductDetailsPage = location.pathname.startsWith("/catalog/product/");

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    const targetId = location.hash.slice(1);

    window.requestAnimationFrame(() => {
      const target = document.getElementById(targetId);

      if (!target) {
        return;
      }

      const targetTop = target.getBoundingClientRect().top + window.scrollY - 104;
      window.scrollTo({
        top: Math.max(targetTop, 0),
        behavior: "smooth",
      });
    });
  }, [location.pathname, location.hash]);

  return (
    <div
      className={`min-h-screen flex flex-col ${isProductDetailsPage ? "bg-[#F5F5F6]" : "bg-[#E7F5FB]"}`}
    >
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/category/:categoryId" element={<CategoryPage />} />
          <Route path="/catalog/category/:categoryId/products" element={<CategoryPage />} />
          <Route path="/catalog/product/:productId" element={<ProductDetailsPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
