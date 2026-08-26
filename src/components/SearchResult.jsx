import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import EverythingCard from "./EverythingCard";
import Loader from "./Loader";

function SearchResult() {
  const { searchQuery } = useParams();

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const pageSize = 12;

  const fallbackImage =
    "https://via.placeholder.com/400x300?text=No+Image+Available";

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery) {
        setData([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const query =
          decodeURIComponent(searchQuery).trim();

        // =====================================================
        // .NET BACKEND
        // =====================================================

        const API_BASE =
          import.meta.env.VITE_API_URL;

        const url =
          `${API_BASE}/api/search/semantic` +
          `?q=${encodeURIComponent(query)}` +
          `&limit=${pageSize}`;

        console.log("Semantic search URL:", url);

        const response = await fetch(url);

        console.log(
          "Semantic search status:",
          response.status
        );

        if (!response.ok) {
          const errorText =
            await response.text();

          console.error(
            "Backend search error:",
            errorText
          );

          throw new Error(
            `Search failed: ${response.status}`
          );
        }

        const result =
          await response.json();

        console.log(
          "Semantic search response:",
          result
        );

        // =====================================================
        // CHECK BACKEND RESPONSE
        // =====================================================

        if (
          !result.success ||
          !Array.isArray(result.results)
        ) {
          setData([]);
          return;
        }

        // =====================================================
        // CONVERT RESULTS
        // =====================================================

        const articles =
          result.results.map((item) => ({
            ...(item.article || {}),

            relevanceScore:
              Number(
                item.relevanceScore ?? 0
              )
          }));

        console.log(
          "Articles returned:",
          articles
        );

        setData(articles);

      } catch (error) {
        console.error(
          "Semantic search error:",
          error
        );

        setData([]);

        setError(
          "Failed to search news. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

  // =========================================================
  // DISPLAY QUERY
  // =========================================================

  const displayQuery =
    searchQuery
      ? decodeURIComponent(searchQuery)
      : "";

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      {error && (
        <div className="text-red-500 mb-4 text-center">
          {error}
        </div>
      )}

      {!isLoading && (
        <div className="text-center mt-6">
          <h2 className="text-2xl font-bold">
            Semantic Search Results
          </h2>

          <p className="text-gray-600 mt-2">
            Results for:{" "}
            <span className="font-semibold">
              "{displayQuery}"
            </span>
          </p>

          {data.length > 0 && (
            <p className="text-gray-500 mt-1">
              {data.length} relevant articles found
            </p>
          )}
        </div>
      )}

      {/* =====================================================
          ARTICLES
      ===================================================== */}

      <div className="my-10 cards grid lg:place-content-center md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 xs:grid-cols-1 xs:gap-4 md:gap-10 lg:gap-14 md:px-16 xs:p-3">

        {isLoading ? (
          <Loader />
        ) : data.length > 0 ? (
          data.map((element, index) => (
            <div
              key={
                element.id ||
                element.url ||
                index
              }
              className="relative"
            >

              {/* =================================================
                  SEMANTIC RELEVANCE
              ================================================= */}

              <div className="absolute z-10 top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded">
                Relevance:{" "}
                {Math.round(
                  (element.relevanceScore || 0) *
                    100
                )}
                %
              </div>

              <EverythingCard
                title={
                  element.title ||
                  "Untitled"
                }

                description={
                  element.description ||
                  ""
                }

                imgUrl={
                  element.urlToImage ||
                  element.url_to_image ||
                  fallbackImage
                }

                publishedAt={
                  element.publishedAt ||
                  element.published_at
                }

                url={
                  element.url ||
                  ""
                }

                author={
                  element.author ||
                  "Unknown"
                }

                source={
                  typeof element.source ===
                  "object"
                    ? element.source?.name ||
                      "Unknown"
                    : element.source ||
                      "Unknown"
                }
              />

            </div>
          ))
        ) : (
          <div className="text-center text-lg font-semibold col-span-full">
            No relevant news found for "
            {displayQuery}"
          </div>
        )}

      </div>
    </>
  );
}

export default SearchResult;
