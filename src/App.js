import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import Home from "./pages/Home";
import NbaPrediction from "./pages/NbaPrediction";
import "./App.css";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nba_prediction" element={<NbaPrediction />} />
      </Routes>
    </Router>
  );
}

export default App;

