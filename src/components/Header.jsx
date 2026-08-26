import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import countries from "./countries";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleArrowDown } from "@fortawesome/free-solid-svg-icons";

function Header() {
  const [active, setActive] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
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

  // Handle search and navigation
  function handleSearch(e) {
    e.preventDefault();

    if (searchTerm.trim()) {
      navigate(`/search/${encodeURIComponent(searchTerm.trim())}`);
    }
  }

  function toggleTheme() {
    setTheme((prevTheme) =>
      prevTheme === "light-theme"
        ? "dark-theme"
        : "light-theme"
    );
  }

  function handleCheckboxChange() {
    setIsChecked((prev) => !prev);
    toggleTheme();
  }

  return (
    <header>
      <nav className="fixed top-0 left-0 w-full bg-gray-800 z-10 flex items-center justify-between p-4 shadow-md">

        {/* Tactical Trends - CLICK TO GO HOME */}
        <Link
          to="/"
          className="no-underline cursor-pointer"
          onClick={() => {
            setActive(false);
            setShowCategoryDropdown(false);
            setShowCountryDropdown(false);
          }}
        >
          <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-purple-500 to-pink-500 drop-shadow-lg tracking-wide">
            Tactical Trends
          </h3>
        </Link>

        <div className="flex-grow flex justify-center md:justify-end">

          <ul className="nav-ul flex flex-wrap gap-6 justify-end">

            {/* Search */}
            <li className="flex items-center">
              <form
                onSubmit={handleSearch}
                className="flex items-center"
              >
                <input
                  type="text"
                  placeholder="Search News..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  className="py-2 px-4 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="submit"
                  className="bg-blue-500 text-white py-2 px-4 rounded-r-md hover:bg-blue-600 transition duration-200"
                >
                  <FontAwesomeIcon
                    className={
                      showCategoryDropdown
                        ? "down-arrow-icon down-arrow-icon-active"
                        : "down-arrow-icon"
                    }
                    icon={faCircleArrowDown}
                  />
                </button>
              </form>
            </li>

            {/* All News */}
            <li>
              <Link
                className="no-underline font-semibold text-white"
                to="/"
                onClick={() => setActive(!active)}
              >
                All News
              </Link>
            </li>

            {/* Top Headlines */}
            <li className="dropdown-li">

              <Link
                to="#"
                className="no-underline font-semibold flex items-center gap-2 text-white"
                onClick={(e) => {
                  e.preventDefault();

                  setShowCategoryDropdown(
                    !showCategoryDropdown
                  );

                  setShowCountryDropdown(false);
                }}
              >
                Top-Headlines{" "}

                <FontAwesomeIcon
                  className={
                    showCategoryDropdown
                      ? "down-arrow-icon down-arrow-icon-active"
                      : "down-arrow-icon"
                  }
                  icon={faCircleArrowDown}
                />
              </Link>

              <ul
                className={
                  showCategoryDropdown
                    ? "dropdown p-2 show-dropdown"
                    : "dropdown p-2"
                }
              >
                {category.map((element, index) => (
                  <li
                    key={index}
                    onClick={() =>
                      setShowCategoryDropdown(false)
                    }
                  >
                    <Link
                      to={`/top-headlines/${element}`}
                      className="flex gap-3 capitalize text-gray-800"
                      onClick={() =>
                        setActive(false)
                      }
                    >
                      {element}
                    </Link>
                  </li>
                ))}
              </ul>

            </li>

            {/* Country - kept commented as in your file */}
            {/*
            <li className="dropdown-li">
              <Link
                className="no-underline font-semibold flex items-center gap-2 text-white"
                onClick={() => {
                  setShowCountryDropdown(!showCountryDropdown);
                  setShowCategoryDropdown(false);
                }}
              >
                Country{" "}
                <FontAwesomeIcon
                  className={
                    showCountryDropdown
                      ? "down-arrow-icon down-arrow-icon-active"
                      : "down-arrow-icon"
                  }
                  icon={faCircleArrowDown}
                />
              </Link>

              <ul
                className={
                  showCountryDropdown
                    ? "dropdown p-2 show-dropdown"
                    : "dropdown p-2"
                }
              >
                {countries.map((element, index) => (
                  <li
                    key={index}
                    onClick={() =>
                      setShowCountryDropdown(
                        !showCountryDropdown
                      )
                    }
                  >
                    <Link
                      to={`/country/${element.iso_2_alpha}`}
                      className="flex gap-3"
                      onClick={() =>
                        setActive(!active)
                      }
                    >
                      <img
                        src={element.png}
                        srcSet={`https://flagcdn.com/32x24/${element.iso_2_alpha}.png 2x`}
                        alt={element.countryName}
                      />

                      <span>
                        {element.countryName}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            */}

            {/* Recommendation */}
            <li>
              <Link
                className="no-underline font-semibold sign-in-btn"
                to="./Recommended"
              >
                <button className="sign-in-button">
                  Recommendation
                </button>
              </Link>
            </li>

            {/* Dashboard */}
            <li>
              <Link
                className="no-underline font-semibold sign-in-btn"
                to="/dashboard"
              >
                <button className="sign-in-button">
                  Dashboard
                </button>
              </Link>
            </li>

            {/* Sign In */}
            <li>
              <Link
                className="no-underline font-semibold sign-in-btn"
                to="/login"
              >
                <button className="sign-in-button">
                  Sign In
                </button>
              </Link>
            </li>

            {/* My Profile */}
            <li>
              <Link
                className="no-underline font-semibold sign-in-btn"
                to="/profile"
              >
                <button className="sign-in-button">
                  My profile
                </button>
              </Link>
            </li>

            {/* AI Assistant */}
            <li>
              <Link
                className="no-underline font-semibold sign-in-btn"
                to="/ai"
              >
                <button className="sign-in-button">
                  AI Assistant
                </button>
              </Link>
            </li>

            {/* Dark Mode */}
            <li className="flex items-center">

              <input
                type="checkbox"
                className="checkbox hidden"
                id="checkbox"
                checked={isChecked}
                onChange={handleCheckboxChange}
              />

              <label
                htmlFor="checkbox"
                className="checkbox-label cursor-pointer flex items-center"
              >
                <i className="fas fa-moon"></i>
                <i className="fas fa-sun"></i>
                <span className="ball"></span>
              </label>

            </li>

          </ul>

        </div>

        {/* Hamburger */}
        <div
          className={
            active
              ? "ham-burger z-index-100 ham-open"
              : "ham-burger z-index-100"
          }
          onClick={() => setActive(!active)}
        >
          <span className="lines line-1"></span>
          <span className="lines line-2"></span>
          <span className="lines line-3"></span>
        </div>

      </nav>
    </header>
  );
}

export default Header;