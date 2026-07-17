/* ==========================================================================
   testUtils.js
   --------------------------------------------------------------------------
   Shared helper for the Jest test suite. Because script.js was written as
   a plain browser <script> (not an ES module), this helper:
     1. Loads the real markup from index.html into the jsdom `document`.
     2. Exposes questions.js's data as a global (mirroring how two adjacent
        <script> tags share globals in the browser).
     3. Freshly `require`s script.js for every test (via jest.resetModules)
        so each test starts from a clean DOM + clean internal state.
   ========================================================================== */

const fs = require("fs");
const path = require("path");

function loadDomFromIndexHtml() {
  const html = fs.readFileSync(path.resolve(__dirname, "../index.html"), "utf8");
  const bodyMatch = html.match(/<body>([\s\S]*)<\/body>/);
  if (!bodyMatch) {
    throw new Error("Could not find <body> content in index.html");
  }
  // Strip <script> tags — we load script.js ourselves via require().
  const bodyContent = bodyMatch[1].replace(/<script[\s\S]*?<\/script>/g, "");
  document.body.innerHTML = bodyContent;
}

/**
 * Returns a freshly loaded instance of the app (DOM + script.js exports).
 */
function loadApp() {
  jest.resetModules();
  loadDomFromIndexHtml();

  const { quizQuestions } = require("../questions.js");
  global.quizQuestions = quizQuestions;

  // jsdom does not implement window.alert — stub it so validation code
  // doesn't throw, and so tests can assert it was called.
  window.alert = jest.fn();

  const app = require("../script.js");
  return app;
}

module.exports = { loadApp, loadDomFromIndexHtml };
