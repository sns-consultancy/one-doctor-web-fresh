import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png"; // Adjust path if needed

export default function Logo() {
  return (
    <Link
      to="/home"
      className="logo-container"
      style={{
        display: "flex",
        alignItems: "center",
        textDecoration: "none",
        gap: "0.5rem",
      }}
      aria-label="One Doctor App Logo"
    >
      <img
        src={logo}
        alt="One Doctor Logo"
        style={{
          height: "32px",
          width: "auto",
          display: "block",
        }}
      />
      <span
        style={{
          fontWeight: "600",
          fontSize: "1.2rem",
          color: "currentColor",
          letterSpacing: "0.5px",
        }}
      >
        One Doctor
      </span>
    </Link>
  );
}
