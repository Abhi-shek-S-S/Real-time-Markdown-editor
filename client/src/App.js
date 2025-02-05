import React, { useState, useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-core';
import 'prismjs/themes/prism-okaidia.css'; // Good for both light and dark modes
import './App.css';


function App() {
  const [markdown, setMarkdown] = useState('');
  const [html, setHtml] = useState('');
  const [error, setError] = useState(null);
  const [showSource, setShowSource] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isMobilePreview, setIsMobilePreview] = useState(false);


  /* This `useEffect` hook is responsible for converting the markdown input to HTML. Here's a breakdown
  of what it does: */
  useEffect(() => {
    const convertMarkdown = async () => {
      try {
        const response = await fetch('http://localhost:5000/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ markdown })
        });

        if (!response.ok) {
          throw new Error('Conversion failed');
        }

        const { html } = await response.json();
        setHtml(html);
        setError(null);

        // Highlight after setting HTML
        setTimeout(() => {
          Prism.highlightAll();
        }, 0);
      } catch (error) {
        console.error('Conversion error:', error);
        setError('Failed to convert markdown. Please try again.');
      }
    };

    const debounceTimer = setTimeout(() => {
      if (markdown) convertMarkdown();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [markdown]);


  useEffect(() => {
    // Although the backend is now highlighting,
    // this call ensures any additional client-side highlighting if needed.
    Prism.highlightAll();
  }, [html, showSource]);

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="app-header">
        <h1>Markdown Editor</h1>
        <div className="header-controls">
          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button
            className="mobile-preview-toggle"
            onClick={() => setIsMobilePreview(!isMobilePreview)}
          >
            {isMobilePreview ? 'Show Editor' : 'Show Preview'}
          </button>
        </div>
      </div>
      <div className={`editor-container ${isMobilePreview ? 'preview-mode' : 'edit-mode'}`}>
        <div className="editor-pane">
          <h2>Markdown Input</h2>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="# Start typing your Markdown here..."
          />
        </div>
        <div className="preview-pane">
          <div className="preview-header">
            <h2>Preview</h2>
            <button onClick={() => setShowSource(!showSource)}>
              {showSource ? 'Show Preview' : 'Show HTML'}
            </button>
          </div>
          {error ? (
            <div className="error-message">{error}</div>
          ) : showSource ? (
            <pre className="html-source">
              <code className="language-html">
                {html}
              </code>
            </pre>
          ) : (
            <div className="preview-content" dangerouslySetInnerHTML={{ __html: html }} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
