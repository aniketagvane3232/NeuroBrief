import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import EverythingCard from "./EverythingCard";
import Loader from "./Loader";

function TopHeadlines({ onArticleClick }) {
  const params = useParams();

  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const pageSize = 6;

  // =====================================================
  // FETCH EXTERNAL NEWS + SAVE TO DATABASE
  // =====================================================

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const categoryParam = params.category
          ? `&category=${params.category}`
          : "";

        const response = await fetch(
          `https://news-aggregator-dusky.vercel.app/top-headlines?language=en${categoryParam}&page=${page}&pageSize=${pageSize}`
        );

        if (!response.ok) {
          throw new Error(
            `News API returned ${response.status}`
          );
        }

        const json = await response.json();

        console.log(
          "EXTERNAL NEWS RESPONSE:",
          json
        );

        if (!json.success) {
          throw new Error(
            json.message ||
              "Failed to fetch news."
          );
        }

        const externalArticles =
          json.data?.articles || [];

        setTotalResults(
          json.data?.totalResults ||
            externalArticles.length
        );

        if (externalArticles.length === 0) {
          setData([]);
          return;
        }

        const token =
          localStorage.getItem("token");

        const finalArticles = [];

        // =================================================
        // SAVE EACH ARTICLE
        // =================================================

        for (const article of externalArticles) {
          try {
            // If user is not logged in,
            // display external article normally.
            if (!token) {
              finalArticles.push(article);
              continue;
            }

            const source =
              typeof article.source === "object"
                ? article.source?.name || ""
                : article.source || "";

            const saveResponse =
              await fetch(
                '${import.meta.env.VITE_API_URL}/api/articles/sync',
                {
                  method: "POST",

                  headers: {
                    Accept: "*/*",
                    "Content-Type":
                      "application/json",
                    Authorization:
                      `Bearer ${token}`,
                  },

                  body: JSON.stringify({
                    title:
                      article.title || "",

                    description:
                      article.description || "",

                    content:
                      article.content ||
                      article.description ||
                      "",

                    url:
                      article.url || "",

                    urlToImage:
                      article.urlToImage ||
                      article.url_to_image ||
                      "",

                    source:
                      source,

                    author:
                      article.author || "",

                    publishedAt:
                      article.publishedAt ||
                      article.published_at ||
                      null,

                    category:
                      params.category || "",

                    country:
                      article.country || "",
                  }),
                }
              );

            const result =
              await saveResponse.json();

            console.log(
              "DATABASE SYNC RESULT:",
              result
            );

            // =================================================
            // USE DATABASE ARTICLE
            // =================================================

            if (
              saveResponse.ok &&
              result.success &&
              result.article
            ) {
              finalArticles.push(
                result.article
              );
            } else {
              // Still display the external article
              // if database saving failed.
              finalArticles.push(article);
            }
          } catch (syncError) {
            console.error(
              "ARTICLE SYNC ERROR:",
              syncError
            );

            // Don't remove news from the page
            // because database saving failed.
            finalArticles.push(article);
          }
        }

        setData(finalArticles);

      } catch (error) {
        console.error(
          "TOP HEADLINES ERROR:",
          error
        );

        setData([]);
        setTotalResults(0);

        setError(
          error.message ||
            "Failed to fetch news. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [page, params.category]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalResults / pageSize
    )
  );

  const handlePrev = () => {
    if (page > 1) {
      setPage((previous) => previous - 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage((previous) => previous + 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // =====================================================
  // ARTICLE CLICK
  // =====================================================

  const handleArticleClick = (article) => {
    console.log(
      "ARTICLE CLICKED:",
      article
    );

    console.log(
      "DATABASE ARTICLE ID:",
      article.id
    );

    // If article has database ID,
    // send it to the parent/modal.
    if (article.id && onArticleClick) {
      onArticleClick(article);
      return;
    }

    // If not logged in / not saved,
    // the external article may not have an ID.
    console.warn(
      "This article does not have a database ID.",
      article
    );

    if (onArticleClick) {
      onArticleClick(article);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      {error && (
        <div className="text-red-500 mb-4 text-center">
          {error}
        </div>
      )}

      <div
        className="
          my-10
          cards
          grid
          lg:place-content-center
          md:grid-cols-1
          lg:grid-cols-2
          xl:grid-cols-3
          xs:grid-cols-1
          xs:gap-4
          md:gap-10
          lg:gap-14
          md:px-16
          xs:p-3
        "
      >
        {isLoading ? (
          <Loader />
        ) : data.length > 0 ? (
          data.map((article, index) => (
            <EverythingCard
              key={
                article.id ||
                article.url ||
                index
              }

              title={
                article.title ||
                "No title"
              }

              description={
                article.description ||
                ""
              }

              imgUrl={
                article.urlToImage ||
                article.url_to_image ||
                "https://via.placeholder.com/400x300?text=No+Image"
              }

              publishedAt={
                article.publishedAt ||
                article.published_at ||
                ""
              }

              url={
                article.url ||
                ""
              }

              author={
                article.author ||
                "Unknown"
              }

              source={
                typeof article.source ===
                "object"
                  ? article.source?.name ||
                    "Unknown"
                  : article.source ||
                    "Unknown"
              }

              // IMPORTANT
              // Clicking the card sends the complete
              // database article to the parent.
              onClick={() =>
                handleArticleClick(article)
              }
            />
          ))
        ) : (
          <div className="text-center col-span-full">
            <p className="text-gray-600 text-lg">
              No articles found for this
              category.
            </p>

            <p className="text-gray-400 mt-2">
              Category:{" "}
              {params.category ||
                "all"}
            </p>
          </div>
        )}
      </div>

      {/* =================================================
          PAGINATION
      ================================================= */}

      {!isLoading &&
        data.length > 0 && (
          <div
            className="
              pagination
              flex
              justify-center
              gap-14
              my-10
              items-center
            "
          >
            <button
              disabled={page <= 1}
              onClick={handlePrev}
              className="
                pagination-btn
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              Prev
            </button>

            <p className="font-semibold opacity-80">
              {page} of {totalPages}
            </p>

            <button
              disabled={
                page >= totalPages
              }
              onClick={handleNext}
              className="
                pagination-btn
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              Next
            </button>
          </div>
        )}
    </>
  );
}

export default TopHeadlines;
