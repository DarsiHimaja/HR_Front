import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      const token = localStorage.getItem("token");
      const deptId = localStorage.getItem("department_id");

      try {
        const res = await fetch(
          `http://localhost:8000/departments/${deptId}/posts`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // ✅ safer convention
            },
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Failed to load posts");

        setPosts(data);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch posts: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">HR Dashboard</h1>

      {posts.length === 0 ? (
        <div className="text-gray-600">No posts available</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((p) => (
            <div
              key={p.id}
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold text-indigo-700 mb-2">
                {p.title}
              </h2>
              <p className="text-gray-700 mb-2">{p.description}</p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Stipend:</span> {p.stipend || "—"}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Positions:</span> {p.positions} |{" "}
                <span className="font-medium">Filled:</span>{" "}
                {p.positions_filled ?? 0}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
