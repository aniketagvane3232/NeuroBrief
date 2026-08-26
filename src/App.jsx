import "./App.css";

import React, { useState } from "react";

import Header from "./components/Header";
import AllNews from "./components/AllNews";
import TopHeadlines from "./components/TopHeadlines";
import LoginPopus from "./components/LoginPopus";
import MyProfile from "./components/MyProfile";
import CountryNews from "./components/CountryNews";
import SearchResult from "./components/SearchResult";
import Recommended from "./components/Recommanded";
import SignUp from "./components/SignUp";
import Dashboard from "./components/Dashboard";
import AI from "./components/AI";
import Modal from "./components/Modal";

import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";


// =====================================================
// TOP HEADLINES PAGE
// =====================================================

function TopHeadlinesPage() {
  const [selectedArticle, setSelectedArticle] =
    useState(null);

  const [isModalOpen, setIsModalOpen] =
    useState(false);


  // ===================================================
  // ARTICLE CLICK
  // ===================================================

  const handleArticleClick = (article) => {
    console.log(
      "===================================="
    );

    console.log(
      "TOP HEADLINES ARTICLE CLICKED"
    );

    console.log(
      "FULL ARTICLE:",
      article
    );

    console.log(
      "DATABASE ARTICLE ID:",
      article?.id
    );

    console.log(
      "===================================="
    );


    if (!article) {
      console.error(
        "No article was received."
      );

      return;
    }


    setSelectedArticle(article);

    setIsModalOpen(true);
  };


  // ===================================================
  // CLOSE MODAL
  // ===================================================

  const handleCloseModal = () => {
    setIsModalOpen(false);

    setSelectedArticle(null);
  };


  return (
    <>
      {/* ================================================
          TOP HEADLINES
      ================================================ */}

      <TopHeadlines
        onArticleClick={
          handleArticleClick
        }
      />


      {/* ================================================
          ARTICLE MODAL
      ================================================ */}

      {isModalOpen &&
        selectedArticle && (
          <Modal
            show={isModalOpen}
            onClose={handleCloseModal}
            article={selectedArticle}
          >
            {/* ==========================================
                ARTICLE INFORMATION
            ========================================== */}

            <div className="w-full">

              <h2 className="text-3xl font-extrabold text-center mb-4">
                {selectedArticle.title}
              </h2>


              {/* IMAGE */}

              {(selectedArticle.urlToImage ||
                selectedArticle.url_to_image) && (
                <img
                  src={
                    selectedArticle.urlToImage ||
                    selectedArticle.url_to_image
                  }
                  alt={
                    selectedArticle.title ||
                    "News"
                  }
                  className="w-full h-auto mt-4 border rounded-2xl"
                />
              )}


              {/* DESCRIPTION */}

              {selectedArticle.description && (
                <p className="text-gray-600 italic text-xl mb-4 mt-5 text-center font-serif">
                  {
                    selectedArticle.description
                  }
                </p>
              )}


              {/* ARTICLE ID */}

              <div className="text-center mt-4">

                <p className="font-semibold text-lg">
                  Article ID:{" "}
                  {selectedArticle.id ||
                    "Not available"}
                </p>


                {/* PUBLISHED DATE */}

                {(selectedArticle.publishedAt ||
                  selectedArticle.published_at) && (
                  <p className="font-semibold text-lg">
                    Published on:{" "}
                    {new Date(
                      selectedArticle.publishedAt ||
                        selectedArticle.published_at
                    ).toLocaleDateString()}
                  </p>
                )}


                {/* AUTHOR */}

                <p className="font-semibold text-lg">
                  Author:{" "}
                  {selectedArticle.author ||
                    "Unknown"}
                </p>


                {/* SOURCE */}

                <p className="font-semibold text-lg">
                  Source:{" "}
                  {typeof selectedArticle.source ===
                  "object"
                    ? selectedArticle.source?.name ||
                      "Unknown"
                    : selectedArticle.source ||
                      "Unknown"}
                </p>


                {/* CATEGORY */}

                {selectedArticle.category && (
                  <p className="font-semibold text-lg">
                    Category:{" "}
                    {
                      selectedArticle.category
                    }
                  </p>
                )}


                {/* COUNTRY */}

                {selectedArticle.country && (
                  <p className="font-semibold text-lg">
                    Country:{" "}
                    {selectedArticle.country}
                  </p>
                )}


                {/* ORIGINAL ARTICLE */}

                {selectedArticle.url && (
                  <a
                    href={
                      selectedArticle.url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline mt-4 block"
                  >
                    Read Full Article
                  </a>
                )}

              </div>


              {/* ========================================
                  AI / FEEDBACK / BOOKMARK AREA
              ======================================== */}

              <div className="mt-8 border-t pt-6 text-center">

                <h3 className="text-xl font-bold mb-3">
                  ✨ Article Actions
                </h3>


                {selectedArticle.id ? (
                  <p className="text-green-600 font-semibold">
                    Article saved in database.
                    <br />
                    Database ID:{" "}
                    {selectedArticle.id}
                  </p>
                ) : (
                  <p className="text-red-500 font-semibold">
                    Article ID is missing.
                  </p>
                )}

              </div>

            </div>

          </Modal>
        )}
    </>
  );
}


// =====================================================
// MAIN APP
// =====================================================

function App() {
  return (
    <div className="w-full">

      <BrowserRouter>

        {/* ==============================================
            HEADER
        ============================================== */}

        <Header />


        {/* ==============================================
            ROUTES
        ============================================== */}

        <Routes>

          {/* ============================================
              ALL NEWS / HOME
          ============================================ */}

          <Route
            path="/"
            element={
              <AllNews />
            }
          />


          {/* ============================================
              TOP HEADLINES
          ============================================ */}

          <Route
            path="/top-headlines/:category"
            element={
              <TopHeadlinesPage />
            }
          />


          {/* ============================================
              COUNTRY NEWS
          ============================================ */}

          <Route
            path="/country/:iso"
            element={
              <CountryNews />
            }
          />


          {/* ============================================
              LOGIN
          ============================================ */}

          <Route
            path="/login"
            element={
              <LoginPopus />
            }
          />


          {/* ============================================
              SIGN UP
          ============================================ */}

          <Route
            path="/signup"
            element={
              <SignUp />
            }
          />


          {/* ============================================
              PROFILE
          ============================================ */}

          <Route
            path="/profile"
            element={
              <MyProfile />
            }
          />


          {/* ============================================
              DASHBOARD
          ============================================ */}

          <Route
            path="/dashboard"
            element={
              <Dashboard />
            }
          />


          {/* ============================================
              AI ASSISTANT
          ============================================ */}

          <Route
            path="/ai"
            element={
              <AI />
            }
          />


          {/* ============================================
              SEARCH
          ============================================ */}

          <Route
            path="/search/:searchQuery"
            element={
              <SearchResult />
            }
          />


          {/* ============================================
              RECOMMENDED
          ============================================ */}

          <Route
            path="/Recommended"
            element={
              <Recommended />
            }
          />


          {/* ============================================
              FALLBACK
          ============================================ */}

          <Route
            path="*"
            element={
              <AllNews />
            }
          />

        </Routes>

      </BrowserRouter>

    </div>
  );
}


export default App;
