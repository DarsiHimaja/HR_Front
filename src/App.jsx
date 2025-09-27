import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import HRAuth from "./pages/HRAuth";
import HRDashboard from "./pages/HRDashboard";
import PostDetail from "./pages/PostDetail";
import SelectedTab from "./pages/SelectedTab";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import RejectedTab from "./pages/RejectedTab";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<HRAuth />} />

        {/* Protected HR routes */}
        <Route
          path="/hr/dashboard"
          element={
            <ProtectedRoute>
              <HRDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/posts/:postId"
          element={
            <ProtectedRoute>
              <PostDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/selected"
          element={
            <ProtectedRoute>
              <SelectedTab />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/rejected"
          element={
            <ProtectedRoute>
              <RejectedTab />
            </ProtectedRoute>
          }
        />

        {/* Public profile view */}
        <Route path="/profile/:applicantId" element={<Profile />} />

        {/* Fallback 404 */}
        <Route
          path="*"
          element={
            <div className="p-10 text-center text-gray-600">
              404 — Page Not Found
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
