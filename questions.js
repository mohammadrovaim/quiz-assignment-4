/* ==========================================================================
   questions.js
   --------------------------------------------------------------------------
   This file stores all the quiz data in one place.
   Each question is an object with:
     - question     : the text shown to the user
     - options      : an array of exactly 4 possible answers
     - correctIndex : the index (0-3) inside "options" that is correct

   Keeping the questions separate from the app logic (script.js) makes the
   project easier to maintain -> to add/remove/edit a question, you only
   need to touch this file.
   ========================================================================== */

const quizQuestions = [
  {
    question: "What does HTML stand for?",
    options: [
      "Hyper Trainer Marking Language",
      "HyperText Markup Language",
      "Hyperlinks and Text Markup Language",
      "Home Tool Markup Language"
    ],
    correctIndex: 1
  },
  {
    question: "Which data structure uses LIFO (Last In, First Out) order?",
    options: ["Queue", "Stack", "Linked List", "Tree"],
    correctIndex: 1
  },
  {
    question: "What is the time complexity of binary search on a sorted array of n elements?",
    options: ["O(n)", "O(n log n)", "O(log n)", "O(1)"],
    correctIndex: 2
  },
  {
    question: "Which of the following is NOT a programming paradigm?",
    options: ["Object-Oriented", "Functional", "Procedural", "Alphabetical"],
    correctIndex: 3
  },
  {
    question: "In JavaScript, which keyword is used to declare a variable that cannot be reassigned?",
    options: ["var", "let", "const", "static"],
    correctIndex: 2
  },
  {
    question: "What does SQL stand for?",
    options: [
      "Structured Query Language",
      "Simple Query Language",
      "Sequential Query Language",
      "Standard Query Logic"
    ],
    correctIndex: 0
  },
  {
    question: "Which sorting algorithm has the best average-case time complexity?",
    options: ["Bubble Sort", "Selection Sort", "Quick Sort", "Insertion Sort"],
    correctIndex: 2
  },
  {
    question: "What is the main purpose of a compiler?",
    options: [
      "To run a program directly line by line",
      "To translate source code into machine code before execution",
      "To design the user interface",
      "To manage computer memory only"
    ],
    correctIndex: 1
  },
  {
    question: "Which of these is a valid way to comment a single line in JavaScript?",
    options: ["<!-- comment -->", "# comment", "// comment", "** comment **"],
    correctIndex: 2
  },
  {
    question: "What does 'OOP' stand for?",
    options: [
      "Object-Oriented Programming",
      "Order Of Precedence",
      "Open Operating Protocol",
      "Output Oriented Programming"
    ],
    correctIndex: 0
  },
  {
    question: "Which HTTP method is typically used to request data from a server without modifying it?",
    options: ["POST", "GET", "DELETE", "PUT"],
    correctIndex: 1
  },
  {
    question: "In CSS, which property is used to change the text color of an element?",
    options: ["font-color", "text-style", "color", "background-color"],
    correctIndex: 2
  },
  {
    question: "What is a 'variable' in programming?",
    options: [
      "A fixed value that never changes",
      "A named storage location that can hold data which may change",
      "A type of loop",
      "A function that returns nothing"
    ],
    correctIndex: 1
  },
  {
    question: "Which of the following is used to handle errors in JavaScript?",
    options: ["if / else", "for / while", "try / catch", "switch / case"],
    correctIndex: 2
  },
  {
    question: "What does 'API' stand for?",
    options: [
      "Application Programming Interface",
      "Advanced Programming Instruction",
      "Applied Program Integration",
      "Automated Process Interaction"
    ],
    correctIndex: 0
  },
  {
    question: "Which of these data types is immutable in Python?",
    options: ["list", "dictionary", "set", "tuple"],
    correctIndex: 3
  },
  {
    question: "What is the purpose of version control systems like Git?",
    options: [
      "To compile code faster",
      "To track and manage changes to source code over time",
      "To design database schemas",
      "To style web pages"
    ],
    correctIndex: 1
  }
];

// Node/Jest export guard (no effect in the browser — see script.js for the
// same pattern and explanation).
if (typeof module !== "undefined" && module.exports) {
  module.exports = { quizQuestions };
}
