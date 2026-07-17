/* ==========================================================================
   quiz.test.js
   --------------------------------------------------------------------------
   Automated test suite for the QuizMaster app (Assignment 3 codebase).

   These tests were AI-generated (drafted with Claude, based on the
   requirements/user stories in the Assignment 3 spec — 20s timer, one
   question at a time, Previous/Next navigation, validation before
   advancing, scoring, and the review screen) and then reviewed, run, and
   adjusted by the student against the real script.js/questions.js/index.html
   files. See the assignment report for the AI-effectiveness analysis.

   Coverage groups:
     A. Data integrity (questions.js)             — edge / sanity checks
     B. Scoring logic (calculateScore)             — functional + edge cases
     C. Performance messages (getPerformanceMessage) — boundary/edge cases
     D. Navigation & validation (goToNextQuestion)  — functional + error handling
     E. Timer behavior (resetTimer)                 — functional + edge cases
     F. Review screen rendering (renderReview)       — functional + edge cases
   ========================================================================== */

const { loadApp } = require("./testUtils");

describe("A. questions.js — data integrity", () => {
  test("has at least 15 questions (assignment requirement)", () => {
    const { quizQuestions } = require("../questions.js");
    expect(quizQuestions.length).toBeGreaterThanOrEqual(15);
  });

  test("every question has exactly 4 options", () => {
    const { quizQuestions } = require("../questions.js");
    quizQuestions.forEach((q) => {
      expect(q.options).toHaveLength(4);
    });
  });

  test("every correctIndex points to a valid option (0-3)", () => {
    const { quizQuestions } = require("../questions.js");
    quizQuestions.forEach((q) => {
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThanOrEqual(3);
    });
  });

  test("no question text or option text is empty (edge case)", () => {
    const { quizQuestions } = require("../questions.js");
    quizQuestions.forEach((q) => {
      expect(q.question.trim().length).toBeGreaterThan(0);
      q.options.forEach((opt) => expect(opt.trim().length).toBeGreaterThan(0));
    });
  });
});

describe("B. calculateScore — functional & edge cases", () => {
  test("returns 100% when every answer is correct", () => {
    const app = loadApp();
    app.startQuiz();
    app.state.userAnswers = app.state.userAnswers.map(
      (_, i) => require("../questions.js").quizQuestions[i].correctIndex
    );
    const result = app.calculateScore();
    expect(result.correct).toBe(result.total);
    expect(result.incorrect).toBe(0);
    expect(result.percentage).toBe(100);
  });

  test("returns 0% when every answer is wrong", () => {
    const app = loadApp();
    app.startQuiz();
    const { quizQuestions } = require("../questions.js");
    app.state.userAnswers = quizQuestions.map((q) => (q.correctIndex + 1) % 4);
    const result = app.calculateScore();
    expect(result.correct).toBe(0);
    expect(result.percentage).toBe(0);
  });

  test("counts unanswered (null) questions as incorrect (edge case)", () => {
    const app = loadApp();
    app.startQuiz();
    // Leave every answer as null (the default after startQuiz).
    const result = app.calculateScore();
    expect(result.correct).toBe(0);
    expect(result.incorrect).toBe(result.total);
  });

  test("handles a realistic mixed set of correct/incorrect/unanswered", () => {
    const app = loadApp();
    app.startQuiz();
    const { quizQuestions } = require("../questions.js");
    // Answer only the first 10 questions; half right, half wrong.
    for (let i = 0; i < 10; i++) {
      app.state.userAnswers[i] =
        i % 2 === 0 ? quizQuestions[i].correctIndex : (quizQuestions[i].correctIndex + 1) % 4;
    }
    const result = app.calculateScore();
    expect(result.correct).toBe(5);
    expect(result.total).toBe(quizQuestions.length);
    expect(result.incorrect).toBe(result.total - 5);
  });
});

describe("C. getPerformanceMessage — boundary/edge cases", () => {
  const app = loadApp();

  test.each([
    [100, "Excellent"],
    [90, "Excellent"],
    [89, "Good"],
    [70, "Good"],
    [69, "Average"],
    [50, "Average"],
    [49, "Needs Improvement"],
    [0, "Needs Improvement"]
  ])("percentage=%i -> message contains '%s'", (percentage, expectedSubstring) => {
    expect(app.getPerformanceMessage(percentage)).toContain(expectedSubstring);
  });
});

