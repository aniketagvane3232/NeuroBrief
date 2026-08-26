import React, { useState } from "react";

function AI() {
  const [mode, setMode] = useState("generate");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const endpoints = {
    generate: "/api/ai/generate",
    explain: "/api/ai/explain",
    document: "/api/ai/document",
    tutorial: "/api/ai/tutorial",
  };

  const modeTitles = {
    generate: "AI Generate",
    explain: "AI Explain",
    document: "AI Document",
    tutorial: "AI Tutorial",
  };

  const placeholders = {
    generate: "Ask AI anything...",
    explain: "Enter a topic or article you want explained...",
    document: "Enter the document content or text...",
    tutorial: "Enter the topic you want a tutorial for...",
  };

  const getAIResult = (data) => {
    if (!data) {
      return "";
    }

    if (typeof data === "string") {
      return data;
    }

    if (data.result) {
      return typeof data.result === "string"
        ? data.result
        : JSON.stringify(data.result, null, 2);
    }

    if (data.response) {
      return typeof data.response === "string"
        ? data.response
        : JSON.stringify(data.response, null, 2);
    }

    if (data.content) {
      return typeof data.content === "string"
        ? data.content
        : JSON.stringify(data.content, null, 2);
    }

    if (data.answer) {
      return typeof data.answer === "string"
        ? data.answer
        : JSON.stringify(data.answer, null, 2);
    }

    if (data.documentation) {
      return data.documentation;
    }

    if (data.explanation) {
      return data.explanation;
    }

    if (data.tutorial) {
      return data.tutorial;
    }

    if (data.message) {
      return data.message;
    }

    return JSON.stringify(data, null, 2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!prompt.trim()) {
      setError("Please enter something first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5251${endpoints[mode]}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          body: JSON.stringify({
            prompt: prompt,
          }),
        }
      );

      const text = await response.text();

      let data;

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = text;
      }

      console.log(`${mode.toUpperCase()} RESPONSE:`, data);

      if (!response.ok) {
        throw new Error(
          typeof data === "object"
            ? data.message ||
                data.error ||
                "AI request failed."
            : data || "AI request failed."
        );
      }

      const output = getAIResult(data);

      setResult(output);
    } catch (err) {
      console.error(`${mode} error:`, err);

      setError(
        err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    setPrompt("");
    setResult("");
    setError("");
  };

  return (
    <div className="min-h-screen pt-32 px-6 pb-10">

      <div className="max-w-5xl mx-auto">

        {/* PAGE TITLE */}

        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          AI Assistant
        </h1>

        <p className="text-gray-600 mb-8">
          Use Neural Knights AI tools for generating,
          explaining, documents, and tutorials.
        </p>

        {/* AI BUTTONS */}

        <div className="flex flex-wrap gap-3 mb-8">

          <button
            type="button"
            onClick={() => changeMode("generate")}
            className={`px-5 py-3 rounded-lg font-semibold ${
              mode === "generate"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Generate
          </button>

          <button
            type="button"
            onClick={() => changeMode("explain")}
            className={`px-5 py-3 rounded-lg font-semibold ${
              mode === "explain"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Explain
          </button>

          <button
            type="button"
            onClick={() => changeMode("document")}
            className={`px-5 py-3 rounded-lg font-semibold ${
              mode === "document"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Document
          </button>

          <button
            type="button"
            onClick={() => changeMode("tutorial")}
            className={`px-5 py-3 rounded-lg font-semibold ${
              mode === "tutorial"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Tutorial
          </button>

        </div>

        {/* AI FORM */}

        <div className="bg-white rounded-xl shadow-md border p-6">

          <h2 className="text-2xl font-bold text-gray-800 mb-5">
            {modeTitles[mode]}
          </h2>

          <form onSubmit={handleSubmit}>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={placeholders[mode]}
              rows={8}
              className="w-full border border-gray-300 rounded-lg p-4 outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />

            {error && (
              <p className="text-red-500 mt-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold px-7 py-3 rounded-lg"
            >
              {loading
                ? "Processing..."
                : mode === "generate"
                ? "Generate"
                : mode === "explain"
                ? "Explain"
                : mode === "document"
                ? "Process Document"
                : "Create Tutorial"}
            </button>

          </form>

        </div>

        {/* AI RESPONSE */}

        {result && (
          <div className="mt-8 bg-white rounded-xl shadow-md border p-6">

            <div className="flex justify-between items-center mb-5">

              <h2 className="text-2xl font-bold text-gray-800">
                AI Response
              </h2>

              <button
                type="button"
                onClick={() => setResult("")}
                className="text-gray-500 hover:text-gray-800 font-semibold"
              >
                Clear
              </button>

            </div>

            <div className="whitespace-pre-wrap leading-7 text-gray-700">
              {result}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}

export default AI;