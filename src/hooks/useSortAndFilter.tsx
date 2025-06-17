
import { useState } from "react";

export function useSortAndFilter() {
  const [sortBy, setSortBy] = useState("newest");
  const [activeTab, setActiveTab] = useState("recent"); // Changed from "all" to "recent"
  const [searchQuery, setSearchQuery] = useState("");

  return {
    sortBy,
    setSortBy,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery
  };
}
