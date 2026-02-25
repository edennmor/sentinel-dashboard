import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Overview from "./pages/Overview";
import Events from "./pages/Events";
import "./components/ui.css";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/events" element={<Events />} />
      </Routes>
    </BrowserRouter>
  );
}