import React, { useState, useEffect } from "react";
import EverythingCard from "./EverythingCard";
import Loader from "./Loader";
import Modal from "./Modal";

function Recommended() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedArticle, setSelectedArticle] =
    useState(null);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const fallbackImage =
    "https://via.placeholder.com/400x300?text=No+Image+Available";

  // =====================================================
  // FETCH RECOMMENDED ARTICLES
  // =====================================================

  const fetchRecommendedArticles = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token =
        localStorage.getItem("token");

      const response = await fetch(
        '${import.meta.env.VITE_API_URL}/api/recommendation',
        {
          method: "GET",

          headers: {
            Accept: "application/json",

            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch recommended articles. Status: ${response.status}`
        );
      }

      const result =
        await response.json();

      console.log(
        "Recommendation API response:",
        result
      );

      let articles = [];

      // =================================================
      // HANDLE BACKEND RESPONSE
      // =================================================

      if (Array.isArray(result)) {
        articles = result;
      } else if (
        Array.isArray(result.articles)
      ) {
        articles = result.articles;
      } else if (
        Array.isArray(result.results)
      ) {
        articles = result.results;
      } else if (
        Array.isArray(result.data)
      ) {
        articles = result.data;
      }

      console.log(
        "Recommended articles:",
        articles
      );

      setData(articles);
    } catch (err) {
      console.error(
        "Recommendation fetch error:",
        err
      );

      setError(
        "Failed to fetch recommended articles. Please try again later."
      );

      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================
  // LOAD ARTICLES
  // =====================================================

  useEffect(() => {
    fetchRecommendedArticles();
  }, []);

  // =====================================================
  // NORMALIZE ARTICLE
  // =====================================================

  const normalizeArticle = (article) => {
    if (!article) {
      return null;
    }

    const source =
      typeof article.source === "object"
        ? article.source?.name || ""
        : article.source ||
          article.Source ||
          "";

    return {
      ...article,

      // Database ID
      id:
        article.id ||
        article.Id ||
        null,

      title:
        article.title ||
        article.Title ||
        "Untitled Article",

      description:
        article.description ||
        article.Description ||
        "No description available.",

      content:
        article.content ||
        article.Content ||
        article.description ||
        article.Description ||
        "",

      url:
        article.url ||
        article.Url ||
        "",

      urlToImage:
        article.urlToImage ||
        article.url_to_image ||
        article.UrlToImage ||
        "",

      publishedAt:
        article.publishedAt ||
        article.published_at ||
        article.PublishedAt ||
        null,

      author:
        article.author ||
        article.Author ||
        "Unknown Author",

      source: source,

      category:
        article.category ||
        article.Category ||
        "",

      country:
        article.country ||
        article.Country ||
        "",
    };
  };

  // =====================================================
  // ARTICLE CLICK
  // =====================================================

  const handleArticleClick = (article) => {
    console.log(
      "===================================="
    );

    console.log(
      "RECOMMENDED ARTICLE CLICKED"
    );

    console.log("Original:", article);

    const normalizedArticle =
      normalizeArticle(article);

    console.log(
      "Normalized:",
      normalizedArticle
    );

    console.log(
      "DATABASE ARTICLE ID:",
      normalizedArticle?.id
    );

    console.log(
      "===================================="
    );

    if (!normalizedArticle) {
      console.error(
        "Article is missing."
      );

      return;
    }

    setSelectedArticle(
      normalizedArticle
    );

    setIsModalOpen(true);
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const handleCloseModal = () => {
    setIsModalOpen(false);

    setSelectedArticle(null);
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="mb-8 mt-8 px-4 text-center">

        <h1 className="text-3xl font-bold">
          Recommended Articles
        </h1>

        <p className="mt-2 text-gray-500">
          Latest articles recommended for you
        </p>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mx-auto mb-6 max-w-2xl rounded-lg border border-red-300 bg-red-50 p-4 text-center text-red-600">
          {error}
        </div>
      )}


      {/* =================================================
          ARTICLE CARDS
      ================================================= */}

      <div className="my-10 grid grid-cols-1 gap-6 px-4 md:grid-cols-2 md:px-16 lg:grid-cols-2 lg:gap-10 xl:grid-cols-3">

        {isLoading ? (

          <div className="col-span-full flex justify-center py-10">
            <Loader />
          </div>

        ) : data.length > 0 ? (

          data.map((element, index) => {

            const article =
              normalizeArticle(element);

            return (
              <EverythingCard
                key={
                  article?.id ||
                  article?.url ||
                  index
                }

                title={
                  article?.title ||
                  "Untitled Article"
                }

                description={
                  article?.description ||
                  "No description available."
                }

                imgUrl={
                  article?.urlToImage ||
                  fallbackImage
                }

                publishedAt={
                  article?.publishedAt ||
                  ""
                }

                url={
                  article?.url ||
                  "#"
                }

                author={
                  article?.author ||
                  "Unknown Author"
                }

                source={
                  article?.source ||
                  "Unknown Source"
                }

                // ========================================
                // MAKE CARD CLICKABLE
                // ========================================

                onClick={() =>
                  handleArticleClick(
                    element
                  )
                }
              />
            );
          })

        ) : (

          <div className="col-span-full py-16 text-center text-gray-500">
            No recommended articles available.
          </div>

        )}

      </div>


      {/* =================================================
          ARTICLE MODAL
      ================================================= */}

      {isModalOpen &&
        selectedArticle && (

          <Modal
            show={isModalOpen}
            onClose={handleCloseModal}
            article={selectedArticle}
          >

            {/* ===========================================
                ARTICLE CONTENT
            =========================================== */}

            <div className="w-full">

              {/* TITLE */}

              <h2 className="text-3xl font-extrabold text-center mb-5">
                {selectedArticle.title}
              </h2>


              {/* IMAGE */}

              {selectedArticle.urlToImage && (
                <div className="w-full flex justify-center mb-6">

                  <img
                    src={
                      selectedArticle.urlToImage
                    }
                    alt={
                      selectedArticle.title
                    }
                    className="w-full max-h-[450px] object-cover rounded-2xl border"
                  />

                </div>
              )}


              {/* DESCRIPTION */}

              {selectedArticle.description && (
                <p className="text-gray-600 italic text-xl mb-6 mt-4 text-center font-serif leading-8">
                  {selectedArticle.description}
                </p>
              )}


              {/* ARTICLE INFORMATION */}

              <div className="text-center mt-5 space-y-2">

                {/* ARTICLE ID */}

                <p className="font-semibold text-lg">
                  Article ID:{" "}
                  <span className="font-normal">
                    {selectedArticle.id ||
                      "Missing"}
                  </span>
                </p>


                {/* AUTHOR */}

                <p className="font-semibold text-lg">
                  Author:{" "}
                  <span className="font-normal">
                    {selectedArticle.author ||
                      "Unknown"}
                  </span>
                </p>


                {/* SOURCE */}

                <p className="font-semibold text-lg">
                  Source:{" "}
                  <span className="font-normal">
                    {selectedArticle.source ||
                      "Unknown"}
                  </span>
                </p>


                {/* PUBLISHED DATE */}

                {selectedArticle.publishedAt && (
                  <p className="font-semibold text-lg">
                    Published:{" "}
                    <span className="font-normal">
                      {new Date(
                        selectedArticle.publishedAt
                      ).toLocaleString()}
                    </span>
                  </p>
                )}


                {/* CATEGORY */}

                {selectedArticle.category && (
                  <p className="font-semibold text-lg">
                    Category:{" "}
                    <span className="font-normal capitalize">
                      {
                        selectedArticle.category
                      }
                    </span>
                  </p>
                )}


                {/* COUNTRY */}

                {selectedArticle.country && (
                  <p className="font-semibold text-lg">
                    Country:{" "}
                    <span className="font-normal">
                      {
                        selectedArticle.country
                      }
                    </span>
                  </p>
                )}


                {/* READ ORIGINAL */}

                {selectedArticle.url && (
                  <a
                    href={
                      selectedArticle.url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 text-blue-600 font-semibold hover:underline"
                  >
                    Read Full Article
                  </a>
                )}

              </div>

            </div>

          </Modal>

        )}
    </>
  );
}

export default Recommended;
