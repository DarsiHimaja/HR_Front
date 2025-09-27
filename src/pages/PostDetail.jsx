import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";

export default function PostDetail() {
  const { postId } = useParams();
  const deptId = localStorage.getItem("department_id");
  const token = localStorage.getItem("token");

  const [post, setPost] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matched, setMatched] = useState(null);
  const [topApplicants, setTopApplicants] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [rejectedApplicants, setRejectedApplicants] = useState([]);
  const [notification, setNotification] = useState(null);
  const [tieLinks, setTieLinks] = useState({});
  const [scheduleModal, setScheduleModal] = useState({ visible: false, applicant: null, datetime: "" });
  const [matchOption, setMatchOption] = useState("20%");
  const [emailPreview, setEmailPreview] = useState(null);
  const [sendingEmails, setSendingEmails] = useState(false);

  const API_URL = "https://backend2-1-labd.onrender.com";

  useEffect(() => {
    async function load() {
      try {
        const r1 = await api.get(`/posts/${postId}`);
        setPost(r1.data);

        const r2 = await api.get(`/departments/${deptId}/posts/${postId}/applicants`);
        setApps(r2.data);

        // Separate selected and rejected applicants
        setSelectedApplicants(r2.data.filter(a => a.status === "selected"));
        setRejectedApplicants(r2.data.filter(a => a.status === "rejected"));
      } catch (err) {
        console.error(err);
        alert("Failed to load post or applicants");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [postId, deptId]);

  async function runMatch(option) {
    try {
      const r = await api.post(`/posts/${postId}/match`, { mode: option });
      let top = r.data?.matched_top ?? [];
      if (top.length === 0) {
        top = [...apps].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      }

      if (option === "positions") {
        const numPositions = post?.positions ?? 0;
        setTopApplicants(top.slice(0, numPositions));
      } else {
        const percent = parseInt(option.replace("%", ""));
        const count = Math.ceil((percent / 100) * top.length);
        setTopApplicants(top.slice(0, count));
      }

      setMatched(r.data);
    } catch (err) {
      console.error(err);
      alert("AI match failed: " + (err?.response?.data?.detail || err.message));
    }
  }

  async function sendEmails() {
    try {
      setSendingEmails(true);
      let method, value;
      if (matchOption === "positions") {
        method = "positions";
        value = post?.positions ?? 0;
      } else {
        method = "top_percent";
        value = parseInt(matchOption.replace("%", ""));
      }

      const url = `/posts/${postId}/send_top_emails?method=${method}&value=${value}`;
      const res = await api.post(url);

      setEmailPreview({
        content: res.data.emails.map(
          (e, i) => `To: ${e.to}\nSubject: ${e.subject}\nBody:\n${e.body}\n\n---\n`
        ).join(""),
        applicant_ids: res.data.emails.map(e => e.applicant_id)
      });

      setTimeout(() => setEmailPreview(null), 60000);
    } catch (err) {
      console.error(err);
      alert("Failed to send top emails: " + (err?.response?.data?.detail || err.message));
    } finally {
      setSendingEmails(false);
    }
  }

  async function selectAllTopApplicants() {
    try {
      for (let a of topApplicants) {
        if (a.status !== "selected") {
          await fetch(`${API_BASE}/posts/${postId}/select`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ applicant_id: a.id || a.applicant_id }),
          });
        }
      }
      alert("All top candidates selected successfully!");
      reloadApplicants();
    } catch (err) {
      console.error(err);
      alert("Failed to select top candidates: " + err.message);
    }
  }

  // ---------------- Updated Select/Reject Functions ----------------
  async function selectApplicant(app) {
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ applicant_id: app.id || app.applicant_id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to select candidate");

      alert(`Candidate ${data.candidate.name} selected!`);
      setSelectedApplicants(prev => [...prev, data.candidate]);
      setRejectedApplicants(prev => prev.filter(a => a.id !== data.candidate.id));
      setApps(prev => prev.filter(a => a.id !== data.candidate.id));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  async function rejectApplicant(app) {
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ applicant_id: app.id || app.applicant_id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to reject candidate");

      alert(`Candidate ${data.candidate.name} rejected!`);
      setRejectedApplicants(prev => [...prev, data.candidate]);
      setSelectedApplicants(prev => prev.filter(a => a.id !== data.candidate.id));
      setApps(prev => prev.filter(a => a.id !== data.candidate.id));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }
  // -------------------------------------------------------------------

  async function reloadApplicants() {
    const r = await api.get(`/departments/${deptId}/posts/${postId}/applicants`);
    setApps(r.data);
    const rp = await api.get(`/posts/${postId}`);
    setPost(rp.data);
  }

  async function scheduleInterview(applicant, datetime) {
    if (!datetime) return alert("Please select date & time");
    try {
      await api.post(`/posts/${postId}/schedule`, {
        applicant_id: applicant.id || applicant.applicant_id,
        datetime_iso: datetime,
        note: "Interview scheduled",
      });
      const m = await api.get(`/posts/${postId}/meetings`);
      setMeetings(m.data);
      alert(`Interview scheduled and email sent to ${applicant.name}`);
    } catch (err) {
      console.error(err);
      alert("Failed to schedule interview: " + (err?.response?.data?.detail || err.message));
    }
  }

  async function createTieBreak() {
    const url = prompt("Enter custom tie-break test URL (optional):");
    try {
      const r = await api.post(`/posts/${postId}/tiebreak`, { custom_link: url });
      setTieLinks(r.data.links || {});
      alert(`Created ${r.data.created} tie-break tests for score ${r.data.score}`);
    } catch (e) {
      console.error(e);
      alert("Failed to create tie-break tests");
    }
  }

  async function sendTieBreakEmails() {
    try {
      if (!tieLinks || Object.keys(tieLinks).length === 0) {
        alert("No tie-break tests created yet.");
        return;
      }
      const r = await api.post(`/posts/${postId}/tiebreak/send`, { links: tieLinks });
      alert(`Tie-break emails sent to ${r.data.sent_count} applicants`);
    } catch (err) {
      console.error(err);
      alert("Failed to send tie-break emails: " + (err?.response?.data?.detail || err.message));
    }
  }

  if (loading) return <div className="p-6 text-gray-800 dark:text-gray-200">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 p-8 text-gray-900 dark:text-gray-100">
      {/* Post Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{post?.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{post?.description}</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-900 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700">Stipend: {post?.stipend || "—"}</span>
          <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">Positions: {post?.positions}</span>
          <span className="px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-900 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-700">Filled: {post?.positions_filled}</span>
        </div>

        {/* AI Match Controls */}
        <div className="mt-6 flex flex-wrap gap-3 items-center">
          <select value={matchOption} onChange={(e) => setMatchOption(e.target.value)} className="px-3 py-1 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600">
            <option value="20%">Top 20%</option>
            <option value="30%">Top 30%</option>
            <option value="positions">By No. of Positions</option>
          </select>

          <button onClick={() => runMatch(matchOption)} className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-teal-600 text-white font-medium shadow hover:shadow-md transition">Run AI Match</button>

          <button onClick={sendEmails} className="px-5 py-2 rounded-lg bg-green-600 text-white font-medium shadow hover:bg-green-700 transition">
            {sendingEmails ? "Sending..." : "Send Emails to Top Candidates"}
          </button>

          {topApplicants.length > 0 && (
            <button onClick={selectAllTopApplicants} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Select All Top Candidates</button>
          )}

          <button onClick={createTieBreak} className="px-5 py-2 rounded-lg bg-amber-500 text-white font-medium shadow hover:bg-amber-600 transition">Generate Tie-break Tests</button>

          <button onClick={sendTieBreakEmails} className="px-5 py-2 rounded-lg bg-purple-600 text-white font-medium shadow hover:bg-purple-700 transition">Send Tie-break Emails</button>

          <button onClick={() => window.history.back()} className="px-5 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition">Back</button>
        </div>

        {/* Display Tie-break Links */}
        {tieLinks && Object.keys(tieLinks).length > 0 && (
          <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold mb-2">Tie-break Links:</h4>
            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
              {Object.entries(tieLinks).map(([appId, link]) => (
                <li key={appId}>{appId}: <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">{link}</a></li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Top Applicants Table */}
      {topApplicants.length > 0 && (
        <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow overflow-x-auto">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Top Candidates ({matchOption})</h3>
          <table className="w-full min-w-[700px] table-auto border-collapse text-gray-800 dark:text-gray-200">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-3 py-2 border">Name</th>
                <th className="px-3 py-2 border">Email</th>
                <th className="px-3 py-2 border">Skills</th>
                <th className="px-3 py-2 border">Qualification</th>
                <th className="px-3 py-2 border">Location</th>
                <th className="px-3 py-2 border">AI Score</th>
                <th className="px-3 py-2 border">Status</th>
                <th className="px-3 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {topApplicants.map((a) => (
                <tr key={a.id || a.applicant_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-3 py-2 border">{a.name || "—"}</td>
                  <td className="px-3 py-2 border">{a.email || "—"}</td>
                  <td className="px-3 py-2 border">{(a.skills || []).join(", ")}</td>
                  <td className="px-3 py-2 border">{a.qualifications || "—"}</td>
                  <td className="px-3 py-2 border">{a.location || "—"}</td>
                  <td className="px-3 py-2 border font-medium text-teal-700 dark:text-teal-300">{a.score ?? "N/A"}</td>
                  <td className="px-3 py-2 border">{a.status || "Pending"}</td>
                  <td className="px-3 py-2 border flex flex-wrap gap-1">
                    <button onClick={() => selectApplicant(a)} className="px-2 py-1 text-xs bg-teal-600 text-white rounded hover:bg-teal-700 transition">Select</button>
                    <button onClick={() => rejectApplicant(a)} className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition">Reject</button>
                    <button onClick={() => setScheduleModal({ visible: true, applicant: a, datetime: "" })} className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">Schedule Interview</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* All Applicants */}
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100 mt-8">All Applicants</h2>
      <div className="grid gap-4">
        {apps.map((a) => (
          <div key={a.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow hover:shadow-md transition flex justify-between items-start">
            <div>
              <div className="font-semibold text-lg text-gray-800 dark:text-gray-100">{a.name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{a.email}</div>
              <div className="text-sm mt-1">Skills: {(a.skills || []).join(", ") || "—"}</div>
              <div className="text-sm mt-1">Score: <span className="font-medium text-teal-700 dark:text-teal-300">{a.score ?? "N/A"}</span></div>
              {a.status === "selected" && <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700 rounded">Selected</span>}
              {a.status === "rejected" && <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700 rounded">Rejected</span>}
            </div>
            <div className="flex flex-col gap-2">
              <Link to={`/profile/${a.id}`} target="_blank" className="px-3 py-1 text-sm border rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition">View Profile</Link>
              {a.status !== "selected" && a.status !== "rejected" && (
                <>
                  <button onClick={() => selectApplicant(a)} className="px-3 py-1 text-sm bg-teal-600 text-white rounded hover:bg-teal-700 transition">Select</button>
                  <button onClick={() => rejectApplicant(a)} className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition">Reject</button>
                </>
              )}
              <button onClick={() => setScheduleModal({ visible: true, applicant: a, datetime: "" })} className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">Schedule Interview</button>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Tab */}
      {selectedApplicants.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold">Selected Applicants</h2>
          {selectedApplicants.map(a => (
            <div key={a.id || a.applicant_id}>{a.name} - {a.email}</div>
          ))}
        </div>
      )}

      {/* Rejected Tab */}
      {rejectedApplicants.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold">Rejected Applicants</h2>
          {rejectedApplicants.map(a => (
            <div key={a.id || a.applicant_id}>{a.name} - {a.email}</div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModal.visible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Schedule Interview for {scheduleModal.applicant.name}</h3>
            <input type="datetime-local" value={scheduleModal.datetime} onChange={(e) => setScheduleModal(prev => ({ ...prev, datetime: e.target.value }))} className="w-full mb-4 p-2 border rounded" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setScheduleModal({ visible: false, applicant: null, datetime: "" })} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700">Cancel</button>
              <button onClick={() => { scheduleInterview(scheduleModal.applicant, scheduleModal.datetime); setScheduleModal({ visible: false, applicant: null, datetime: "" }); }} className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">Schedule</button>
            </div>
          </div>
        </div>
      )}

      {/* Email Preview Modal */}
      {emailPreview && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Email Preview</h3>
            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded h-96 overflow-y-auto">{emailPreview.content}</pre>
            <div className="flex justify-end mt-4">
              <button onClick={() => setEmailPreview(null)} className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

