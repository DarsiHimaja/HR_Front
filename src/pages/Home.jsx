// src/pages/Home.jsx
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Building2,
  HeartPulse,
  ShoppingBag,
  Hotel,
  Factory,
  Droplet,
  Landmark,
} from "lucide-react";
import { ThemeContext } from "../components/ThemeContext";

const categories = [
  { name: "IT & Software", icon: <Briefcase className="w-6 h-6 text-teal-600" /> },
  { name: "Banking & Finance", icon: <Landmark className="w-6 h-6 text-indigo-600" /> },
  { name: "FMCG", icon: <ShoppingBag className="w-6 h-6 text-pink-600" /> },
  { name: "Oil & Gas", icon: <Droplet className="w-6 h-6 text-orange-600" /> },
  { name: "Manufacturing", icon: <Factory className="w-6 h-6 text-yellow-600" /> },
  { name: "Healthcare", icon: <HeartPulse className="w-6 h-6 text-red-600" /> },
  { name: "Retail", icon: <Building2 className="w-6 h-6 text-purple-600" /> },
  { name: "Hospitality", icon: <Hotel className="w-6 h-6 text-blue-600" /> },
];

export default function Home() {
  const nav = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-teal-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Top gradient bar */}
      <div className="h-1 bg-gradient-to-r from-teal-500 to-indigo-600 dark:from-teal-400 dark:to-indigo-400"></div>

      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b dark:border-gray-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-lg flex items-center justify-center shadow">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-gray-800 dark:text-gray-100">
              INTERNSYNC - SmartMatch
            </span>
          </div>

          <div className="flex items-center gap-4">
            <nav className="text-sm text-gray-600 italic dark:text-gray-300">
              Smart AI-based allocation engine
            </nav>
            <button
              onClick={toggleTheme}
              className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </header>

     <section className="py-16 text-center max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          Welcome to the PM Internship Portal
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Explore top departments and manage internships with{" "}
          <span className="font-semibold">AI-powered Smart Matching</span>.
        </p>
      </section>
      
      {/* Main */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-10 text-gray-800 dark:text-gray-100 text-center">
          Explore Departments
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() =>
                nav(`/auth?category=${encodeURIComponent(cat.name)}`)
              }
              className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer border border-gray-100 dark:border-gray-700 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-teal-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl group-hover:scale-105 transition">
                  {cat.icon}
                </div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 group-hover:text-teal-700 transition">
                  {cat.name}
                </h2>
              </div>

              {/* Call to action */}
              <div className="mt-4">
                <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-sm group-hover:shadow-md transition">
                  Click to login as HR
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur border-t dark:border-gray-700 shadow-sm mt-8">
        <div className="max-w-6xl mx-auto p-4 text-sm text-gray-600 dark:text-gray-300 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>© {new Date().getFullYear()} PM Internship Scheme</span>
          <a
            className="text-teal-700 dark:text-teal-400 font-medium hover:underline"
            href="https://mca.gov.in"
            target="_blank"
            rel="noreferrer"
          >
            Ministry of Corporate Affairs
          </a>
        </div>
      </footer>
    </div>
  );
}
