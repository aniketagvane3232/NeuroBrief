import React, { useEffect, useState } from "react";
import "./MyProfile.css";
import EverythingBookCard from "./EverythingBookCard";

function MyProfile() {
  const [profileData, setProfileData] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [error, setError] = useState("");
  const [bookmarkError, setBookmarkError] = useState("");
  const [reviewError, setReviewError] = useState("");

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [activeSection, setActiveSection] = useState("profile");

  const API_URL = "http://localhost:5251/api";

  // =========================================================
  // GET PROFILE
  // =========================================================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please sign in first.");
      setLoadingProfile(false);
      return;
    }

    fetch(`${API_URL}/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Failed to fetch profile.");
        }

        return response.json();
      })
      .then((data) => {
        console.log("PROFILE RESPONSE:", data);

        setProfileData(data.user || data);
      })
      .catch((err) => {
        console.error("Profile error:", err);
        setError("Failed to load profile data.");
      })
      .finally(() => {
        setLoadingProfile(false);
      });
  }, []);

  // =========================================================
  // GET BOOKMARKS
  // =========================================================

  const getBookmarks = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setBookmarkError("Please sign in first.");
      return;
    }

    setLoadingBookmarks(true);
    setBookmarkError("");

    try {
      const response = await fetch(`${API_URL}/bookmarks`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const text = await response.text();

      if (!response.ok) {
        console.error("BOOKMARK ERROR:", response.status, text);
        throw new Error("Failed to fetch bookmarks.");
      }

      const data = text ? JSON.parse(text) : {};

      console.log("BOOKMARK API RESPONSE:", data);

      let bookmarkList = [];

      if (Array.isArray(data)) {
        bookmarkList = data;
      } else if (Array.isArray(data.bookmarks)) {
        bookmarkList = data.bookmarks;
      } else if (Array.isArray(data.results)) {
        bookmarkList = data.results;
      } else if (Array.isArray(data.articles)) {
        bookmarkList = data.articles;
      }

      console.log("BOOKMARK LIST:", bookmarkList);

      setBookmarks(bookmarkList);

      return bookmarkList;
    } catch (err) {
      console.error("Bookmark fetch error:", err);

      setBookmarks([]);

      setBookmarkError(
        "Could not load bookmarks. Please try again."
      );

      return [];
    } finally {
      setLoadingBookmarks(false);
    }
  };

  // =========================================================
  // GET REVIEWS
  //
  // Backend has:
  // GET /api/reviews/{articleId}
  //
  // There is NO:
  // GET /api/reviews
  //
  // So we first get bookmarks and then request reviews
  // for each bookmarked article.
  // =========================================================

  const getReviews = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setReviewError("Please sign in first.");
      return;
    }

    setLoadingReviews(true);
    setReviewError("");

    try {
      // Get bookmarks first
      const bookmarkResponse = await fetch(`${API_URL}/bookmarks`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const bookmarkText = await bookmarkResponse.text();

      if (!bookmarkResponse.ok) {
        throw new Error("Failed to fetch bookmarks.");
      }

      const bookmarkData = bookmarkText
        ? JSON.parse(bookmarkText)
        : {};

      let bookmarkList = [];

      if (Array.isArray(bookmarkData)) {
        bookmarkList = bookmarkData;
      } else if (Array.isArray(bookmarkData.bookmarks)) {
        bookmarkList = bookmarkData.bookmarks;
      } else if (Array.isArray(bookmarkData.results)) {
        bookmarkList = bookmarkData.results;
      } else if (Array.isArray(bookmarkData.articles)) {
        bookmarkList = bookmarkData.articles;
      }

      console.log(
        "BOOKMARKS USED FOR REVIEWS:",
        bookmarkList
      );

      // Get article IDs from bookmarks
      const articleIds = bookmarkList
        .map((bookmark) => {
          if (bookmark?.article?.id) {
            return bookmark.article.id;
          }

          if (bookmark?.articleDetails?.id) {
            return bookmark.articleDetails.id;
          }

          if (bookmark?.articleId) {
            return bookmark.articleId;
          }

          if (bookmark?.id) {
            return bookmark.id;
          }

          return null;
        })
        .filter(
          (id, index, array) =>
            id !== null &&
            array.indexOf(id) === index
        );

      console.log(
        "ARTICLE IDS FOR REVIEWS:",
        articleIds
      );

      if (articleIds.length === 0) {
        setReviews([]);
        setReviewError(
          "No bookmarked articles found to check reviews."
        );
        return;
      }

      // Request reviews for every article
      const reviewResponses = await Promise.all(
        articleIds.map(async (articleId) => {
          try {
            const response = await fetch(
              `${API_URL}/reviews/${articleId}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (!response.ok) {
              console.warn(
                `Could not fetch reviews for article ${articleId}`
              );

              return [];
            }

            const data = await response.json();

            console.log(
              `REVIEWS FOR ARTICLE ${articleId}:`,
              data
            );

            if (Array.isArray(data)) {
              return data;
            }

            if (Array.isArray(data.reviews)) {
              return data.reviews;
            }

            if (Array.isArray(data.results)) {
              return data.results;
            }

            return [];
          } catch (err) {
            console.error(
              `Review fetch error for article ${articleId}:`,
              err
            );

            return [];
          }
        })
      );

      // Flatten all review arrays
      const allReviews = reviewResponses.flat();

      console.log(
        "ALL REVIEWS:",
        allReviews
      );

      // Get current username
      const currentUsername =
        profileData?.username ||
        localStorage.getItem("username") ||
        "";

      // Only show reviews belonging to current user
      const userReviews = allReviews.filter((review) => {
        if (!currentUsername) {
          return true;
        }

        return (
          review.username === currentUsername
        );
      });

      console.log(
        "CURRENT USER REVIEWS:",
        userReviews
      );

      setReviews(userReviews);
    } catch (err) {
      console.error("Reviews error:", err);

      setReviews([]);

      setReviewError(
        "Could not load reviews. Please try again."
      );
    } finally {
      setLoadingReviews(false);
    }
  };

  // =========================================================
  // GET ARTICLE FROM BOOKMARK
  // =========================================================

  const getArticleFromBookmark = (bookmark) => {
    if (
      bookmark?.article &&
      typeof bookmark.article === "object"
    ) {
      return bookmark.article;
    }

    if (
      bookmark?.articleDetails &&
      typeof bookmark.articleDetails === "object"
    ) {
      return bookmark.articleDetails;
    }

    return bookmark;
  };

  // =========================================================
  // OPEN ARTICLE
  // =========================================================

  const openArticle = (article) => {
    const url = article?.url;

    if (url) {
      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="flex min-h-screen w-screen bg-gradient-to-r from-purple-300 via-pink-300 to-red-300 mt-[100px]">

      {/* SIDEBAR */}

      <div className="sidebar w-1/5 min-w-[220px] bg-white p-6 shadow-lg rounded-lg">

        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
          Menu
        </h2>

        {/* PROFILE */}

        <button
          className={`block w-full text-left p-3 mb-2 text-gray-700 rounded-lg transition hover:bg-gray-200 ${
            activeSection === "profile"
              ? "bg-gray-300 border border-gray-400"
              : ""
          }`}
          onClick={() => {
            setActiveSection("profile");
          }}
        >
          My Profile
        </button>

        {/* BOOKMARKS */}

        <button
          className={`block w-full text-left p-3 mb-2 text-gray-700 rounded-lg transition hover:bg-gray-200 ${
            activeSection === "bookmarks"
              ? "bg-gray-300 border border-gray-500"
              : ""
          }`}
          onClick={() => {
            setActiveSection("bookmarks");
            getBookmarks();
          }}
        >
          My Bookmarks
        </button>

        {/* REVIEWS */}

        <button
          className={`block w-full text-left p-3 mb-2 text-gray-700 rounded-lg transition hover:bg-gray-200 ${
            activeSection === "reviews"
              ? "bg-gray-300 border border-gray-400"
              : ""
          }`}
          onClick={() => {
            setActiveSection("reviews");
            getReviews();
          }}
        >
          My Reviews
        </button>

      </div>

      {/* CONTENT */}

      <div className="content flex-1 p-6">

        {/* GENERAL ERROR */}

        {error && (
          <div className="bg-white text-red-600 font-semibold p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* ================================================= */}
        {/* PROFILE */}
        {/* ================================================= */}

        {activeSection === "profile" && (
          <>
            {loadingProfile ? (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                Loading profile...
              </div>
            ) : profileData ? (
              <div className="profile-card bg-white shadow-lg rounded-lg p-6">

                <div className="profile-header flex items-center mb-6">

                  <div className="profile-info flex-1">

                    <h2 className="text-3xl font-bold text-gray-800">
                      {profileData.first_name ||
                        profileData.firstName ||
                        ""}
                      {" "}
                      {profileData.last_name ||
                        profileData.lastName ||
                        ""}
                    </h2>

                    <p className="text-gray-600">
                      {profileData.email ||
                        "No email"}
                    </p>

                    <span className="text-sm text-gray-500">
                      User ID:{" "}
                      {profileData.id || "N/A"}
                    </span>

                  </div>

                </div>

                <div className="profile-details">

                  <div className="form-group mb-4">
                    <label className="font-semibold">
                      Username
                    </label>

                    <input
                      type="text"
                      value={
                        profileData.username || ""
                      }
                      readOnly
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-gray-100"
                    />
                  </div>

                  <div className="form-group mb-4">
                    <label className="font-semibold">
                      Email
                    </label>

                    <input
                      type="email"
                      value={
                        profileData.email || ""
                      }
                      readOnly
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-gray-100"
                    />
                  </div>

                  <div className="form-group mb-4">
                    <label className="font-semibold">
                      First Name
                    </label>

                    <input
                      type="text"
                      value={
                        profileData.first_name ||
                        profileData.firstName ||
                        ""
                      }
                      readOnly
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-gray-100"
                    />
                  </div>

                  <div className="form-group mb-4">
                    <label className="font-semibold">
                      Last Name
                    </label>

                    <input
                      type="text"
                      value={
                        profileData.last_name ||
                        profileData.lastName ||
                        ""
                      }
                      readOnly
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-gray-100"
                    />
                  </div>

                </div>

              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                No profile data found.
              </div>
            )}
          </>
        )}

        {/* ================================================= */}
        {/* BOOKMARKS */}
        {/* ================================================= */}

        {activeSection === "bookmarks" && (
          <div className="bg-white shadow-lg rounded-lg p-6">

            <div className="flex justify-between items-center mb-4">

              <h2 className="text-2xl font-bold text-gray-800">
                My Bookmarks
              </h2>

              <button
                onClick={getBookmarks}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Refresh
              </button>

            </div>

            {bookmarkError && (
              <div className="text-red-600 font-semibold mb-4">
                {bookmarkError}
              </div>
            )}

            {loadingBookmarks ? (
              <div className="text-gray-600 py-10 text-center">
                Loading bookmarks...
              </div>
            ) : bookmarks.length > 0 ? (
              <div className="my-6 grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-8">

                {bookmarks.map(
                  (bookmark, index) => {

                    const article =
                      getArticleFromBookmark(
                        bookmark
                      );

                    if (!article) {
                      return null;
                    }

                    const title =
                      article.title ||
                      "Untitled Article";

                    const description =
                      article.description ||
                      "No description available.";

                    const image =
                      article.urlToImage ||
                      article.url_to_image ||
                      "https://via.placeholder.com/400x300?text=No+Image";

                    const publishedAt =
                      article.publishedAt ||
                      article.published_at ||
                      "Unknown date";

                    const author =
                      article.author ||
                      "Unknown author";

                    const source =
                      article.source?.name ||
                      article.source ||
                      "Unknown source";

                    const url =
                      article.url || "";

                    return (
                      <EverythingBookCard
                        key={
                          bookmark.id ||
                          article.id ||
                          index
                        }
                        title={title}
                        description={description}
                        imgUrl={image}
                        publishedAt={publishedAt}
                        url={url}
                        author={author}
                        source={source}
                        onClick={() =>
                          openArticle(article)
                        }
                      />
                    );
                  }
                )}

              </div>
            ) : (
              <div className="text-gray-500 text-center py-10">

                <p className="text-xl mb-2">
                  No bookmarks found.
                </p>

                <p className="text-sm">
                  Bookmark an article and it will
                  appear here.
                </p>

              </div>
            )}

          </div>
        )}

        {/* ================================================= */}
        {/* REVIEWS */}
        {/* ================================================= */}

        {activeSection === "reviews" && (
          <div className="bg-white shadow-lg rounded-lg p-6">

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-2xl font-bold text-gray-800">
                My Reviews
              </h2>

              <button
                onClick={getReviews}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Refresh
              </button>

            </div>

            {reviewError && (
              <div className="text-red-600 font-semibold mb-4">
                {reviewError}
              </div>
            )}

            {loadingReviews ? (
              <div className="text-gray-600 text-center py-10">
                Loading reviews...
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">

                {reviews.map(
                  (review, index) => (
                    <div
                      key={
                        review.id || index
                      }
                      className="border border-gray-200 rounded-lg p-5 bg-gray-50"
                    >

                      <div className="mb-2">
                        <span className="font-semibold">
                          Review ID:
                        </span>{" "}
                        {review.id || "N/A"}
                      </div>

                      <div className="mb-2">
                        <span className="font-semibold">
                          Article ID:
                        </span>{" "}
                        {review.articleId ||
                          "N/A"}
                      </div>

                      <div className="mb-2">
                        <span className="font-semibold">
                          Rating:
                        </span>{" "}
                        {"★".repeat(
                          Number(
                            review.rating || 0
                          )
                        )}
                        {"☆".repeat(
                          5 -
                            Number(
                              review.rating || 0
                            )
                        )}
                        {" "}
                        ({review.rating || 0}/5)
                      </div>

                      <div className="mb-2">
                        <span className="font-semibold">
                          Comment:
                        </span>{" "}
                        {review.feedback ||
                          review.comment ||
                          "No comment"}
                      </div>

                      <div className="mb-2">
                        <span className="font-semibold">
                          User:
                        </span>{" "}
                        {review.username ||
                          "Unknown"}
                      </div>

                      <div className="text-sm text-gray-500">
                        {review.createdAt
                          ? new Date(
                              review.createdAt
                            ).toLocaleString()
                          : ""}
                      </div>

                    </div>
                  )
                )}

              </div>
            ) : (
              <div className="text-gray-500 text-center py-10">

                <p className="text-xl mb-2">
                  No reviews found.
                </p>

                <p className="text-sm">
                  Submit a review on an article
                  and it will appear here.
                </p>

              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}

export default MyProfile;