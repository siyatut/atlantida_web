import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { Route, Routes } from "react-router-dom";
import { useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CatalogPage from "./pages/CatalogPage";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

function App() {
  const location = useLocation();
  const isProductDetailsPage = location.pathname.startsWith("/catalog/product/");

  return (
    <div className={`min-h-screen ${isProductDetailsPage ? "bg-[#F5F5F6]" : "bg-[#E7F5FB]"}`}>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/catalog/category/:categoryId" element={<CategoryPage />} />
        <Route path="/catalog/category/:categoryId/products" element={<CategoryPage />} />
        <Route path="/catalog/product/:productId" element={<ProductDetailsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
