import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Overview from "./pages/Overview";
import Events from "./pages/Events";
import Login from "./pages/Login"; // ✅ add
import "./components/ui.css";

function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* login page */}
        <Route path="/login" element={<Login />} />

        {/* protected area */}
        <Route
          path="/*"
          element={
            <RequireAuth>
              <>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Overview />} />
                  <Route path="/events" element={<Events />} />
                </Routes>
              </>
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}