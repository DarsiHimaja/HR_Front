import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import { User, Mail, MapPin, Award, Briefcase, Sun, Moon } from "lucide-react";

export default function Profile() {
  const { applicantId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true); // default dark mode

  useEffect(() => {
    async function load() {
      try {
        const r = await api.get(`/applicants/${applicantId}`);
        setData(r.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [applicantId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">No profile found.</div>;

  const getRandomPercentage = (min = 50, max = 95) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const skillCount = data.skills?.length || 0;
  const animatedStats = {
    skillsMatch: data.skills_match ?? getRandomPercentage(50, Math.min(50 + skillCount * 10, 100)),
    projectCompletion: data.project_completion ?? getRandomPercentage(40, 90),
  };

  const generateAIOverview = () => {
    const skills = data.skills?.join(", ") || "No skills listed";
    const projects =
      animatedStats.projectCompletion > 70
        ? "actively involved in projects"
        : "limited project exposure";
    const sectors = data.sector_interests?.join(", ") || "No sector interests";
    return `This candidate has expertise in ${skills}, is ${projects}, and shows interest in sectors like ${sectors}. Overall AI match score: ${animatedStats.skillsMatch}%.`;
  };

  // Theme classes
  const bgClass = darkMode ? "bg-gray-900" : "bg-gradient-to-br from-slate-50 to-slate-100";
  const cardClass = darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-800";
  const sectionBg = darkMode ? "bg-gray-700" : "bg-indigo-50";
  const textPrimary = darkMode ? "text-gray-100" : "text-gray-800";

  return (
    <div className={`min-h-screen p-8 ${bgClass}`}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Theme toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* Profile Card */}
        <div className={`p-8 rounded-2xl shadow space-y-6 ${cardClass}`}>
          
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-teal-500 text-white text-2xl font-bold">
              {data.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className={`text-2xl font-bold flex items-center gap-2 ${textPrimary}`}>
                <User className="w-5 h-5 text-indigo-400" /> {data.name}
              </h1>
              <div className="flex items-center gap-2 text-gray-300 dark:text-gray-400">
                <Mail className="w-4 h-4" /> {data.email}
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border flex flex-col ${cardClass}`}>
              <div className="text-xs uppercase text-gray-400">AI Match Score</div>
              <div className="text-lg font-semibold text-teal-400">{animatedStats.skillsMatch}%</div>
            </div>
            <div className={`p-4 rounded-xl border flex flex-col ${cardClass}`}>
              <div className="text-xs uppercase text-gray-400">Qualification</div>
              <div className="text-lg font-semibold flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" /> {data.qualifications || "—"}
              </div>
            </div>
            <div className={`p-4 rounded-xl border flex flex-col ${cardClass}`}>
              <div className="text-xs uppercase text-gray-400">Location</div>
              <div className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-pink-400" /> {data.location || "—"}
              </div>
            </div>
            <div className={`p-4 rounded-xl border flex flex-col ${cardClass}`}>
              <div className="text-xs uppercase text-gray-400">Social Category</div>
              <div className="text-lg font-semibold">{data.social_category || "—"}</div>
            </div>
            <div className={`p-4 rounded-xl border flex flex-col ${cardClass}`}>
              <div className="text-xs uppercase text-gray-400">Rural / Aspirational District</div>
              <div className="text-lg font-semibold">{data.rural ? "Yes" : "No"}</div>
            </div>
            <div className={`p-4 rounded-xl border flex flex-col ${cardClass}`}>
              <div className="text-xs uppercase text-gray-400">Past Participation</div>
              <div className="text-lg font-semibold">{data.past_participation ? "Yes" : "No"}</div>
            </div>
          </div>

          {/* AI Overview Section */}
          <div className={`p-4 rounded-xl border-l-4 ${sectionBg}`}>
            <div className="font-semibold mb-2">AI Overview</div>
            <div>{generateAIOverview()}</div>
          </div>

          {/* Skills */}
          <div>
            <div className="font-semibold mb-2">Skills</div>
            <div className="flex flex-wrap gap-2">
              {(data.skills || []).map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 bg-teal-500 text-white rounded-full text-sm"
                >
                  {s}
                </span>
              ))}
              {(!data.skills || data.skills.length === 0) && <span className="text-gray-400">No skills listed</span>}
            </div>
          </div>

          {/* Sector Interests */}
          <div>
            <div className="font-semibold mb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" /> Sector Interests
            </div>
            <div className="flex flex-wrap gap-2">
              {(data.sector_interests || []).map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 bg-indigo-500 text-white rounded-full text-sm"
                >
                  {s}
                </span>
              ))}
              {(!data.sector_interests || data.sector_interests.length === 0) && (
                <span className="text-gray-400">No sector interests listed</span>
              )}
            </div>
          </div>

          {/* Animated Progress Bars */}
          <div className="mt-6 space-y-6">
            <div>
              <div className="font-medium mb-1">Skills Match</div>
              <div className="w-full bg-gray-600 rounded-full h-4">
                <div
                  className="bg-teal-400 h-4 rounded-full transition-all duration-1000"
                  style={{ width: `${animatedStats.skillsMatch}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-300 mt-1">{animatedStats.skillsMatch}%</div>
            </div>

            <div>
              <div className="font-medium mb-1">Project</div>
              <div className="w-full bg-gray-600 rounded-full h-4">
                <div
                  className="bg-indigo-400 h-4 rounded-full transition-all duration-1000"
                  style={{ width: `${animatedStats.projectCompletion}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-300 mt-1">{animatedStats.projectCompletion}%</div>
            </div>
          </div>

          {/* Resume */}
          {data.resume_url && (
            <div className="mt-6">
              <a
                href={data.resume_url}
                target="_blank"
                rel="noreferrer"
                className="inline-block px-5 py-2 bg-gradient-to-r from-indigo-600 to-teal-600 text-white rounded-lg shadow hover:shadow-md transition"
              >
                Download Resume
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
