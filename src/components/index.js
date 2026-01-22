export { default as Header } from './header/header';
export { default as Footer } from './footer/footer';
export { default as Sidebar } from './sidebar/sidebar';

// Content Management Components - now imported from packages
export {
  ContentManager,
  ContentSharing,
  MarkdownContent,
  MultiMarkdownContent,
  LoadingSpinner,
  FAQ,
  SearchResults,
  RecentSearches,
  SearchStatus
} from '@tamyla/content-hub';

export {
  EmailBlaster
} from '@tamyla/campaign-hub';