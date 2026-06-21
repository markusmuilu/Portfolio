import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import NbaPrediction from "./pages/NbaPrediction";
import Github from "./pages/GitHub";
import ThesisProject from "./pages/ThesisProject";
import "./App.css";

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nba_prediction" element={<NbaPrediction />} />
        <Route path="/thesis" element={<ThesisProject />} />
        <Route path="/github" element={<Github />} />
      </Routes>
    </Router>
  );
}

export default App;

