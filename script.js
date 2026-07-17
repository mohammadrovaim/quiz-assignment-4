/* ==========================================================================
   script.js
   --------------------------------------------------------------------------
   This file contains ALL the interactive logic of the Quiz Application:
   - Screen navigation (Home -> Quiz -> Result -> Review)
   - Rendering questions and options
   - The 20-second per-question timer
   - Answer selection + validation
   - Score calculation
   - Building the review list

   The questions themselves live in questions.js (loaded before this file).
   ========================================================================== */

/* ---------- App state -----------------------------------------------------
   Keeping all "moving parts" of the quiz in one state object makes the
   app easier to reason about and easier to debug/extend later.
   -------------------------------------------------------------------------*/
const TIME_PER_QUESTION = 20; // seconds

const state = {
  currentQuestionIndex: 0,
  userAnswers: [],       // userAnswers[i] = index of the option the user picked, or null
  timeLeft: TIME_PER_QUESTION,
  timerId: null          // holds the setInterval reference so we can clear it
};

/* ---------- Cached DOM references ----------------------------------------
   Grabbing elements once (instead of re-querying the DOM repeatedly)
   keeps the code fast and readable.
   -------------------------------------------------------------------------*/
const homeScreen = document.getElementById("home-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const reviewScreen = document.getElementById("review-screen");

const startQuizBtn = document.getElementById("start-quiz-btn");
const questionText = document.getElementById("question-text");
const optionsList = document.getElementById("options-list");
const progressLabel = document.getElementById("progress-label");
const progressFill = document.getElementById("progress-fill");
const timerDisplay = document.getElementById("timer-display");
const timerWrap = document.querySelector(".timer-wrap");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

const performanceMessage = document.getElementById("performance-message");
const scorePercentage = document.getElementById("score-percentage");
const ringProgress = document.getElementById("ring-progress");
const correctCountEl = document.getElementById("correct-count");
const incorrectCountEl = document.getElementById("incorrect-count");
const totalCountEl = document.getElementById("total-count");
const reviewBtn = document.getElementById("review-btn");
const restartBtn = document.getElementById("restart-btn");

const reviewList = document.getElementById("review-list");
const backToResultBtn = document.getElementById("back-to-result-btn");
const restartFromReviewBtn = document.getElementById("restart-from-review-btn");

/* ==========================================================================
   SCREEN NAVIGATION HELPERS
   ========================================================================== */

/**
 * Hides every screen, then shows only the one passed in.
 * This is the single function responsible for switching views, which
 * keeps navigation logic in one predictable place.
 */
function showScreen(screenElement) {
  const allScreens = document.querySelectorAll(".screen");
  allScreens.forEach((screen) => screen.classList.remove("active-screen"));
  screenElement.classList.add("active-screen");
}

/* ==========================================================================
   QUIZ INITIALIZATION
   ========================================================================== */

/**
 * Resets all quiz state back to the beginning and shows the first question.
 * Called both when the app first starts the quiz, and when "Restart Quiz"
 * is clicked.
 */
function startQuiz() {
  state.currentQuestionIndex = 0;
  state.userAnswers = new Array(quizQuestions.length).fill(null);

  showScreen(quizScreen);
  renderQuestion();
}

/* ==========================================================================
   RENDERING A QUESTION
   ========================================================================== */

/**
 * Draws the current question, its four options, the progress bar/label,
 * and (re)starts the 20-second timer.
 */
function renderQuestion() {
  const index = state.currentQuestionIndex;
  const question = quizQuestions[index];

  // ----- Progress indicator -----
  progressLabel.textContent = `Question ${index + 1} of ${quizQuestions.length}`;
  progressFill.style.width = `${((index + 1) / quizQuestions.length) * 100}%`;

  // ----- Question text -----
  questionText.textContent = question.question;

  // ----- Build the 4 option buttons -----
  optionsList.innerHTML = ""; // clear previous question's options
  const optionLetters = ["A", "B", "C", "D"];

  question.options.forEach((optionText, optionIndex) => {
    const optionEl = document.createElement("div");
    optionEl.classList.add("option-item");
    optionEl.setAttribute("role", "button");
    optionEl.setAttribute("tabindex", "0");

    // If the user already answered this question (e.g. came back via
    // "Previous"), re-highlight their previous choice.
    if (state.userAnswers[index] === optionIndex) {
      optionEl.classList.add("selected");
    }

    optionEl.innerHTML = `
      <span class="option-marker">${optionLetters[optionIndex]}</span>
      <span class="option-label">${optionText}</span>
    `;

    optionEl.addEventListener("click", () => selectOption(optionIndex));
    optionEl.addEventListener("keypress", (e) => {
      if (e.key === "Enter" || e.key === " ") selectOption(optionIndex);
    });

    optionsList.appendChild(optionEl);
  });

  // ----- Previous/Next button states -----
  prevBtn.disabled = index === 0;
  nextBtn.textContent = index === quizQuestions.length - 1 ? "Submit Quiz" : "Next →";

  // ----- Timer -----
  resetTimer();
}

/* ==========================================================================
   ANSWER SELECTION
   ========================================================================== */

/**
 * Stores the user's chosen option for the current question and updates
 * the UI so the chosen option is visually highlighted.
 */
function selectOption(optionIndex) {
  state.userAnswers[state.currentQuestionIndex] = optionIndex;

  // Re-render the highlight state without rebuilding the whole question
  const allOptionEls = optionsList.querySelectorAll(".option-item");
  allOptionEls.forEach((el, i) => {
    el.classList.toggle("selected", i === optionIndex);
  });
}

/* ==========================================================================
   TIMER LOGIC
   ========================================================================== */

/**
 * Clears any running timer and starts a fresh 20-second countdown for the
 * question currently on screen.
 */
function resetTimer() {
  clearInterval(state.timerId);
  state.timeLeft = TIME_PER_QUESTION;
  updateTimerDisplay();

  state.timerId = setInterval(() => {
    state.timeLeft--;
    updateTimerDisplay();

    if (state.timeLeft <= 0) {
      clearInterval(state.timerId);
      // Time is up: automatically advance, even if no option was chosen.
      goToNextQuestion(true);
    }
  }, 1000);
}

/**
 * Updates the numeric timer display and adds a "warning" style
 * (red + pulsing) once time is running low.
 */
function updateTimerDisplay() {
  timerDisplay.textContent = state.timeLeft;
  timerWrap.classList.toggle("timer-warning", state.timeLeft <= 5);
}

/* ==========================================================================
   NAVIGATION BETWEEN QUESTIONS
   ========================================================================== */

/**
 * Moves to the next question, or finishes the quiz if this was the last one.
 * @param {boolean} forced - true when called automatically by the timer
 *                            (skips the "please select an option" validation)
 */
function goToNextQuestion(forced = false) {
  const index = state.currentQuestionIndex;

  // Validation: block manual "Next" clicks until an option is chosen.
  if (!forced && state.userAnswers[index] === null) {
    alert("Please select an option before proceeding.");
    return;
  }

  clearInterval(state.timerId);

  if (index === quizQuestions.length - 1) {
    finishQuiz();
  } else {
    state.currentQuestionIndex++;
    renderQuestion();
  }
}

/**
 * Moves back one question (no validation needed going backwards).
 */
function goToPreviousQuestion() {
  if (state.currentQuestionIndex === 0) return;
  clearInterval(state.timerId);
  state.currentQuestionIndex--;
  renderQuestion();
}

/* ==========================================================================
   SCORING
   ========================================================================== */

/**
 * Compares every stored user answer against the correct answer to work out
 * the final score. Calculating this only once, at the end, means the user
 * can freely move back and forth between questions without the score
 * being counted more than once.
 */
function calculateScore() {
  let correct = 0;

  quizQuestions.forEach((question, i) => {
    if (state.userAnswers[i] === question.correctIndex) {
      correct++;
    }
  });

  const total = quizQuestions.length;
  const incorrect = total - correct;
  const percentage = Math.round((correct / total) * 100);

  return { correct, incorrect, total, percentage };
}

/**
 * Returns a human-friendly performance message based on the percentage.
 */
function getPerformanceMessage(percentage) {
  if (percentage >= 90) return "Excellent! 🏆";
  if (percentage >= 70) return "Good Job! 👍";
  if (percentage >= 50) return "Average — Keep Practicing 📘";
  return "Needs Improvement — Don't Give Up 💪";
}

/* ==========================================================================
   RESULT SCREEN
   ========================================================================== */

/**
 * Called once the last question has been answered (or timed out).
 * Computes the score and renders the result screen.
 */
function finishQuiz() {
  const { correct, incorrect, total, percentage } = calculateScore();

  performanceMessage.textContent = getPerformanceMessage(percentage);
  scorePercentage.textContent = `${percentage}%`;
  correctCountEl.textContent = correct;
  incorrectCountEl.textContent = incorrect;
  totalCountEl.textContent = total;

  // Animate the circular progress ring.
  // Circle circumference = 2 * PI * r, where r = 70 (see style.css / SVG).
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (percentage / 100) * circumference;
  // Reset first so the CSS transition always plays from empty -> filled.
  ringProgress.style.strokeDasharray = `${circumference}`;
  ringProgress.style.strokeDashoffset = `${circumference}`;
  requestAnimationFrame(() => {
    ringProgress.style.strokeDashoffset = `${offset}`;
  });

  showScreen(resultScreen);
}

/* ==========================================================================
   REVIEW SCREEN
   ========================================================================== */

/**
 * Builds a list showing every question, the user's answer, and the
 * correct answer - highlighting correct answers in green and incorrect
 * ones in red.
 */
function renderReview() {
  reviewList.innerHTML = "";

  quizQuestions.forEach((question, i) => {
    const userAnswerIndex = state.userAnswers[i];
    const isCorrect = userAnswerIndex === question.correctIndex;

    const userAnswerText =
      userAnswerIndex === null ? "No answer selected" : question.options[userAnswerIndex];
    const correctAnswerText = question.options[question.correctIndex];

    const itemEl = document.createElement("div");
    itemEl.classList.add("review-item");

    itemEl.innerHTML = `
      <p class="review-question">${i + 1}. ${question.question}</p>
      <div class="review-answer-line ${isCorrect ? "user-correct" : "user-wrong"}">
        Your answer: ${userAnswerText}
      </div>
      ${
        !isCorrect
          ? `<div class="review-answer-line correct-reveal">Correct answer: ${correctAnswerText}</div>`
          : ""
      }
    `;

    reviewList.appendChild(itemEl);
  });

  showScreen(reviewScreen);
}

/* ==========================================================================
   EVENT LISTENERS
   ========================================================================== */

startQuizBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", () => goToNextQuestion(false));
prevBtn.addEventListener("click", goToPreviousQuestion);

reviewBtn.addEventListener("click", renderReview);
restartBtn.addEventListener("click", startQuiz);

backToResultBtn.addEventListener("click", () => showScreen(resultScreen));
restartFromReviewBtn.addEventListener("click", startQuiz);

/* ==========================================================================
   TEST EXPORTS (added for Assignment 4 — AI-generated automated testing)
   --------------------------------------------------------------------------
   This block only runs under Node/Jest (module.exports does not exist in
   a plain browser <script> tag), so it has zero effect on the app when
   opened normally via index.html. It exposes the pure/testable functions
   so Jest can unit-test them directly instead of only through the DOM.
   ========================================================================== */
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    state,
    TIME_PER_QUESTION,
    showScreen,
    startQuiz,
    renderQuestion,
    selectOption,
    resetTimer,
    goToNextQuestion,
    goToPreviousQuestion,
    calculateScore,
    getPerformanceMessage,
    finishQuiz,
    renderReview
  };
}