describe("D. Navigation & validation — functional + error handling", () => {
  test("clicking Next without selecting an option shows an alert and does NOT advance (error handling)", () => {
    const app = loadApp();
    app.startQuiz();
    const nextBtn = document.getElementById("next-btn");

    nextBtn.click();

    expect(window.alert).toHaveBeenCalledWith(
      "Please select an option before proceeding."
    );
    expect(app.state.currentQuestionIndex).toBe(0);
  });

  test("selecting an option then clicking Next advances to question 2 (functional)", () => {
    const app = loadApp();
    app.startQuiz();

    const firstOption = document.querySelector(".option-item");
    firstOption.click();
    document.getElementById("next-btn").click();

    expect(app.state.currentQuestionIndex).toBe(1);
    expect(document.getElementById("progress-label").textContent).toBe(
      `Question 2 of ${require("../questions.js").quizQuestions.length}`
    );
  });

  test("Previous button is disabled on the first question (edge case)", () => {
    const app = loadApp();
    app.startQuiz();
    expect(document.getElementById("prev-btn").disabled).toBe(true);
  });

  test("Previous button restores the previously selected answer highlight (functional)", () => {
    const app = loadApp();
    app.startQuiz();

    document.querySelectorAll(".option-item")[2].click(); // pick option C
    document.getElementById("next-btn").click(); // -> question 2
    document.getElementById("prev-btn").click(); // -> back to question 1

    const options = document.querySelectorAll(".option-item");
    expect(options[2].classList.contains("selected")).toBe(true);
  });

  test("last question's Next button is relabeled 'Submit Quiz' (functional)", () => {
    const app = loadApp();
    app.startQuiz();
    const { quizQuestions } = require("../questions.js");
    app.state.currentQuestionIndex = quizQuestions.length - 1;
    app.renderQuestion();

    expect(document.getElementById("next-btn").textContent).toBe("Submit Quiz");
  });
});

describe("E. Timer — functional + edge cases", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test("timer starts at 20 seconds for a freshly rendered question", () => {
    const app = loadApp();
    app.startQuiz();
    expect(app.state.timeLeft).toBe(app.TIME_PER_QUESTION);
    expect(document.getElementById("timer-display").textContent).toBe("20");
  });

  test("timer counts down by 1 every second (functional)", () => {
    const app = loadApp();
    app.startQuiz();

    jest.advanceTimersByTime(3000); // simulate 3 seconds passing

    expect(app.state.timeLeft).toBe(17);
    expect(document.getElementById("timer-display").textContent).toBe("17");
  });

  test("when time runs out with no answer selected, the app auto-advances (edge case)", () => {
    const app = loadApp();
    app.startQuiz();

    jest.advanceTimersByTime(20000); // full 20 seconds elapse

    // Should have moved on to question 2 WITHOUT an alert being shown,
    // even though no option was selected — this is intentional per the
    // requirement "Automatically move to the next question if time expires."
    expect(app.state.currentQuestionIndex).toBe(1);
    expect(window.alert).not.toHaveBeenCalled();
  });
});

describe("F. renderReview — functional + edge cases", () => {
  test("marks a correctly-answered question with the 'user-correct' class", () => {
    const app = loadApp();
    app.startQuiz();
    const { quizQuestions } = require("../questions.js");
    app.state.userAnswers[0] = quizQuestions[0].correctIndex;

    app.renderReview();

    const firstReviewItem = document.querySelector(".review-item");
    expect(firstReviewItem.querySelector(".user-correct")).not.toBeNull();
    expect(firstReviewItem.querySelector(".correct-reveal")).toBeNull();
  });

  test("marks an incorrectly-answered question red AND reveals the correct answer", () => {
    const app = loadApp();
    app.startQuiz();
    const { quizQuestions } = require("../questions.js");
    app.state.userAnswers[0] = (quizQuestions[0].correctIndex + 1) % 4;

    app.renderReview();

    const firstReviewItem = document.querySelector(".review-item");
    expect(firstReviewItem.querySelector(".user-wrong")).not.toBeNull();
    expect(firstReviewItem.querySelector(".correct-reveal")).not.toBeNull();
  });

  test("an unanswered question is labeled 'No answer selected' (edge case)", () => {
    const app = loadApp();
    app.startQuiz(); // userAnswers all null by default

    app.renderReview();

    const firstReviewItem = document.querySelector(".review-item");
    expect(firstReviewItem.textContent).toContain("No answer selected");
  });
});
