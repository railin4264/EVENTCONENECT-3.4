import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html,
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: 1.6;
    color: #333;
    background-color: #fff;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    border: none;
    background: none;
    cursor: pointer;
    font-family: inherit;
  }

  input,
  textarea {
    font-family: inherit;
    border: none;
    outline: none;
  }

  ul,
  ol {
    list-style: none;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  ::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }

  /* Focus styles */
  :focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  /* Selection styles */
  ::selection {
    background-color: #3b82f6;
    color: white;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    html,
    body {
      color: #e5e7eb;
      background-color: #111827;
    }

    ::-webkit-scrollbar-track {
      background: #374151;
    }

    ::-webkit-scrollbar-thumb {
      background: #6b7280;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #9ca3af;
    }
  }

  /* Utility classes */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .text-center {
    text-align: center;
  }

  .text-left {
    text-align: left;
  }

  .text-right {
    text-align: right;
  }

  .hidden {
    display: none;
  }

  .block {
    display: block;
  }

  .inline-block {
    display: inline-block;
  }

  .flex {
    display: flex;
  }

  .inline-flex {
    display: inline-flex;
  }

  .grid {
    display: grid;
  }

  .relative {
    position: relative;
  }

  .absolute {
    position: absolute;
  }

  .fixed {
    position: fixed;
  }

  .sticky {
    position: sticky;
  }
`;

export default GlobalStyle;
