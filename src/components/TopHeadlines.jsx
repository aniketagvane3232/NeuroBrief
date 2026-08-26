import React, {
  useState,
  useEffect
} from "react";

import {
  useParams
} from "react-router-dom";

import EverythingCard from "./EverythingCard";
import Loader from "./Loader";


function TopHeadlines({
  onArticleClick
}) {

  const params =
    useParams();

  const [data, setData] =
    useState([]);

  const [page, setPage] =
    useState(1);

  const [totalResults, setTotalResults] =
    useState(0);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const pageSize = 6;

  const fallbackImage =
    "https://via.placeholder.com/400x300?text=No+Image+Available";


  // =====================================================
  // FETCH FROM .NET
  //
  // .NET combines:
  // SQL + VERCEL
  // =====================================================

  useEffect(() => {

    const fetchNews =
      async () => {

        setIsLoading(true);
        setError(null);

        try {

          const category =
            params.category || "general";

          const response =
            await fetch(
              `${import.meta.env.VITE_API_URL}/api/articles/top-headlines/${encodeURIComponent(
                category
              )}?page=${page}&pageSize=${pageSize}`
            );

          if (!response.ok) {

            throw new Error(
              `Backend returned ${response.status}`
            );

          }

          const result =
            await response.json();

          console.log(
            "TOP HEADLINES FROM .NET:",
            result
          );

          const articles =
            Array.isArray(
              result.articles
            )
              ? result.articles
              : [];

          setData(
            articles
          );

          setTotalResults(
            result.count ||
            articles.length
          );

          if (
            articles.length === 0
          ) {

            setError(
              "No articles found for this category."
            );

          }

        } catch (fetchError) {

          console.error(
            "Fetch error:",
            fetchError
          );

          setData([]);

          setTotalResults(0);

          setError(
            fetchError.message ||
            "Failed to fetch news."
          );

        } finally {

          setIsLoading(false);

        }
      };


    fetchNews();

  }, [
    page,
    params.category
  ]);


  // =====================================================
  // RESET PAGE WHEN CATEGORY CHANGES
  // =====================================================

  useEffect(() => {

    setPage(1);

  }, [
    params.category
  ]);


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


  const handlePrev =
    () => {

      if (page > 1) {

        setPage(
          previousPage =>
            previousPage - 1
        );

      }
    };


  const handleNext =
    () => {

      if (
        page < totalPages
      ) {

        setPage(
          previousPage =>
            previousPage + 1
        );

      }
    };


  // =====================================================
  // ARTICLE CLICK
  // =====================================================

  const handleArticleClick =
    (article) => {

      console.log(
        "TOP HEADLINES ARTICLE:",
        article
      );

      console.log(
        "REAL DATABASE ARTICLE ID:",
        article?.id ||
        article?.Id
      );

      if (!article) {

        console.error(
          "Article is missing."
        );

        return;
      }


      /*
       * NO RANDOM ID HERE.
       *
       * The backend saves external
       * Vercel articles into SQL.
       *
       * Therefore every article
       * should have a real DB ID.
       */

      const articleId =
        article.id ??
        article.Id;


      if (!articleId) {

        console.error(
          "Article has no database ID:",
          article
        );

        return;
      }


      const articleWithId = {
        ...article,
        id: articleId
      };


      if (onArticleClick) {

        onArticleClick(
          articleWithId
        );

      } else {

        console.warn(
          "onArticleClick was not provided."
        );

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


      <div className="my-10 cards grid lg:place-content-center md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 xs:grid-cols-1 xs:gap-4 md:gap-10 lg:gap-14 md:px-16 xs:p-3">

        {isLoading ? (

          <Loader />

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
                  ""
                }

                author={
                  article.author ||
                  article.Author ||
                  "Unknown"
                }

                source={
                  typeof article.source ===
                  "object"
                    ? article.source?.name ||
                      "Unknown"
                    : article.source ||
                      article.Source ||
                      "Unknown"
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

          <p className="col-span-full text-center">

            No articles found for this category.

          </p>

        )}

      </div>


      {/* =================================================
          PAGINATION
      ================================================= */}

      {!isLoading &&
        data.length > 0 && (

          <div className="pagination flex justify-center gap-14 my-10 items-center">

            <button
              disabled={
                page <= 1
              }
              className="pagination-btn disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={
                handlePrev
              }
            >
              Prev
            </button>


            <p className="font-semibold opacity-80">

              {page} of{" "}
              {totalPages}

            </p>


            <button
              disabled={
                page >=
                totalPages
              }
              className="pagination-btn disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={
                handleNext
              }
            >
              Next
            </button>

          </div>

        )}

    </>
  );
}


export default TopHeadlines;
