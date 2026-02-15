import React, { useState } from "react";
import { Link } from "react-router-dom";

function Nav_Bar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-900 shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ===== TOP BAR ===== */}
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-teal-600 dark:text-teal-300">
            LOGO
          </Link>

          {/* ===== DESKTOP MENU ===== */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/about" className="text-gray-600 hover:text-teal-600 dark:text-white">
              About
            </Link>
            <Link to="/services" className="text-gray-600 hover:text-teal-600 dark:text-white">
              Services
            </Link>
            <Link to="/projects" className="text-gray-600 hover:text-teal-600 dark:text-white">
              Projects
            </Link>
            <Link to="/blog" className="text-gray-600 hover:text-teal-600 dark:text-white">
              Blog
            </Link>
          </nav>

          {/* ===== RIGHT SIDE BUTTONS ===== */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="rounded-md bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="rounded-md bg-gray-100 px-5 py-2 text-sm font-medium text-teal-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-white"
            >
              Register
            </Link>
          </div>

          {/* ===== MOBILE HAMBURGER BUTTON ===== */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded bg-gray-100 dark:bg-gray-800"
          >
            {menuOpen ? (
              /* X ICON */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              /* HAMBURGER ICON */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

        </div>
      </div>

      {/* ===== MOBILE MENU ===== */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800">
          <nav className="flex flex-col gap-4 p-4 text-sm">
            <div className="text-white flex flex-col gap-4">
                <Link to="/about" onClick={() => setMenuOpen(false)}>
                About
                </Link>

                <Link to="/services" onClick={() => setMenuOpen(false)}>
                Services
                </Link>

                <Link to="/projects" onClick={() => setMenuOpen(false)}>
                Projects
                </Link>

                <Link to="/blog" onClick={() => setMenuOpen(false)}>
                Blog
                </Link>
            </div>
            <hr className="dark:border-gray-700" />

            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="bg-teal-600 text-white px-4 py-2 rounded text-center"
            >
              Login
            </Link>

            <Link
              to="/signup"
              onClick={() => setMenuOpen(false)}
              className="bg-teal-600 text-white px-4 py-2 rounded text-center"
            >
              Register
            </Link>

          </nav>
        </div>
      )}
    </header>
  );
}

export default Nav_Bar;
