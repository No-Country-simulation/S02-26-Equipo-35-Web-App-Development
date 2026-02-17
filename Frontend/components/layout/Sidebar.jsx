import React from "react";
import { NavLink } from "react-router-dom";
import {
  Layout,
  Clapperboard,
  HelpCircle,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";

export const Sidebar = ({ language, setLanguage, theme, toggleTheme, t }) => {
  return (
    <nav className='col-md-3 col-lg-2 d-md-block bg-white sidebar shadow-sm px-0 h-100 bg-glass position-fixed top-0 start-0 z-3 p-0'>
      <div className='d-flex flex-column h-100'>
        {/* Logo */}
        <div className='py-4 px-4 mb-3 border-bottom d-flex align-items-center'>
          <div className='bg-primary bg-opacity-10 p-2 rounded-4 shadow-sm border border-primary border-opacity-10'>
            <Clapperboard size={20} className='text-primary' />
          </div>
          <span className='ms-3 h6 mb-0 fw-bold'>VERTICAL AI</span>
        </div>

        {/* Navigation */}
        <div className='flex-grow-1 px-3 py-3 overflow-auto'>
          <NavItem to='/' icon={<Layout />} label={t("sidebar.dashboard")} />
          <NavItem
            to='/projects'
            icon={<Clapperboard />}
            label={t("sidebar.projects")}
          />
          <NavItem to='/help' icon={<HelpCircle />} label={t("sidebar.help")} />
        </div>

        {/* Footer */}
        <div className='px-3 py-4 border-top mt-auto bg-surface'>
          {/* Language */}
          <div className='px-3 pb-3'>
            <div className='d-flex align-items-center justify-content-between'>
              <span className='small fw-bold text-muted text-uppercase'>
                Language
              </span>

              <div className='btn-group'>
                <button
                  onClick={() => setLanguage("en")}
                  className={`btn btn-sm ${
                    language === "en" ? "btn-primary" : "btn-outline-secondary"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage("es")}
                  className={`btn btn-sm ${
                    language === "es" ? "btn-primary" : "btn-outline-secondary"
                  }`}
                >
                  ES
                </button>
              </div>
            </div>
          </div>

          {/* Theme */}
          <button
            onClick={toggleTheme}
            className='btn btn-outline-secondary w-100 d-flex align-items-center justify-content-between mb-3'
          >
            <div className='d-flex align-items-center'>
              {theme === "dark" ? (
                <Moon size={16} className='me-2' />
              ) : (
                <Sun size={16} className='me-2' />
              )}
              {t("sidebar.theme")}
            </div>
            <span className='badge bg-dark text-uppercase'>{theme}</span>
          </button>

          {/* Profile */}
          <NavLink
            to='/profile'
            className='btn w-100 d-flex align-items-center border rounded-4 p-3'
          >
            <div
              className='rounded-circle bg-primary text-white d-flex align-items-center justify-content-center'
              style={{ width: "36px", height: "36px" }}
            >
              JD
            </div>

            <div className='ms-3 text-start'>
              <div className='small fw-bold'>John Doe</div>
              <div className='text-muted' style={{ fontSize: "0.7rem" }}>
                john.doe@example.com
              </div>
            </div>

            <LogOut size={16} className='ms-auto text-muted opacity-50' />
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `btn d-flex align-items-center w-100 px-4 py-3 rounded-4 mb-1 border-0 text-start ${
          isActive
            ? "btn-primary text-white shadow"
            : "btn-link text-muted text-decoration-none fw-bold small"
        }`
      }
    >
      <span className='me-3'>{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}
