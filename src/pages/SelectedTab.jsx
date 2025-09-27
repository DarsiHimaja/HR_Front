// src/pages/SelectedTab.jsx
import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { Download, Calendar, XCircle, Sun, Moon } from "lucide-react";

export default function SelectedTab() {
  const dept = localStorage.getItem("department_id");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meetingsByCandidate, setMeetingsByCandidate] = useState({});
  const [scheduleModal, setScheduleModal] = useState({
    visible: false,
    applicant: null,
    datetime: "",
    emailContent: "",
    joinLink: "",
  });
  const [darkTheme, setDarkTheme] = useState(true); // default dark theme

  useEffect(() => {
    load();
  }, [dept]);

  async function load() {
    if (!dept) return;
    setLoading(true);
    try {
      const r = await api.get(`/departments/${dept}/selected`);
      setList(r.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load selected candidates");
    } finally {
      setLoading(false);
    }
  }

  const toggleTheme = () => setDarkTheme(!darkTheme);

  function safeDateDisplay(isoString) {
    if (!isoString) return "—";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) {
        const d2 = new Date(isoString.replace(" ", "T"));
        return isNaN(d2.getTime()) ? isoString : d2.toLocaleString();
      }
      return d.toLocaleString();
    } catch {
      return isoString;
    }
  }

  async function downloadCSV() {
    try {
      const r = await api.get(`/departments/${dept}/selected/export`, {
        responseType: "blob",
      });
      const blob = new Blob([r.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `selected_${dept}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Export failed");
    }
  }

  function openScheduleModal(applicant) {
    const datetime = new Date();
    const formatted = datetime.toISOString().slice(0, 16); // default datetime
    const emailContent = `Subject: Interview Scheduled\n\nDear ${applicant.name},\n\nYour interview for the post has been scheduled on ${formatted}.\n\nJoin Link: [Link here]\n\nRegards,\nRecruitment Team`;
    setScheduleModal({
      visible: true,
      applicant,
      datetime: formatted,
      emailContent,
      joinLink: "",
    });
  }

  async function scheduleMeeting() {
    const { applicant, datetime } = scheduleModal;
    try {
      // Schedule only for that applicant
      const res = await api.post(`/posts/${applicant.post_id}/schedule`, {
        applicant_id: applicant.id,
        datetime_iso: datetime,
        note: "Interview scheduled",
      });

      // Copy join URL to clipboard
      try { await navigator.clipboard.writeText(res.data.join_url); } catch(e) {}

      // Update meetings for this candidate only
      setMeetingsByCandidate(prev => ({
        ...prev,
        [applicant.id]: [...(prev[applicant.id] || []), {
          meeting_id: res.data.meeting_id,
          datetime,
          join_url: res.data.join_url,
          note: "Interview scheduled"
        }]
      }));

      alert("Interview scheduled! Join link copied to clipboard.");
      setScheduleModal({ visible: false, applicant: null, datetime: "", emailContent: "", joinLink: "" });
    } catch (err) {
      console.error(err);
      alert("Scheduling failed: " + (err?.response?.data?.detail || err.message));
    }
  }

  async function rejectCandidate(postId, applicantId) {
    if (!window.confirm("Are you sure you want to reject this candidate?")) return;
    try {
      await api.post(`/posts/${postId}/reject`, { applicant_id: applicantId });
      alert("Candidate rejected.");
      load(); // refresh list
    } catch (err) {
      console.error(err);
      alert("Rejection failed: " + (err?.response?.data?.detail || err.message));
    }
  }

  if (!dept) return <div className="p-8 text-center text-gray-600">Department not set. Please login again.</div>;
  if (loading) return <div className="p-8 text-center animate-pulse">{darkTheme ? "Loading candidates..." : "Loading candidates..."}</div>;

  return (
    <div className={`${darkTheme ? "bg-gray-900 text-gray-100" : "bg-gradient-to-br from-gray-50 via-teal-50 to-emerald-50 text-gray-800"} min-h-screen p-10`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-2">
              <XCircle className={`${darkTheme ? "text-red-400" : "text-red-500"} w-8 h-8`} />
              Selected Candidates
            </h1>
            <p className={`${darkTheme ? "text-gray-300" : "text-gray-600"} text-sm mt-1`}>
              Department: <span className="font-semibold text-emerald-700">{dept}</span>
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={downloadCSV} className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md transition-all transform hover:scale-105">
              <Download className="w-4 h-4" /> Export CSV
            </button>

            <button
              onClick={() => setDarkTheme(!darkTheme)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 dark:bg-gray-200 rounded-xl hover:opacity-80 transition text-white dark:text-gray-900"
            >
              {darkTheme ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {darkTheme ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>

        {list.length === 0 ? (
          <div className={`${darkTheme ? "bg-gray-800 text-gray-300" : "bg-white text-gray-500"} p-14 rounded-2xl shadow-md text-center`}>
            No candidates selected yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {list.map((s) => (
              <div key={s.id + s.post_id} className={`${darkTheme ? "bg-gray-800" : "bg-white"} p-6 rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:scale-[1.01]`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-6">
                    <h2 className={`${darkTheme ? "text-gray-100" : "text-gray-800"} text-xl font-bold`}>{s.name}</h2>
                    <p className={`${darkTheme ? "text-gray-300" : "text-gray-600"} text-sm`}>{s.email}</p>
                    <p className={`${darkTheme ? "text-gray-400" : "text-gray-500"} text-sm mt-1`}>
                      Post: <span className="font-medium text-indigo-600">{s.post_id}</span>
                    </p>
                    <p className={`${darkTheme ? "text-gray-400" : "text-gray-500"} text-sm mt-1`}>
                      Selected at: <span className="font-medium text-emerald-700">{safeDateDisplay(s.selected_at)}</span>
                    </p>

                    {s.job_description ? (
                      <div className={`${darkTheme ? "text-gray-300" : "text-gray-700"} mt-3 text-sm leading-relaxed`}>
                        <strong className={`${darkTheme ? "text-gray-100" : "text-gray-800"}`}>Job description:</strong>
                        <div className="mt-1">{s.job_description}</div>
                      </div>
                    ) : <div className="mt-3 text-sm text-gray-400 italic">No job description available.</div>}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 items-end">
                    <button onClick={() => openScheduleModal(s)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-all text-sm">
                      <Calendar className="w-4 h-4" /> Schedule Interview
                    </button>
                    <button onClick={() => rejectCandidate(s.post_id, s.id)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-all text-sm">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>

                {/* Candidate Meetings */}
                {meetingsByCandidate[s.id] && meetingsByCandidate[s.id].length > 0 && (
                  <div className="mt-5 border-t pt-4">
                    <h4 className={`${darkTheme ? "text-gray-200" : "text-gray-700"} text-sm font-semibold mb-3`}>Scheduled Meetings</h4>
                    <div className="space-y-2">
                      {meetingsByCandidate[s.id].map((m) => (
                        <div key={m.meeting_id} className={`flex justify-between items-center p-3 rounded-lg border ${darkTheme ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-slate-50 border-gray-200 text-gray-700"}`}>
                          <div className="text-sm">{s.name} — {safeDateDisplay(m.datetime)} {m.note ? `· ${m.note}` : ""}</div>
                          <a className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700" href={m.join_url} target="_blank" rel="noreferrer">Join</a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {/* Schedule Modal */}
{scheduleModal.visible && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className={`${darkTheme ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"} rounded-xl p-6 w-[90%] max-w-md shadow-lg relative`}>
      <h3 className="text-lg font-semibold mb-4">Schedule Interview</h3>

      <label className={`${darkTheme ? "text-gray-200" : "text-gray-700"} block text-sm mb-1`}>Interview Date & Time</label>
      <input
        type="datetime-local"
        value={scheduleModal.datetime}
        onChange={(e) =>
          setScheduleModal((prev) => ({ ...prev, datetime: e.target.value }))
        }
        className={`${darkTheme ? "bg-gray-700 text-gray-100 border-gray-600 placeholder-gray-400" : "bg-white text-gray-800 border-gray-300"} w-full px-3 py-2 border rounded mb-4`}
      />

      <label className={`${darkTheme ? "text-gray-200" : "text-gray-700"} block text-sm mb-1`}>Join Link (optional)</label>
      <input
        type="text"
        placeholder="Paste custom join link"
        value={scheduleModal.joinLink || ""}
        onChange={(e) =>
          setScheduleModal((prev) => ({ ...prev, joinLink: e.target.value }))
        }
        className={`${darkTheme ? "bg-gray-700 text-gray-100 border-gray-600 placeholder-gray-400" : "bg-white text-gray-800 border-gray-300"} w-full px-3 py-2 border rounded mb-4`}
      />

      <label className={`${darkTheme ? "text-gray-200" : "text-gray-700"} block text-sm mb-1`}>Email Preview</label>
      <textarea
        value={`Subject: Interview Scheduled\n\nDear ${scheduleModal.applicant.name},\n\nYour interview for the post has been scheduled on ${scheduleModal.datetime}.\n\nJoin Link: ${scheduleModal.joinLink || "[Link here]"}\n\nRegards,\nRecruitment Team`}
        readOnly
        rows={6}
        className={`${darkTheme ? "bg-gray-700 text-gray-100 border-gray-600 placeholder-gray-400" : "bg-gray-100 text-gray-800 border-gray-300"} w-full px-3 py-2 border rounded mb-4`}
      />

      <div className="flex justify-end gap-3">
        <button
          onClick={() =>
            setScheduleModal({
              visible: false,
              applicant: null,
              datetime: "",
              emailContent: "",
              joinLink: "",
            })
          }
          className="px-4 py-2 bg-gray-500 dark:bg-gray-200 text-white dark:text-gray-800 rounded hover:opacity-80"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            try {
              const { applicant, datetime, joinLink } = scheduleModal;
              const res = await api.post(
                `/posts/${applicant.post_id}/schedule`,
                {
                  applicant_id: applicant.id,
                  datetime_iso: datetime,
                  note: "Interview scheduled",
                  join_url: joinLink || undefined,
                }
              );

              setMeetingsByCandidate((prev) => ({
                ...prev,
                [applicant.id]: [
                  ...(prev[applicant.id] || []),
                  {
                    meeting_id: res.data.meeting_id,
                    datetime,
                    join_url: joinLink || res.data.join_url,
                    note: "Interview scheduled",
                  },
                ],
              }));

              alert("Interview scheduled! Join link copied to clipboard.");
              setScheduleModal({
                visible: false,
                applicant: null,
                datetime: "",
                emailContent: "",
                joinLink: "",
              });
            } catch (err) {
              console.error(err);
              alert(
                "Scheduling failed: " + (err?.response?.data?.detail || err.message)
              );
            }
          }}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Schedule & Send
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
