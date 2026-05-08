import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ShortlistProvider } from "./hooks/useShortlist";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import Browse from "./pages/Browse";
import CarDetail from "./pages/CarDetail";
import Compare from "./pages/Compare";
import Shortlist from "./pages/Shortlist";

export default function App() {
  return (
    <BrowserRouter>
      <ShortlistProvider>
        <div className="min-h-screen bg-surface">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/results" element={<Results />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/cars/:id" element={<CarDetail />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/shortlist" element={<Shortlist />} />
          </Routes>
        </div>
      </ShortlistProvider>
    </BrowserRouter>
  );
}
