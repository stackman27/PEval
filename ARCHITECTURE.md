# AI Coach / Challenge Mode Architecture

## 🎓 Overview

This application implements an **AI Coach / Challenge Mode** that teaches topics step-by-step and then quizzes users interactively with feedback. It transforms the chatbot from a simple Q&A tool into an interactive learning assistant.

## 🏗️ Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE (React)                    │
│  - Mode Toggle (Chat vs Learn)                              │
│  - Lesson Display Component                                  │
│  - Quiz Component (Multiple Question Types)                 │
│  - Results & Progress Display                                │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/JSON
                        ↓
┌─────────────────────────────────────────────────────────────┐
│              BACKEND API SERVER (Flask/Python)              │
│  - Request Routing & Orchestration                           │
│  - Session Management                                        │
│  - Prompt Engineering                                        │
│  - State Management                                          │
└───────────────────────┬─────────────────────────────────────┘
                        │ API Calls
                        ↓
┌─────────────────────────────────────────────────────────────┐
│              AI LOGIC & LLM CALLS (OpenAI GPT)              │
│  - Lesson Generation                                         │
│  - Quiz Question Generation                                  │
│  - Answer Evaluation & Feedback                             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────────┐
│         STATE STORE (In-Memory Session Manager)             │
│  - Learning Sessions                                         │
│  - Lesson Content                                            │
│  - Quiz Questions & Answers                                  │
│  - Scores & Progress                                         │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Component Breakdown

### 1. Frontend Layer (React + Chakra UI)

**Location:** `react-frontend/src/`

**Key Components:**
- **App.js** - Main application orchestrator
  - Manages mode switching (Chat vs Learn)
  - Detects `/learn` commands
  - Coordinates lesson and quiz flow

- **Lesson Component** (`components/Lesson/Lesson.js`)
  - Displays structured lesson content
  - "Start Quiz" button to transition to quiz mode

- **Quiz Component** (`components/Quiz/Quiz.js`)
  - Supports multiple question types:
    - Multiple Choice
    - True/False
    - Fill in the Blank
    - Short Answer
  - Shows feedback after each answer
  - Progress indicator

- **QuizResults Component** (`components/QuizResults/QuizResults.js`)
  - Displays final score and percentage
  - Options to retake quiz or learn new topic

**API Functions** (`apiUtils.js`):
- `startLearning(apiEndpoint, topic)` - Start a learning session
- `startQuiz(apiEndpoint, sessionId)` - Generate quiz questions
- `submitAnswer(apiEndpoint, sessionId, answer, questionIndex)` - Check answer
- `getNextQuestion(apiEndpoint, sessionId)` - Get next quiz question
- `getProgress(apiEndpoint, sessionId)` - Get session progress

### 2. Backend Layer (Flask/Python)

**Location:** `python-server/`

**Main Application** (`main.py`):
- Flask REST API server
- CORS enabled for frontend communication
- Routes for learning/quiz functionality

**API Endpoints:**

1. **POST `/api/learn`**
   - Starts a learning session
   - Generates lesson content using LLM
   - Returns session ID and lesson content
   - **Request:** `{ "topic": "HTTP basics" }`
   - **Response:** `{ "session_id": "...", "lesson_content": "...", "status": "teaching" }`

2. **POST `/api/quiz/start`**
   - Generates quiz questions based on lesson
   - **Request:** `{ "session_id": "..." }`
   - **Response:** `{ "questions": [...], "total_questions": 5 }`

3. **POST `/api/quiz/answer`**
   - Submits user answer for evaluation
   - Returns feedback (correct/incorrect + explanation)
   - **Request:** `{ "session_id": "...", "answer": "...", "question_index": 0 }`
   - **Response:** `{ "feedback": {...}, "is_correct": true/false, "is_complete": false }`

4. **POST `/api/quiz/next`**
   - Gets the next question in the quiz
   - **Request:** `{ "session_id": "..." }`
   - **Response:** `{ "question": {...}, "question_index": 1 }`

5. **GET `/api/learn/progress/<session_id>`**
   - Retrieves session progress and state

### 3. Learning Session Manager

**Location:** `python-server/my_module/learning_session.py`

**Classes:**

- **`LearningSession`**
  - Manages individual learning session state
  - Stores: topic, lesson content, quiz questions, answers, scores
  - Tracks status: "teaching", "quiz", "completed"

- **`LearningSessionManager`**
  - Manages multiple sessions
  - Generates lessons using LLM
  - Generates quiz questions
  - Evaluates answers (with LLM fallback for open-ended)

**Key Methods:**

1. **`generate_lesson(topic)`**
   - Creates structured teaching prompt
   - Calls GPT to generate lesson content
   - Returns formatted lesson text

