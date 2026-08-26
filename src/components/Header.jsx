import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleArrowDown } from "@fortawesome/free-solid-svg-icons";

function Header() {
  const [active, setActive] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [theme, setTheme] = useState("light-theme");
  const [isChecked, setIsChecked] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  const category = [
    "business",
    "entertainment",
    "general",
    "health",
    "science",
    "sports",
    "technology",
    "politics",
  ];

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  function handleSearch(e) {
    e.preventDefault();

    if (searchTerm.trim()) {
      navigate(`/search/${encodeURIComponent(searchTerm.trim())}`);
      setActive(false);
    }
  }

  function toggleTheme() {
    setTheme((prevTheme) =>
      prevTheme === "light-theme" ? "dark-theme" : "light-theme"
    );
  }

  function handleCheckboxChange() {
    setIsChecked((prev) => !prev);
    toggleTheme();
  }

  function closeMobileMenu() {
    setActive(false);
    setShowCategoryDropdown(false);
  }

  function toggleCategoryDropdown(e) {
    e.preventDefault();
    setShowCategoryDropdown((prev) => !prev);
  }

  return (
    <header className="site-header">
      <nav className="navbar">

        {/* ================= LOGO ================= */}

        <Link
          to="/"
          className="logo-container"
          onClick={closeMobileMenu}
        >
          <h3 className="logo-text">
            NeuroBrief
          </h3>
        </Link>

        {/* ================= DESKTOP / MOBILE MENU ================= */}

        <div className={`nav-menu-wrapper ${active ? "menu-open" : ""}`}>
          <ul className="nav-ul">

            {/* ================= SEARCH ================= */}

            <li className="nav-search-item">
              <form
                onSubmit={handleSearch}
                className="header-search-form"
              >
                <input
                  type="text"
                  placeholder="Search News..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="header-search-input"
                />

                <button
                  type="submit"
                  className="header-search-button"
                  aria-label="Search"
                >
                  🔍
                </button>
              </form>
            </li>

            {/* ================= ALL NEWS ================= */}

            <li>
              <Link
                to="/"
                className="header-link"
                onClick={closeMobileMenu}
              >
                All News
              </Link>
            </li>

            {/* ================= TOP HEADLINES ================= */}

            <li className="dropdown-li">

              <button
                className="header-link dropdown-button"
                onClick={toggleCategoryDropdown}
                type="button"
              >
                Top Headlines

                <FontAwesomeIcon
                  className={
                    showCategoryDropdown
                      ? "down-arrow-icon down-arrow-icon-active"
                      : "down-arrow-icon"
                  }
                  icon={faCircleArrowDown}
                />
              </button>

              <ul
                className={
                  showCategoryDropdown
                    ? "dropdown show-dropdown"
                    : "dropdown"
                }
              >
                {category.map((element) => (
                  <li key={element}>
                    <Link
                      to={`/top-headlines/${element}`}
                      className="dropdown-link"
                      onClick={closeMobileMenu}
                    >
                      {element}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            {/* ================= RECOMMENDATION ================= */}

            <li>
              <Link
                to="/Recommended"
                className="header-action-link"
                onClick={closeMobileMenu}
              >
                Recommendation
              </Link>
            </li>

            {/* ================= DASHBOARD ================= */}

            <li>
              <Link
                to="/dashboard"
                className="header-action-link"
                onClick={closeMobileMenu}
              >
                Dashboard
              </Link>
            </li>

            {/* ================= SIGN IN ================= */}

            <li>
              <Link
                to="/login"
                className="header-action-link"
                onClick={closeMobileMenu}
              >
                Sign In
              </Link>
            </li>

            {/* ================= PROFILE ================= */}

            <li>
              <Link
                to="/profile"
                className="header-action-link"
                onClick={closeMobileMenu}
              >
                My Profile
              </Link>
            </li>

            {/* ================= AI ================= */}

            <li>
              <Link
                to="/ai"
                className="header-action-link"
                onClick={closeMobileMenu}
              >
                AI Assistant
              </Link>
            </li>

            {/* ================= DARK MODE ================= */}

            <li className="theme-item">
              <input
                type="checkbox"
                className="checkbox hidden"
                id="checkbox"
                checked={isChecked}
                onChange={handleCheckboxChange}
              />

              <label
                htmlFor="checkbox"
                className="checkbox-label"
                aria-label="Toggle dark mode"
              >
                <i className="fas fa-moon"></i>
                <i className="fas fa-sun"></i>
                <span className="ball"></span>
              </label>
            </li>

          </ul>
        </div>

        {/* ================= HAMBURGER ================= */}

        <button
          type="button"
          className={`ham-burger ${active ? "ham-open" : ""}`}
          onClick={() => {
            setActive((prev) => !prev);
            setShowCategoryDropdown(false);
          }}
          aria-label={active ? "Close menu" : "Open menu"}
          aria-expanded={active}
        >
          <span className="lines line-1"></span>
          <span className="lines line-2"></span>
          <span className="lines line-3"></span>
        </button>

      </nav>
    </header>
  );
}

export default Header;