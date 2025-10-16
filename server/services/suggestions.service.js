const natural = require('natural');

async function generateTags({ title, body }) {
  const textContent = `${title} ${body}`;

  const TfIdf = natural.TfIdf;
  const tfidf = new TfIdf();

  tfidf.addDocument(textContent);

  const topTerms = tfidf.listTerms(0).slice(0, 10);

  const suggestions = topTerms
    .map(item => item.term)
    // --- THIS IS THE ONLY CHANGE ---
    // Allow words with 2 or more letters, like "js" or "css"
    .filter(term => term.length > 1);

  return suggestions;
}

module.exports = { generateTags };