2. **`generate_quiz_questions(topic, lesson_content, num_questions)`**
   - Creates quiz generation prompt
   - Parses JSON response from LLM
   - Falls back to text parsing if JSON fails
   - Returns array of question objects

3. **`check_answer(question, user_answer)`**
   - Evaluates answer based on question type
   - For multiple choice/true-false: direct comparison
   - For open-ended: uses LLM to evaluate
   - Returns feedback with explanation

### 4. AI/LLM Integration

**Location:** `python-server/my_module/gpt_wrapper.py`

- Uses OpenAI GPT-3.5 Turbo API
- Handles streaming responses for chat
- Handles regular API calls for learning/quiz
- Error handling and retries

**Prompt Engineering:**

1. **Teaching Prompt:**
   ```
   "You are an expert teacher. Teach the topic '{topic}' in a clear, structured way.
   Break down into simple chunks, provide examples, use clear language."
   ```

2. **Quiz Generation Prompt:**
   ```
   "Generate {num} quiz questions based on the lesson.
   Include question type, options, correct answer, and explanation."
   ```

3. **Answer Evaluation Prompt:**
   ```
   "Evaluate if the student's answer is correct.
   Consider key concepts, accuracy, completeness."
   ```

## 🔄 Data Flow

### Learning Flow:

```
User types: "/learn HTTP basics"
    ↓
Frontend detects command → calls startLearning()
    ↓
Backend receives POST /api/learn
    ↓
LearningSessionManager.generate_lesson("HTTP basics")
    ↓
LLM generates structured lesson
    ↓
Backend creates session, stores lesson
    ↓
Frontend displays Lesson component
    ↓
User clicks "Start Quiz"
    ↓
Frontend calls startQuiz()
    ↓
Backend generates quiz questions from lesson
    ↓
Frontend displays Quiz component with questions
    ↓
User submits answer
    ↓
Backend evaluates answer, provides feedback
    ↓
Frontend shows feedback, moves to next question
    ↓
After all questions: QuizResults component shows final score
```

### Question Types Supported:

1. **Multiple Choice** - Radio buttons with options
2. **True/False** - Binary choice
3. **Fill in the Blank** - Text input
4. **Short Answer** - Textarea for longer answers

## 🗄️ State Management

**Session State (In-Memory):**
- Session ID (unique identifier)
- Topic being learned
- Lesson content (generated text)
- Quiz questions (array of question objects)
- User answers (array with feedback)
- Scores (array of 0-100)
- Current question index
- Status: "teaching" | "quiz" | "completed"

**Note:** Currently uses in-memory storage. For production, consider:
- Redis for session storage
- PostgreSQL for persistent progress
- MongoDB for flexible document storage

## 🎯 Key Features

1. **Mode Toggle** - Switch between Chat and Learn modes
2. **Command Detection** - `/learn [topic]` triggers learning mode
3. **Structured Lessons** - LLM generates well-formatted teaching content
4. **Interactive Quizzes** - Multiple question types with immediate feedback
5. **Progress Tracking** - Scores and completion status
6. **Adaptive Feedback** - Explanations for correct/incorrect answers

## 🚀 Future Enhancements

1. **Spaced Repetition** - Review topics at intervals
2. **Progress Persistence** - Save across sessions
3. **Adaptive Difficulty** - Adjust question difficulty based on performance
4. **Topic Mastery** - Track mastery levels
5. **Analytics Dashboard** - Learning analytics and insights
6. **Multi-topic Courses** - Structured curriculum
7. **Voice Interface** - Audio learning support

## 📝 Usage Example

```
User: /learn recursion

Bot: [Displays structured lesson about recursion]

User: [Clicks "Start Quiz"]

Bot: [Shows Question 1: "What is recursion mainly used for?"
      Options: A) Iteration, B) Function calling itself, C) Loops, D) Variables]

User: [Selects B]

Bot: [Shows: ✓ Correct! Explanation: Recursion is when a function calls itself...]

[Continues through all questions]

Bot: [Shows final results: 4/5 correct (80%)]
```

## 🔧 Technical Stack

- **Frontend:** React 18, Chakra UI, React Icons
- **Backend:** Flask (Python), Flask-CORS
- **AI:** OpenAI GPT-3.5 Turbo
- **State:** In-memory Python dictionaries (can be upgraded to Redis/DB)

## 📊 Architecture Benefits

1. **Separation of Concerns** - UI, API, AI logic, and state are separate
2. **Scalable** - Can add database, caching, multiple LLM providers
3. **Extensible** - Easy to add new question types, features
4. **Maintainable** - Clear component boundaries
5. **Testable** - Each layer can be tested independently
