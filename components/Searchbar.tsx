"use client";
import { error } from "console";
import React, { FormEvent, useState } from "react";

const isValidURlAmazonLink = (url: string) => {
  try {
    const parsedURL = new URL(url);
    const hostname = parsedURL.hostname;

    if (
      hostname.includes("amazon.com") ||
      hostname.includes("amazon.sg") ||
      hostname.endsWith("amazon")
    ) {
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
};

function Searchbar() {
  const [searchPrompt, setSearchPrompt] = useState("");
  const [Loading, setLoading] = useState(false);

  const submitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isValidLink = isValidURlAmazonLink(searchPrompt);

    if (!isValidLink) return alert("Please provide a valid Amazon link");

    try {
      setLoading(true);
      // Scraping the product page
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form className="flex flex-wrap gap-4 mt-12" onSubmit={submitHandler}>
        <input
          type="text"
          placeholder="Enter Your Product Link or URL"
          className="searchbar-input"
          onChange={(e) => setSearchPrompt(e.target.value)}
          value={searchPrompt}
        />
        <button
          disabled={searchPrompt === ""}
          type="submit"
          className="searchbar-btn"
        >
          {Loading ? "Searching..." : "Search"}
        </button>
      </form>
    </>
  );
}

export default Searchbar;
