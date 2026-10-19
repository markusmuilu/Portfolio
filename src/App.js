import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import NbaPrediction from "./pages/NbaPrediction";
import Github from "./pages/GitHub";
import ThesisProject from "./pages/ThesisProject";
import HomeHeating from "./pages/HomeHeating";
import FinnishBasketball from "./pages/FinnishBasketball";
import "./components/NavBar.css";
import "./styles/ledger.css";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/nba_prediction" element={<NbaPrediction />} />
          <Route path="/thesis" element={<ThesisProject />} />
          <Route path="/home_heating" element={<HomeHeating />} />
          <Route path="/finnish_basketball" element={<FinnishBasketball />} />
          <Route path="/github" element={<Github />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
