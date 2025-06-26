// Add support for ?raw imports
declare module '*?raw' {
  const content: string;
  export default content;
}

// Add support for markdown files with ?raw
declare module '*.md?raw' {
  const content: string;
  export default content;
}
