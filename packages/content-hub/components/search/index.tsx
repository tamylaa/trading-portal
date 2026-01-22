import React from 'react';

export const SearchResults = ({ results = [] }: { results?: any[] }) => (
  <div className="search-results">
    <h3>Search Results</h3>
    <ul>
      {results.map((r, i) => (
        <li key={i}>{r.title || r.id || JSON.stringify(r)}</li>
      ))}
    </ul>
  </div>
);

export const RecentSearches = ({ items = [] }: { items?: string[] }) => (
  <div className="recent-searches">
    <h3>Recent Searches</h3>
    <ul>
      {items.map((s, i) => <li key={i}>{s}</li>)}
    </ul>
  </div>
);

export const SearchStatus = ({ status = 'idle' }: { status?: string }) => (
  <div className="search-status">Status: {status}</div>
);

export default SearchResults;
