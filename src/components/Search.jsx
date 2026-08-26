import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Search() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    const query = search.trim();

    if (!query) {
      return;
    }

    navigate(`/search/${encodeURIComponent(query)}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="search-bar my-8 text-center px-2 xs:mb-10 md:mb-16"
    >
      <input
        type="text"
        name="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="search-box md:w-2/4 sm:p-4 xs:px-2"
        placeholder="Search News"
      />

      <button type="submit" className="btn">
        Search
      </button>
    </form>
  );
}

export default Search;
