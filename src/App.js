import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// Removed 'Navigate' since it's not being used
import { Landing } from "./pages/Landing";
import { Home } from "./pages/Home";
import { SubmitHealthData } from "./pages/SubmitHealthData";
import { ViewHealthData } from "./pages/ViewHealthData";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { MedicalHistory } from "./pages/MedicalHistory";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/submit"
            element={
              <ProtectedRoute>
                <SubmitHealthData />
              </ProtectedRoute>
            }
          />
          <Route
            path="/view"
            element={
              <ProtectedRoute>
                <ViewHealthData />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medical-history"
            element={
              <ProtectedRoute>
                <MedicalHistory />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}