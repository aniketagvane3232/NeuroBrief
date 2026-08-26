import React, { useState } from "react";
import "./Modal.css";

const Modal = ({
  show,
  onClose,
  article,
  children,
}) => {
  const [isBookmarked, setIsBookmarked] =
    useState(false);

  const [rating, setRating] =
    useState(0);

  const [inputValue, setInputValue] =
    useState("");

  const [error, setError] =
    useState("");

  const [aiLoading, setAiLoading] =
    useState(false);

  const [aiError, setAiError] =
    useState("");

  const [aiAnalyzed, setAiAnalyzed] =
    useState(false);

  const [summary, setSummary] =
    useState("");

  const [positiveSentiment, setPositiveSentiment] =
    useState("");

  const [negativeSentiment, setNegativeSentiment] =
    useState("");

  const [keywords, setKeywords] =
    useState([]);

  const [fakeNewsResult, setFakeNewsResult] =
    useState("");

  const [aiExplanation, setAiExplanation] =
    useState("");

  if (!show) {
    return null;
  }

  const token =
    localStorage.getItem("token");

  // =====================================================
  // BOOKMARK
  // =====================================================

  const handleBookmark = async () => {
    if (!token) {
      alert(
        "Please sign in before bookmarking an article."
      );

      return;
    }

    if (!article || !article.id) {
      alert(
        "Article ID is missing."
      );

      return;
    }

    setError("");

    try {
      const response =
        await fetch(
          `${import.meta.env.VITE_API_URL}/api/bookmarks`,
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
              articleId:
                article.id,
            }),
          }
        );

      const responseText =
        await response.text();

      if (!response.ok) {
        throw new Error(
          `Bookmark failed (${response.status}): ${
            responseText ||
            "Unknown server error"
          }`
        );
      }

      setIsBookmarked(true);

      alert(
        "Article bookmarked successfully!"
      );
    } catch (error) {
      console.error(
        "Bookmark error:",
        error
      );

      setError(
        error.message
      );

      alert(
        "Error bookmarking the article."
      );
    }
  };

  // =====================================================
  // RATING
  // =====================================================

  const handleRating = (
    newRating
  ) => {
    setRating(newRating);
  };

  // =====================================================
  // FEEDBACK
  // =====================================================

  const handleSubmitFeedback =
    async () => {
      if (!token) {
        alert(
          "Please sign in before submitting feedback."
        );

        return;
      }

      if (
        !article ||
        !article.id
      ) {
        alert(
          "Article ID is missing."
        );

        return;
      }

      if (rating === 0) {
        alert(
          "Please select a rating first."
        );

        return;
      }

      try {
        const response =
          await fetch(
            `${import.meta.env.VITE_API_URL}/api/reviews`,
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
                feedback:
                  inputValue,

                rating:
                  rating,

                articleId:
                  article.id,
              }),
            }
          );

        if (!response.ok) {
          throw new Error(
            `Failed to submit feedback (${response.status})`
          );
        }

        setInputValue("");
        setRating(0);

        alert(
          "Feedback submitted successfully!"
        );
      } catch (error) {
        console.error(
          "Feedback error:",
          error
        );

        alert(
          "Failed to submit feedback. Please try again."
        );
      }
    };

  // =====================================================
  // CLEAN AI RESPONSE
  // =====================================================

  const cleanText = (
    text
  ) => {
    if (!text) {
      return "";
    }

    return String(text)
      .replace(/\*\*/g, "")
      .replace(/###/g, "")
      .replace(/```/g, "")
      .trim();
  };

  // =====================================================
  // GET AI RESPONSE TEXT
  // =====================================================

  const getResponseText = (
    data
  ) => {
    if (!data) {
      return "";
    }

    if (
      typeof data ===
      "string"
    ) {
      return data;
    }

    return (
      data.result ||
      data.response ||
      data.content ||
      data.answer ||
      data.message ||
      data.text ||
      JSON.stringify(
        data,
        null,
        2
      )
    );
  };

  // =====================================================
  // EXTRACT AI SECTION
  // =====================================================

  const extractSection = (
    text,
    names
  ) => {
    if (!text) {
      return "";
    }

    for (
      const name of names
    ) {
      const regex =
        new RegExp(
          `(?:#{1,4}\\s*)?(?:\\d+\\.\\s*)?${name}\\s*[:\\-]?\\s*([\\s\\S]*?)(?=\\n\\s*(?:#{1,4}\\s*)?(?:\\d+\\.\\s*)?(?:Short Summary|Summary|Main Points|Overall Sentiment|Positive Sentiment|Negative Sentiment|Important Keywords|Keywords|Fake News Analysis|Fake News|Simple Explanation|Explanation)\\b|$)`,
          "i"
        );

      const match =
        text.match(
          regex
        );

      if (
        match &&
        match[1]
      ) {
        return cleanText(
          match[1]
        );
      }
    }

    return "";
  };

  // =====================================================
  // AI ANALYSIS
  // =====================================================

  const handleAIAnalysis =
    async () => {
      if (!article) {
        setAiError(
          "Article information is missing."
        );

        return;
      }

      setAiLoading(true);
      setAiError("");

      try {
        const articleText = `
Title: ${
          article.title ||
          ""
        }

Description: ${
          article.description ||
          ""
        }

Author: ${
          article.author ||
          ""
        }

Source: ${
          article.source?.name ||
          article.source ||
          ""
        }

Published At: ${
          article.publishedAt ||
          ""
        }

Content: ${
          article.content ||
          article.description ||
          ""
        }
        `.trim();

        const prompt = `
Analyze this news article.

Return the response using these exact sections:

1. Short Summary
Give a short summary of the article.

2. Main Points
Give 3 to 5 important points.

3. Overall Sentiment
Give Positive, Negative, or Neutral and explain.

4. Positive Sentiment
Explain positive aspects.

5. Negative Sentiment
Explain negative aspects.

6. Important Keywords
Give 5 to 10 keywords separated by commas.

7. Fake News Analysis
Give one of:
Likely Reliable
Needs Verification
Potentially Misleading

Then explain why.
This is only an AI assessment, not a definitive fact check.

8. Simple Explanation
Explain the article in simple language.

ARTICLE:

${articleText}
        `;

        const response =
          await fetch(
            `${import.meta.env.VITE_API_URL}/api/ai/generate`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                ...(token
                  ? {
                      Authorization:
                        `Bearer ${token}`,
                    }
                  : {}),
              },

              body: JSON.stringify({
                prompt:
                  prompt,
              }),
            }
          );

        const responseText =
          await response.text();

        let data;

        try {
          data =
            responseText
              ? JSON.parse(
                  responseText
                )
              : {};
        } catch {
          data =
            responseText;
        }

        if (!response.ok) {
          throw new Error(
            typeof data ===
            "object"
              ? data.message ||
                  data.error ||
                  "AI analysis failed."
              : data ||
                  "AI analysis failed."
          );
        }

        const output =
          getResponseText(
            data
          );

        console.log(
          "AI RESPONSE:",
          output
        );

        // SUMMARY

        setSummary(
          extractSection(
            output,
            [
              "Short Summary",
              "Summary",
            ]
          )
        );

        // POSITIVE

        setPositiveSentiment(
          extractSection(
            output,
            [
              "Positive Sentiment",
            ]
          )
        );

        // NEGATIVE

        setNegativeSentiment(
          extractSection(
            output,
            [
              "Negative Sentiment",
            ]
          )
        );

        // KEYWORDS

        const keywordText =
          extractSection(
            output,
            [
              "Important Keywords",
              "Keywords",
            ]
          );

        if (
          keywordText
        ) {
          const keywordArray =
            keywordText
              .split(",")
              .map(
                (item) =>
                  item
                    .replace(
                      /^[\s*\-\d.]+/,
                      ""
                    )
                    .trim()
              )
              .filter(
                Boolean
              );

          setKeywords(
            keywordArray
          );
        }

        // FAKE NEWS

        setFakeNewsResult(
          extractSection(
            output,
            [
              "Fake News Analysis",
              "Fake News",
            ]
          )
        );

        // SIMPLE EXPLANATION

        setAiExplanation(
          extractSection(
            output,
            [
              "Simple Explanation",
              "Explanation",
            ]
          )
        );

        setAiAnalyzed(true);
      } catch (error) {
        console.error(
          "AI analysis error:",
          error
        );

        setAiError(
          error.message ||
            "Failed to analyze this article."
        );
      } finally {
        setAiLoading(false);
      }
    };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">

      <div className="modal-content bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full relative max-h-[90vh] overflow-y-auto">

        {/* CLOSE */}

        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>

        {/* ARTICLE CONTENT */}

        {children}

        {/* ERROR */}

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* =================================================
            AI BUTTON
        ================================================= */}

        <div className="mt-8 border-t pt-6 text-center">

          <h2 className="text-2xl font-bold mb-2">
            AI Article Analysis
          </h2>

          <p className="text-gray-600 mb-4">
            Want to understand this
            article better? Click the
            button below to get an
            AI-powered analysis including
            a short summary, main points,
            sentiment, important keywords,
            and a simple explanation.
          </p>

          <button
            onClick={
              handleAIAnalysis
            }
            disabled={
              aiLoading
            }
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-3 px-7 rounded-full shadow-md"
          >
            {aiLoading
              ? "Analyzing Article..."
              : aiAnalyzed
              ? "✨ Analyze Again"
              : "✨ Analyze with AI"}
          </button>

          {aiError && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded text-left">
              {aiError}
            </div>
          )}

        </div>

        {/* =================================================
            AI RESULTS
        ================================================= */}

        {aiAnalyzed &&
          !aiLoading && (
            <div className="mt-8">

              {/* SUMMARY */}

              <div className="border-t pt-6">

                <h2 className="text-xl font-bold mb-4">
                  Summary of Article
                </h2>

                <div className="p-5 bg-gray-50 border rounded-lg">

                  <p className="text-gray-700 leading-7 whitespace-pre-wrap">
                    {summary ||
                      "AI could not generate a summary."}
                  </p>

                </div>
              </div>

              {/* SENTIMENT */}

              <div className="mt-8 border-t pt-6">

                <h2 className="text-xl font-bold mb-4">
                  Sentiment Analysis
                </h2>

                <div className="grid md:grid-cols-2 gap-4">

                  <div className="p-5 bg-green-50 border border-green-200 rounded-lg">

                    <h3 className="font-bold text-green-700 mb-2">
                      Positive Sentiment
                    </h3>

                    <p className="text-gray-700">
                      {positiveSentiment ||
                        "No significant positive sentiment detected."}
                    </p>

                  </div>

                  <div className="p-5 bg-red-50 border border-red-200 rounded-lg">

                    <h3 className="font-bold text-red-700 mb-2">
                      Negative Sentiment
                    </h3>

                    <p className="text-gray-700">
                      {negativeSentiment ||
                        "No significant negative sentiment detected."}
                    </p>

                  </div>

                </div>
              </div>

              {/* KEYWORDS */}

              <div className="mt-8 border-t pt-6">

                <h2 className="text-xl font-bold mb-4">
                  Important Keywords
                </h2>

                {keywords.length >
                0 ? (
                  <div className="flex flex-wrap gap-3">

                    {keywords.map(
                      (
                        keyword,
                        index
                      ) => (
                        <span
                          key={
                            index
                          }
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold"
                        >
                          {
                            keyword
                          }
                        </span>
                      )
                    )}

                  </div>
                ) : (
                  <p className="text-gray-500">
                    No keywords
                    were generated.
                  </p>
                )}

              </div>

              {/* FAKE NEWS */}

              <div className="mt-8 border-t pt-6">

                <h2 className="text-xl font-bold mb-4">
                  Fake News Analysis
                </h2>

                <div className="p-5 bg-yellow-50 border border-yellow-200 rounded-lg">

                  <p className="text-gray-700 leading-7 whitespace-pre-wrap">
                    {fakeNewsResult ||
                      "AI could not provide an assessment."}
                  </p>

                  <p className="text-xs text-gray-500 mt-4">
                    This is an AI-based
                    assessment and is
                    not a definitive
                    fact-check.
                  </p>

                </div>
              </div>

              {/* SIMPLE EXPLANATION */}

              <div className="mt-8 border-t pt-6">

                <h2 className="text-xl font-bold mb-4">
                  Simple Explanation
                </h2>

                <div className="p-5 bg-blue-50 border border-blue-200 rounded-lg">

                  <p className="text-gray-700 leading-7 whitespace-pre-wrap">
                    {aiExplanation ||
                      "AI could not generate an explanation."}
                  </p>

                </div>
              </div>

            </div>
          )}

        {/* =================================================
            BOOKMARK + RATING + FEEDBACK
        ================================================= */}

        <div className="flex flex-col items-center mt-8 border-t pt-6">

          {/* BOOKMARK */}

          <button
            onClick={
              handleBookmark
            }
            disabled={
              isBookmarked
            }
            className={`font-bold py-2 px-5 rounded-full shadow-md text-white ${
              isBookmarked
                ? "bg-green-600"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isBookmarked
              ? "★ Bookmarked"
              : "★ Bookmark"}
          </button>

          {/* RATING */}

          <div className="rating mt-5 flex gap-2">

            {[1, 2, 3, 4, 5].map(
              (star) => (
                <span
                  key={star}
                  onClick={() =>
                    handleRating(
                      star
                    )
                  }
                  className={`cursor-pointer text-3xl ${
                    rating >=
                    star
                      ? "text-yellow-400"
                      : "text-gray-400"
                  }`}
                >
                  ★
                </span>
              )
            )}

          </div>

          <span className="text-sm mt-2 text-gray-500">
            Rating: {rating}/5
          </span>

          {/* FEEDBACK */}

          <div className="mt-5 w-full">

            <textarea
              value={
                inputValue
              }
              onChange={(e) =>
                setInputValue(
                  e.target.value
                )
              }
              placeholder="Enter your feedback"
              className="w-full border border-gray-300 rounded-lg p-4 mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="4"
            />

            <button
              onClick={
                handleSubmitFeedback
              }
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full shadow-md"
            >
              Submit Feedback
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Modal;
