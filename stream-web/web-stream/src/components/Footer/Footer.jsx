// components/Footer.js
import React from "react";
import "./Footer.css"; // Importing the CSS file for styling

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <span>© 2023 StreamingService, Inc.</span>
        <div className="footer-links">
          <a href="/terms">Terms of Service</a>
          <a href="/privacy">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
