import React, { useState, useEffect } from "react";
import EverythingCard from "./EverythingCard";
import Loader from "./Loader";
import Modal from "./Modal";

function AllNews() {
  // =====================================================
  // NEWS STATE
  // =====================================================

  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // =====================================================
  // ARTICLE / MODAL STATE
  // =====================================================

  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedArticles, setSelectedArticles] = useState(null);
  const [articleContent, setArticleContent] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // =====================================================
  // AI ANALYSIS STATE
  // =====================================================

  const [analysisData, setAnalysisData] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  const pageSize = 6;

  const fallbackImage =
    "https://via.placeholder.com/400x300?text=No+Image";


  // =====================================================
  // FETCH NEWS FROM YOUR .NET BACKEND
  //
  // .NET backend combines:
  // SQL DATABASE + EXTERNAL NEWS API
  // =====================================================

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/articles?page=${page}&pageSize=${pageSize}`
        );

        if (!response.ok) {
          throw new Error(
            `Backend news request failed: ${response.status}`
          );
        }

        const result = await response.json();

        console.log(
          "COMBINED NEWS FROM .NET:",
          result
        );

        const articles = Array.isArray(result.articles)
          ? result.articles
          : [];

        setData(articles);

        setTotalResults(
          result.count || articles.length
        );

        if (articles.length === 0) {
          setError("No articles available.");
        }
      } catch (err) {
        console.error(
          "News fetch error:",
          err
        );

        setError("Failed to fetch news.");

        setData([]);
        setTotalResults(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [page]);


  // =====================================================
  // ARTICLE CLICK
  // =====================================================

  const handleArticleClick = async (article) => {
    console.log(
      "Clicked article:",
      article
    );

    // -----------------------------------------------------
    // GET REAL DATABASE ID
    // -----------------------------------------------------

    const articleId =
      article?.id ??
      article?.Id;

    if (!articleId) {
      console.error(
        "Article has no database ID:",
        article
      );

      return;
    }

    // -----------------------------------------------------
    // NORMALIZE ARTICLE
    // -----------------------------------------------------

    const articleWithId = {
      ...article,
      id: articleId
    };

    console.log(
      "REAL DATABASE ARTICLE ID:",
      articleId
    );

    // -----------------------------------------------------
    // OPEN MODAL
    // -----------------------------------------------------

    setSelectedArticle(articleId);

    setSelectedArticles(
      articleWithId
    );

    setArticleContent(
      articleWithId
    );

    setIsModalOpen(true);

    // -----------------------------------------------------
    // RESET OLD ANALYSIS
    // -----------------------------------------------------

    setAnalysisData(null);
    setAnalysisError(null);

    // -----------------------------------------------------
    // FETCH NEW AI ANALYSIS
    // -----------------------------------------------------

    fetchArticleAnalysis(
      articleId
    );
  };


  // =====================================================
  // FETCH COMPLETE ARTICLE ANALYSIS
  //
  // NEW BACKEND:
  //
  // GET
  // /api/articles/{id}/analysis
  //
  // Backend:
  // Database cache
  //       ↓
  // Gemini if not cached
  //       ↓
  // ArticleAnalysis table
  // =====================================================

  const fetchArticleAnalysis = async (
    articleId
  ) => {
    setLoadingAnalysis(true);
    setAnalysisError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/articles/${articleId}/analysis`
      );

      const result =
        await response.json();

      console.log(
        "ARTICLE AI ANALYSIS:",
        result
      );

      if (!response.ok) {
        throw new Error(
          result?.message ||
          "Analysis request failed."
        );
      }

      if (
        !result ||
        !result.analysis
      ) {
        throw new Error(
          "No analysis data returned."
        );
      }

      setAnalysisData(
        result.analysis
      );

      console.log(
        result.cached
          ? "Analysis loaded from DATABASE CACHE."
          : "Analysis generated by GEMINI and saved to DATABASE."
      );

    } catch (error) {
      console.error(
        "Article analysis error:",
        error
      );

      setAnalysisError(
        error.message ||
        "Failed to analyze article."
      );

      setAnalysisData(null);
    } finally {
      setLoadingAnalysis(false);
    }
  };


  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const handleCloseModal = () => {
    setIsModalOpen(false);

    setSelectedArticle(null);

    setSelectedArticles(null);

    setArticleContent(null);

    setAnalysisData(null);

    setAnalysisError(null);
  };


  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalResults /
        pageSize
      )
    );


  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mx-auto my-5 max-w-xl rounded-lg bg-red-100 p-4 text-center text-red-600">
          {error}
        </div>
      )}


      {/* =================================================
          NEWS CARDS
      ================================================= */}

      <div className="my-10 grid grid-cols-1 gap-6 px-4 md:grid-cols-2 md:px-16 lg:grid-cols-2 lg:gap-10 xl:grid-cols-3">

        {isLoading ? (

          <div className="col-span-full flex justify-center py-10">
            <Loader />
          </div>

        ) : data.length > 0 ? (

          data.map(
            (article, index) => (

              <EverythingCard
                key={
                  article.id ||
                  article.Id ||
                  article.url ||
                  index
                }

                title={
                  article.title ||
                  article.Title ||
                  "Untitled Article"
                }

                description={
                  article.description ||
                  article.Description ||
                  "No description available."
                }

                imgUrl={
                  article.urlToImage ||
                  article.url_to_image ||
                  article.UrlToImage ||
                  fallbackImage
                }

                publishedAt={
                  article.publishedAt ||
                  article.published_at ||
                  article.PublishedAt ||
                  ""
                }

                url={
                  article.url ||
                  article.Url ||
                  "#"
                }

                source={
                  typeof article.source ===
                  "object"
                    ? article.source?.name ||
                      "Unknown Source"
                    : article.source ||
                      article.Source ||
                      "Unknown Source"
                }

                author={
                  article.author ||
                  article.Author ||
                  "Unknown Author"
                }

                onClick={() =>
                  handleArticleClick(
                    article
                  )
                }
              />

            )
          )

        ) : (

          <div className="col-span-full py-16 text-center text-gray-500">
            No articles available.
          </div>

        )}

      </div>


      {/* =================================================
          ARTICLE MODAL
      ================================================= */}

      {isModalOpen &&
        selectedArticles && (

          <Modal
            show={isModalOpen}
            onClose={
              handleCloseModal
            }
            article={
              selectedArticles
            }
          >

            <div className="p-4">

              {/* =================================================
                  TITLE
              ================================================= */}

              <h2 className="mb-4 text-center text-3xl font-bold">
                {
                  articleContent?.title
                }
              </h2>


              {/* =================================================
                  IMAGE
              ================================================= */}

              <img
                src={
                  articleContent?.urlToImage ||
                  articleContent?.url_to_image ||
                  articleContent?.UrlToImage ||
                  fallbackImage
                }

                alt={
                  articleContent?.title ||
                  "Article"
                }

                className="mx-auto mt-4 max-h-[500px] w-full rounded-2xl object-cover"
              />


              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              <p className="mt-5 text-xl italic text-gray-600">
                {
                  articleContent?.description
                }
              </p>


              {/* =================================================
                  ARTICLE INFORMATION
              ================================================= */}

              <div className="mt-5 space-y-2">

                <p>
                  <strong>
                    Published on:
                  </strong>{" "}

                  {articleContent?.publishedAt
                    ? new Date(
                        articleContent.publishedAt
                      ).toLocaleDateString()
                    : "Unknown"}
                </p>


                <p>
                  <strong>
                    Author:
                  </strong>{" "}

                  {articleContent?.author ||
                    "Unknown"}
                </p>


                <p>
                  <strong>
                    Source:
                  </strong>{" "}

                  {
                    typeof articleContent?.source ===
                    "object"
                      ? articleContent?.source?.name
                      : articleContent?.source ||
                        "Unknown"
                  }
                </p>


                <p>
                  <strong>
                    Article ID:
                  </strong>{" "}

                  {articleContent?.id}
                </p>

              </div>


              {/* =================================================
                  READ FULL ARTICLE
              ================================================= */}

              <a
                href={
                  articleContent?.url ||
                  "#"
                }

                target="_blank"

                rel="noopener noreferrer"

                className="mt-4 block text-blue-600 underline"
              >
                Read Full Article
              </a>


              {/* =================================================
                  AI ANALYSIS
              ================================================= */}

              <div className="mt-10 rounded-xl border p-5">

                <h3 className="text-2xl font-bold">
                  ✨ AI Article Analysis
                </h3>

                <p className="mt-2 text-gray-600">
                  AI-powered analysis including
                  summary, sentiment, keywords,
                  credibility, fake-news risk,
                  impact and news quadrant.
                </p>


                {/* =================================================
                    LOADING
                ================================================= */}

                {loadingAnalysis && (

                  <div className="mt-6 rounded-lg bg-gray-100 p-5 text-center">

                    <p className="font-semibold">
                      🤖 Analyzing article...
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      Gemini is analyzing this article.
                    </p>

                  </div>

                )}


                {/* =================================================
                    ERROR
                ================================================= */}

                {analysisError && !loadingAnalysis && (

                  <div className="mt-6 rounded-lg bg-red-50 p-5 text-red-600">

                    <p className="font-semibold">
                      Analysis failed
                    </p>

                    <p className="mt-2 text-sm">
                      {analysisError}
                    </p>

                    <button
                      onClick={() =>
                        fetchArticleAnalysis(
                          articleContent?.id
                        )
                      }

                      className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white"
                    >
                      Try Again
                    </button>

                  </div>

                )}


                {/* =================================================
                    ANALYSIS RESULTS
                ================================================= */}

                {analysisData &&
                  !loadingAnalysis && (

                    <div className="mt-6 space-y-8">


                      {/* =================================================
                          SUMMARY
                      ================================================= */}

                      <div>

                        <h3 className="text-xl font-bold">
                          📝 Summary of Article
                        </h3>

                        <p className="mt-2 text-gray-700">
                          {
                            analysisData.summary ||
                            "No summary available."
                          }
                        </p>

                      </div>


                      {/* =================================================
                          MAIN POINTS
                      ================================================= */}

                      <div>

                        <h3 className="text-xl font-bold">
                          🎯 Main Points
                        </h3>

                        {Array.isArray(
                          analysisData.mainPoints
                        ) &&
                        analysisData.mainPoints.length > 0 ? (

                          <ul className="mt-3 list-disc space-y-2 pl-6">

                            {analysisData.mainPoints.map(
                              (point, index) => (

                                <li key={index}>
                                  {point}
                                </li>

                              )
                            )}

                          </ul>

                        ) : (

                          <p className="mt-2 text-gray-500">
                            No main points available.
                          </p>

                        )}

                      </div>


                      {/* =================================================
                          SENTIMENT
                      ================================================= */}

                      <div>

                        <h3 className="text-xl font-bold">
                          📊 Sentiment Analysis
                        </h3>

                        <div className="mt-3 space-y-2">

                          <p>
                            <strong>
                              Positive:
                            </strong>{" "}
                            {
                              analysisData.positiveSentiment ??
                              0
                            }%
                          </p>

                          <p>
                            <strong>
                              Negative:
                            </strong>{" "}
                            {
                              analysisData.negativeSentiment ??
                              0
                            }%
                          </p>

                          <p>
                            <strong>
                              Neutral:
                            </strong>{" "}
                            {
                              analysisData.neutralSentiment ??
                              0
                            }%
                          </p>

                        </div>

                      </div>


                      {/* =================================================
                          KEYWORDS / WORD CLOUD
                      ================================================= */}

                      <div>

                        <h3 className="text-xl font-bold">
                          ☁️ Important Keywords
                        </h3>

                        {Array.isArray(
                          analysisData.keywords
                        ) &&
                        analysisData.keywords.length > 0 ? (

                          <div className="mt-3 flex flex-wrap gap-2">

                            {analysisData.keywords.map(
                              (keyword, index) => (

                                <span
                                  key={index}
                                  className="rounded-full bg-gray-100 px-3 py-1 text-sm"
                                >
                                  {keyword}
                                </span>

                              )
                            )}

                          </div>

                        ) : (

                          <p className="mt-2 text-gray-500">
                            No keyword data available.
                          </p>

                        )}

                      </div>


                      {/* =================================================
                          CREDIBILITY
                      ================================================= */}

                      <div>

                        <h3 className="text-xl font-bold">
                          🛡️ Credibility
                        </h3>

                        <p className="mt-2">
                          <strong>
                            Score:
                          </strong>{" "}

                          {
                            analysisData.credibilityScore ??
                            0
                          }/100
                        </p>

                        <p className="mt-2">
                          <strong>
                            Assessment:
                          </strong>{" "}

                          {
                            analysisData.credibilityAssessment ||
                            "No assessment available."
                          }
                        </p>

                      </div>


                      {/* =================================================
                          FAKE NEWS
                      ================================================= */}

                      <div>

                        <h3 className="text-xl font-bold">
                          📰 Fake News Risk
                        </h3>

                        <p className="mt-2">
                          <strong>
                            Risk:
                          </strong>{" "}

                          {
                            analysisData.fakeNewsRisk ||
                            "Unknown"
                          }
                        </p>

                      </div>


                      {/* =================================================
                          SIMPLE EXPLANATION
                      ================================================= */}

                      <div>

                        <h3 className="text-xl font-bold">
                          💡 Simple Explanation
                        </h3>

                        <p className="mt-2 text-gray-700">
                          {
                            analysisData.simpleExplanation ||
                            "No explanation available."
                          }
                        </p>

                      </div>


                      {/* =================================================
                          CATEGORY
                      ================================================= */}

                      <div>

                        <h3 className="text-xl font-bold">
                          🏷️ Category
                        </h3>

                        <p className="mt-2">
                          {
                            analysisData.category ||
                            articleContent?.category ||
                            "Unknown"
                          }
                        </p>

                      </div>


                      {/* =================================================
                          IMPACT
                      ================================================= */}

                      <div>

                        <h3 className="text-xl font-bold">
                          📈 Impact Level
                        </h3>

                        <p className="mt-2">
                          {
                            analysisData.impactLevel ||
                            "Unknown"
                          }
                        </p>

                      </div>


                      {/* =================================================
                          NEWS QUADRANT
                      ================================================= */}

                      <div>

                        <h3 className="text-xl font-bold">
                          🧭 News Intelligence Quadrant
                        </h3>

                        <div className="mt-3 rounded-lg bg-gray-100 p-4">

                          <p className="text-2xl font-bold">
                            {
                              analysisData.quadrant ||
                              "Unknown"
                            }
                          </p>

                          <p className="mt-2 text-sm text-gray-600">
                            AI classification of this
                            article based on its
                            characteristics and impact.
                          </p>

                        </div>

                      </div>


                    </div>

                  )}

              </div>

            </div>

          </Modal>

        )}


      {/* =================================================
          PAGINATION
      ================================================= */}

      {!isLoading &&
        data.length > 0 && (

          <div className="my-10 flex items-center justify-center gap-10">

            <button
              onClick={() =>
                setPage(
                  p =>
                    Math.max(
                      1,
                      p - 1
                    )
                )
              }

              disabled={
                page === 1
              }

              className="rounded bg-gray-200 px-5 py-2 disabled:opacity-50"
            >
              Prev
            </button>


            <span>
              {page} of{" "}
              {totalPages}
            </span>


            <button
              onClick={() =>
                setPage(
                  p =>
                    Math.min(
                      totalPages,
                      p + 1
                    )
                )
              }

              disabled={
                page >= totalPages
              }

              className="rounded bg-gray-200 px-5 py-2 disabled:opacity-50"
            >
              Next
            </button>

          </div>

        )}

    </>
  );
}

export default AllNews;
