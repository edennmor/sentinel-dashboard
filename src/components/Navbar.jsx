import { NavLink } from "react-router-dom";
import "./ui.css";

export default function Navbar() {
  return (
    <div className="nav">
      <div className="nav__brand">Sentinel</div>

      <div className="nav__links">
        <NavLink to="/" end className={({ isActive }) => "nav__link" + (isActive ? " isActive" : "")}>
          Overview
        </NavLink>
        <NavLink to="/events" className={({ isActive }) => "nav__link" + (isActive ? " isActive" : "")}>
          Events
        </NavLink>
      </div>
    </div>
  );
}