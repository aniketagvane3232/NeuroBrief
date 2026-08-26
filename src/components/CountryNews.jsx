import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import EverythingCard from "./EverythingCard";
import Loader from "./Loader";

function CountryNews() {
  const { iso } = useParams();

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const countryNames = {
    in: "India",
    us: "USA",
    gb: "UK",
    ca: "Canada",
    au: "Australia",
    de: "Germany",
    fr: "France",
    jp: "Japan",
    cn: "China",
    br: "Brazil",
  };

  const countryName =
    countryNames[iso?.toLowerCase()] || iso?.toUpperCase();

  useEffect(() => {
    const fetchCountryNews = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/articles?country=${encodeURIComponent(
            countryName
          )}`
        );

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setData(result.articles || []);
        } else {
          setData([]);
          setError(result.message || "No news found.");
        }
      } catch (err) {
        console.error("Country news error:", err);
        setError(
          "Failed to fetch country news. Make sure the backend is running."
        );
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (countryName) {
      fetchCountryNews();
    }
  }, [countryName]);

  return (
    <div className="w-full">
      <div className="px-4 md:px-16 lg:px-20 py-8">

        <h1 className="text-3xl font-bold mb-2">
          Latest News from {countryName}
        </h1>

        <p className="text-gray-600 mb-8">
          Latest articles from {countryName}
        </p>

        {error && (
          <div className="text-red-500 mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <Loader />
        ) : data.length > 0 ? (
          <div className="my-10 cards grid lg:place-content-center md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 xs:grid-cols-1 xs:gap-4 md:gap-10 lg:gap-14 md:px-16 xs:p-3">
            {data.map((article, index) => (
              <EverythingCard
                key={article.id || index}
                title={article.title}
                description={article.description}
                imgUrl={
                  article.urlToImage ||
                  "https://via.placeholder.com/400x300?text=No+Image+Available"
                }
                publishedAt={article.publishedAt}
                url={article.url}
                author={article.author}
                source={article.source}
              />
            ))}
          </div>
        ) : (
          <div className="text-gray-600 py-10">
            No news articles found for {countryName}.
          </div>
        )}
      </div>
    </div>
  );
}

export default CountryNews;
