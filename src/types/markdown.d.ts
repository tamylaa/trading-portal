declare module '*.md' {
  const content: string;
  export default content;
}

declare module '!!raw-loader!*.md' {
  const content: string;
  export default content;
}
