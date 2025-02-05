const express = require('express');
const cors = require('cors');
const { marked } = require('marked');
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Create a custom renderer to add Prism classes
const renderer = new marked.Renderer();
renderer.code = (code, language) => {
  // Ensure language is specified and valid
  const validLang = language && language.trim() !== ''
    ? `language-${language.trim()}`
    : 'language-none';

  return `<pre><code class="${validLang}">${purify.sanitize(code)}</code></pre>`;
};

marked.setOptions({
  renderer: renderer,
  highlight: function (code, lang) {
    return code; // Let Prism handle highlighting on client-side
  },
  gfm: true,
  breaks: true
});

const app = express();
app.use(cors());
app.use(express.json());

/* This code snippet is defining a POST route in an Express application. When a POST request is made to
the '/convert' endpoint, the server will attempt to convert the incoming Markdown content to HTML
using the `marked` library. */
app.post('/convert', (req, res) => {
  try {
    const { markdown } = req.body;

    if (!markdown) {
      return res.status(400).json({ error: 'Markdown content is required' });
    }

    const html = marked(markdown);
    res.json({ html });
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: 'Failed to convert markdown' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));