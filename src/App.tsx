import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import HomePage from "./pages/HomePage";
import CatalogPage from "./pages/CatalogPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import ReviewsPage from "./pages/ReviewsPage";
import FavoritesPage from "./pages/FavoritesPage";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog/*" element={<CatalogPage />} />
        <Route path="/catalog/product/:productId" element={<ProductDetailsPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
      </Route>
    </Routes>
  );
}

export default App;
