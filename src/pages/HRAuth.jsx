// src/pages/HRAuth.jsx
import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";
import { ThemeContext } from "../components/ThemeContext";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// ✅ Your exact SEED_HR_USERS list
const SEED_HR_USERS = [
  { email: "it.hr@example.com", password: "it12345", name: "IT HR Manager", department_id: "it_software", category: "IT & Software" },
  { email: "bank.hr@example.com", password: "bank12345", name: "Banking HR Manager", department_id: "banking_finance", category: "Banking & Finance" },
  { email: "fmcg.hr@example.com", password: "fmcg12345", name: "FMCG HR Manager", department_id: "fmcg", category: "FMCG" },
  { email: "oil.hr@example.com", password: "oil12345", name: "Oil & Gas HR Manager", department_id: "oil_gas", category: "Oil & Gas" },
  { email: "mfg.hr@example.com", password: "mfg12345", name: "Manufacturing HR Manager", department_id: "manufacturing", category: "Manufacturing" },
  { email: "health.hr@example.com", password: "health12345", name: "Healthcare HR Manager", department_id: "healthcare", category: "Healthcare" },
  { email: "retail.hr@example.com", password: "retail12345", name: "Retail HR Manager", department_id: "retail", category: "Retail" },
  { email: "hospitality.hr@example.com", password: "hosp12345", name: "Hospitality HR Manager", department_id: "hospitality", category: "Hospitality" }
];

// ✅ Get demo credentials by exact category
const getDemoCredentials = (category) => {
  const user = SEED_HR_USERS.find(u => u.category === category);
  if (user) return { email: user.email, password: user.password };
  return { email: "", password: "" };
};

export default function HRAuth() {
  const { theme } = useContext(ThemeContext);
  const q = useQuery();
  const category = q.get("category") || "IT & Software"; // default category
  const nav = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    department_id: category.replace(/\s+/g, "_"),
  });

  const handleUseDemo = () => {
    const creds = getDemoCredentials(category);
    setForm({ ...form, email: creds.email, password: creds.password });
  };

  async function submit(e) {
    e.preventDefault();
    try {
      if (isRegister) {
        await api.post("/auth/register", form);
        alert("✅ Registered successfully! Now log in.");
        setIsRegister(false);
      } else {
        const res = await api.post("/auth/login", {
          email: form.email,
          password: form.password,
        });
        localStorage.setItem("token", res.data.access_token);
        localStorage.setItem("department_id", res.data.department_id);
        localStorage.setItem("hr_name", res.data.name);
        nav("/hr/dashboard");
      }
    } catch (err) {
      console.error(err);
      alert("Auth error: " + (err?.response?.data?.detail || err.message));
    }
  }

  // Common input classes
  const inputClasses = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none ${
    theme === "light"
      ? "border-gray-300 focus:ring-teal-500 text-gray-800 bg-white"
      : "border-gray-600 focus:ring-indigo-400 text-gray-200 bg-gray-700"
  }`;

  const buttonClasses = `w-full py-3 rounded-lg shadow-md font-medium transition ${
    theme === "light"
      ? "bg-gradient-to-r from-teal-600 to-indigo-600 text-white hover:shadow-lg"
      : "bg-gradient-to-r from-indigo-700 to-teal-700 text-white hover:shadow-lg"
  }`;

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${
      theme === "light" ? "bg-gradient-to-br from-slate-50 via-teal-50 to-indigo-50" : "bg-gray-900"
    }`}>
      <div className={`w-full max-w-md rounded-2xl shadow-xl p-8 border ${
        theme === "light" ? "bg-white border-gray-100" : "bg-gray-800 border-gray-700"
      }`}>
        <h2 className={`text-2xl font-bold mb-2 text-center ${
          theme === "light" ? "text-gray-800" : "text-gray-100"
        }`}>
          {isRegister ? "HR Register" : "HR Login"}
        </h2>
        <p className={`text-sm mb-6 text-center ${
          theme === "light" ? "text-gray-600" : "text-gray-300"
        }`}>
          Category: <span className="font-medium text-teal-500">{category}</span>
        </p>

        <form onSubmit={submit} className="space-y-4">
          {isRegister && (
            <>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full name"
                className={inputClasses}
              />
              <input
                required
                value={form.department_id}
                onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                placeholder="Department ID"
                className={inputClasses}
              />
            </>
          )}
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
            className={inputClasses}
          />
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Password"
            className={inputClasses}
          />
          <button type="submit" className={buttonClasses}>
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        {/* Demo credentials section */}
        <div className={`mt-6 p-4 border rounded-lg text-sm ${
          theme === "light" ? "bg-teal-50 text-teal-800 border-teal-100" : "bg-gray-700 text-teal-300 border-gray-600"
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <strong>Demo Credentials</strong>
              <p>Email: <code>{getDemoCredentials(category).email}</code></p>
              <p>Password: <code>{getDemoCredentials(category).password}</code></p>
            </div>
            <button
              type="button"
              onClick={handleUseDemo}
              className={`px-3 py-1 rounded-lg transition ${
                theme === "light" ? "bg-white border hover:bg-teal-100" : "bg-gray-800 border-gray-600 hover:bg-gray-600"
              }`}
            >
              Use Demo
            </button>
          </div>
          
        </div>

        <div className="mt-6 text-sm text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className={`font-medium ${
              theme === "light" ? "text-teal-700 hover:underline" : "text-teal-300 hover:underline"
            }`}
          >
            {isRegister ? "Already have an account? Login" : "New user? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
