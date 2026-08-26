import React, { useEffect, useState } from "react";

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = `${import.meta.env.VITE_API_URL}/api`;

  const fetchDashboard = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please sign in first.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/dashboard`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const text = await response.text();

      if (!response.ok) {
        throw new Error(text || "Failed to load dashboard.");
      }

      const result = text ? JSON.parse(text) : {};

      console.log("DASHBOARD RESPONSE:", result);

      setData(result);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <h2 className="text-xl font-semibold">
          Loading dashboard...
        </h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <p className="text-red-600 font-semibold mb-4">
            {error}
          </p>

          <button
            onClick={fetchDashboard}
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const statistics = data?.statistics || {};

  const articles = statistics.articles || 0;
  const users = statistics.users || 0;
  const bookmarks = statistics.bookmarks || 0;
  const reviews = statistics.reviews || 0;

  const categories = data?.categories || [];

  return (
    <div className="min-h-screen bg-gray-100 p-6 pt-32">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              Dashboard
            </h1>

            <p className="text-gray-600 mt-2">
              Your Neural Knights activity overview
            </p>
          </div>

          <button
            onClick={fetchDashboard}
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg"
          >
            Refresh
          </button>
        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          {/* ARTICLES */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-500 font-semibold">
              Total Articles
            </p>

            <h2 className="text-4xl font-bold text-blue-600 mt-3">
              {articles}
            </h2>
          </div>

          {/* USERS */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-500 font-semibold">
              Total Users
            </p>

            <h2 className="text-4xl font-bold text-purple-600 mt-3">
              {users}
            </h2>
          </div>

          {/* BOOKMARKS */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-500 font-semibold">
              Total Bookmarks
            </p>

            <h2 className="text-4xl font-bold text-green-600 mt-3">
              {bookmarks}
            </h2>
          </div>

          {/* REVIEWS */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-500 font-semibold">
              Total Reviews
            </p>

            <h2 className="text-4xl font-bold text-yellow-500 mt-3">
              {reviews}
            </h2>
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-5">
            Articles by Category
          </h2>

          {categories.length > 0 ? (
            <div className="space-y-4">
              {categories.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border-b pb-3"
                >
                  <span className="font-semibold text-gray-700">
                    {item.category}
                  </span>

                  <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full font-semibold">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              No category data available.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;