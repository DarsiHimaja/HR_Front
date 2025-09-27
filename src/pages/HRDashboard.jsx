// src/pages/HRDashboard.jsx
import React, { useEffect, useState, useContext } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { ThemeContext } from "../components/ThemeContext";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function HRDashboard() {
  const { theme } = useContext(ThemeContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const deptId = localStorage.getItem("department_id");
  const hrName = localStorage.getItem("hr_name") || "HR";
  const nav = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/departments/${deptId}/posts`);
        setPosts(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch posts: " + (err?.response?.data?.detail || err.message));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [deptId]);

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  // Chart data
  const statsData = {
    labels: posts.map((p) => p.title),
    datasets: [
      {
        label: "Positions Filled",
        data: posts.map((p) => p.positions_filled),
        backgroundColor: theme === "light" ? "rgba(34,197,94,0.6)" : "rgba(34,197,94,0.8)",
      },
      {
        label: "Total Positions",
        data: posts.map((p) => p.positions),
        backgroundColor: theme === "light" ? "rgba(59,130,246,0.6)" : "rgba(59,130,246,0.8)",
      },
    ],
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="grid gap-6">
            {posts.length === 0 && (
              <div
                className={`text-center p-6 rounded-xl shadow ${
                  theme === "light" ? "bg-white text-gray-500" : "bg-gray-900 text-gray-300"
                }`}
              >
                No posts yet — create one.
              </div>
            )}
            {posts.map((p) => (
              <div
                key={p.id}
                className={`p-6 rounded-2xl shadow hover:shadow-lg transition transform hover:-translate-y-1 ${
                  theme === "light" ? "bg-white text-gray-800" : "bg-gray-800 text-gray-200"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{p.title}</h2>
                    <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">{p.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {p.stipend && (
                        <span
                          className={`px-3 py-1 text-xs rounded-full border ${
                            theme === "light"
                              ? "bg-teal-50 text-teal-700 border-teal-200"
                              : "bg-teal-900 text-teal-300 border-teal-700"
                          }`}
                        >
                          Stipend: {p.stipend}
                        </span>
                      )}
                      {p.location_preference && (
                        <span
                          className={`px-3 py-1 text-xs rounded-full border ${
                            theme === "light"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : "bg-indigo-900 text-indigo-300 border-indigo-700"
                          }`}
                        >
                          Location: {p.location_preference}
                        </span>
                      )}
                      {p.sector && (
                        <span
                          className={`px-3 py-1 text-xs rounded-full border ${
                            theme === "light"
                              ? "bg-pink-50 text-pink-700 border-pink-200"
                              : "bg-pink-900 text-pink-300 border-pink-700"
                          }`}
                        >
                          Sector: {p.sector}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex flex-col gap-2">
                    <div className="text-sm">
                      Positions: <b>{p.positions}</b>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Filled: <b>{p.positions_filled}</b>
                    </div>
                    <button
                      onClick={() => nav(`/hr/posts/${p.id}`)}
                      className={`mt-2 px-4 py-2 rounded-lg font-medium shadow transition ${
                        theme === "light"
                          ? "bg-gradient-to-r from-teal-600 to-indigo-600 text-white hover:shadow-md"
                          : "bg-gradient-to-r from-indigo-700 to-teal-500 text-gray-100 hover:shadow-lg"
                      }`}
                    >
                      View Applicants
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case "profile":
        return (
          <div
            className={`p-6 rounded-2xl shadow max-w-xl mx-auto ${
              theme === "light" ? "bg-white text-gray-800" : "bg-gray-800 text-gray-200"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <p>Name: {hrName}</p>
            <p>Department ID: {deptId}</p>
          </div>
        );

      case "notifications":
        return (
          <div
            className={`p-6 rounded-2xl shadow max-w-xl mx-auto ${
              theme === "light" ? "bg-white text-gray-800" : "bg-gray-800 text-gray-200"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            <p>No new notifications</p>
          </div>
        );

      case "statistics":
        return (
          <div
            className={`p-6 rounded-2xl shadow max-w-4xl mx-auto ${
              theme === "light" ? "bg-white text-gray-800" : "bg-gray-800 text-gray-200"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Statistics</h2>
            <Bar
              data={statsData}
              options={{
                responsive: true,
                plugins: {
                  legend: { labels: { color: theme === "light" ? "#111827" : "#f3f4f6" } },
                  title: { display: false },
                },
                scales: {
                  x: { ticks: { color: theme === "light" ? "#111827" : "#f3f4f6" } },
                  y: { ticks: { color: theme === "light" ? "#111827" : "#f3f4f6" } },
                },
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen flex ${theme === "light" ? "bg-slate-50" : "bg-gray-900"}`}>
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 shadow-lg z-20 transform transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${theme === "light" ? "bg-white text-gray-800" : "bg-gray-900 text-gray-200"}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-semibold text-lg">Menu</span>
          <button onClick={() => setSidebarOpen(false)}>
            <FiX size={24} />
          </button>
        </div>
        <nav className="flex flex-col p-4 gap-3">
          {["dashboard", "profile", "notifications", "statistics"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-left px-4 py-2 rounded-lg transition ${
                theme === "light" ? "hover:bg-teal-50" : "hover:bg-gray-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header
          className={`flex items-center justify-between px-4 py-2 sticky top-0 z-10 border-b backdrop-blur transition ${
            theme === "light" ? "bg-white/90 text-gray-800 border-gray-200" : "bg-gray-800/90 text-gray-200 border-gray-700"
          }`}
        >
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)}>
              <FiMenu size={24} />
            </button>
            <span className="font-semibold text-lg">PM Internship Portal</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm">Hi, {hrName}</span>

            {/* Selected & Rejected */}
            <button
              onClick={() => nav("/hr/selected")}
              className={`px-4 py-2 rounded-lg font-medium shadow transition ${
                theme === "light"
                  ? "bg-gradient-to-r from-indigo-600 to-teal-600 text-white hover:shadow-md"
                  : "bg-gradient-to-r from-indigo-700 to-teal-500 text-gray-100 hover:shadow-lg"
              }`}
            >
              Selected
            </button>
            <button
              onClick={() => nav("/hr/rejected")}
              className={`px-4 py-2 rounded-lg font-medium shadow transition ${
                theme === "light"
                  ? "bg-gradient-to-r from-red-600 to-pink-600 text-white hover:shadow-md"
                  : "bg-gradient-to-r from-red-700 to-pink-500 text-gray-100 hover:shadow-lg"
              }`}
            >
              Rejected
            </button>

            {/* Logout */}
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                theme === "light"
                  ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-200"
              }`}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 flex-1">{renderContent()}</main>

        {/* Footer */}
        <footer
          className={`p-4 text-sm text-center border-t backdrop-blur ${
            theme === "light" ? "bg-white/90 text-gray-600 border-gray-200" : "bg-gray-800/90 text-gray-300 border-gray-700"
          }`}
        >
          © {new Date().getFullYear()} PM Internship Scheme |{" "}
          <a
            className="text-teal-500 hover:underline"
            href="https://mca.gov.in"
            target="_blank"
            rel="noreferrer"
          >
            Ministry of Corporate Affairs
          </a>
        </footer>
      </div>
    </div>
  );
}
