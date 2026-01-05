import React from "react";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-grey-200 bg-grey-50 mt-auto">
      <div className="container mx-auto p-4 text-center flex flex-col lg:flex-row lg:justify-between gap-2">
        <p className="text-secondary-500 text-sm">
          © All Rights Reserved {currentYear} GoDrop.
        </p>

        <div className="flex items-center gap-4 justify-center text-2xl">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary-500 hover:text-primary-600 transition-colors"
            aria-label="Facebook"
          >
            <FaFacebook />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary-500 hover:text-primary-600 transition-colors"
            aria-label="Instagram"
          >
            <FaInstagram />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary-500 hover:text-primary-600 transition-colors"
            aria-label="LinkedIn"
          >
            <FaLinkedin />
          </a>
        </div>
      </div>

      {/* Additional Footer Links (Optional) */}
      <div className="border-t border-grey-200 py-3">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4 text-xs text-secondary-500">
            <Link
              to="/about"
              className="hover:text-primary-600 transition-colors"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="hover:text-primary-600 transition-colors"
            >
              Contact
            </Link>
            <Link
              to="/privacy"
              className="hover:text-primary-600 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="hover:text-primary-600 transition-colors"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
