// Full React Frontend Codebase: Connected to FastAPI backend for quiz generation
// Assumes FastAPI running at http://localhost:8000

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate, useParams } from "react-router-dom";
import './App.css';

const mockUser = {
  name: "John",
  role: "employee", // change to "employee" to test employee view
  id: "d33b2c44-baaa-4e43-b532-e82ecbe405d6"
};

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setUser(mockUser);
    }, 500);
  }, []);

  if (!user) return <div className="p-4">Loading...</div>;

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-6">Welcome, {user.name}</h1>
        <Routes>
          <Route path="/" element={<Navigate to={`/${user.role}`} />} />
          <Route path="/manager" element={<ManagerView />} />
          <Route path="/employee" element={<EmployeeQuizList user={user} />} />
          <Route path="/quiz/:id" element={<QuizTaking user={user} />} />
        </Routes>
      </div>
    </Router>
  );
}


const EmployeeQuizList = ({ user }) => {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAssigned() {
      const res = await fetch(`http://localhost:8000/employee/quizzes/${user.id}`);
      const data = await res.json();
      setQuizzes(data);
    }
    fetchAssigned();
  }, [user.id]);

  return (
    <Section title="Your Assigned Quizzes">
      {quizzes.length === 0 ? (
        <p>No quizzes assigned.</p>
      ) : (
        <ul className="space-y-3">
          {quizzes.map((q) => (
            <li
              key={q.id}
              className="p-4 bg-gray-50 border rounded hover:bg-blue-50 cursor-pointer"
              onClick={() => navigate(`/quiz/${q.id}`)}
            >
              <strong>{q.sop_topic}</strong>
              <p className="text-sm text-gray-500">{q.question.slice(0, 60)}...</p>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
};

const QuizTaking = ({ user }) => {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [textAnswer, setTextAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(null);

  useEffect(() => {
    async function loadQuiz() {
      const res = await fetch(`http://localhost:8000/quiz/${id}`);
      const data = await res.json();
      console.log("Loaded quiz:", data);
      setQuiz(data);
    }
    loadQuiz();
  }, [id]);

  const handleSubmit = async () => {
    const answer = quiz.type === "choice" ? selectedAnswer : textAnswer;
    const res = await fetch(`http://localhost:8000/employee/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quiz_id: id,
        user_id: user.id,
        answer
      })
    });
    
    const data = await res.json();
    setSubmitted(true);
    setCorrect(data.correct);
    setScore(data.score);
  };
  const navigate = useNavigate();
  if (!quiz) return <p>Loading quiz...</p>;

  return (
    <Section title={`Quiz: ${quiz.sop_topic}`}>
      <p className="mb-4 font-medium">{quiz.question}</p>
      <p className="text-sm text-gray-500 italic mb-1">
        Type: {quiz.type === "choice" ? "Multiple Choice" : "Written Response"}
      </p>
      {quiz.type === "choice" ? (
        quiz.options?.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedAnswer(opt)}
            className={`block w-full text-left p-2 border rounded mb-1 ${selectedAnswer === opt ? "bg-blue-100" : "bg-white"}`}
          >
            {opt}
          </button>
        ))
      ) : (
        <textarea
          className="w-full p-2 border rounded mb-3"
          rows={3}
          placeholder="Type your answer here..."
          value={textAnswer}
          onChange={(e) => setTextAnswer(e.target.value)}
        />
      )}

      <button
        onClick={handleSubmit}
        className="mt-3 bg-green-600 text-white px-4 py-2 rounded"
      >
        Submit
      </button>
      <button
            className="mt-3 bg-gray-600 text-white px-4 py-2 rounded"
            onClick={() => navigate("/employee")}
      >
            ⬅️ Return to Quiz List
      </button>
      {submitted && (
        <div className="mt-3">
          {correct ? (
            <p className="text-green-600 font-bold">✅ Correct!</p>
          ) : (
            <p className="text-red-500 font-bold">❌ Incorrect. Try again or review SOP.</p>
          )}
          <p className="text-sm mt-1">Your score: {score}</p>

          
        </div>
      )}
    </Section>
  );
};

const Section = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow p-6 mb-4">
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    {children}
  </div>
);

const ManagerView = () => {
  const [submissions, setSubmissions] = useState([]);
  const [userId, setUserId] = useState("");
  const [userReport, setUserReport] = useState(null);

  useEffect(() => {
    async function fetchSubmissions() {
      const res = await fetch("http://localhost:8000/manager/progress");
      const data = await res.json();
      setSubmissions(data);
    }
    fetchSubmissions();
  }, []);

  const fetchUserReport = async () => {
    if (!userId) return;
    const res = await fetch(`http://localhost:8000/manager/report/${userId}`);
    const data = await res.json();
    setUserReport(data);
  };


  return (
    <div>
      <Section title="Assign SOPs & Quizzes">
        <AssignTraining />
      </Section>
      <Section title="Team Quiz Submissions">
        <SubmissionTable submissions={submissions} />
      </Section>
      <Section title="Individual Learning Status">
        <div className="flex gap-2 mb-2">
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter user ID"
            className="border px-2 py-1 rounded"
          />
          <button onClick={fetchUserReport} className="bg-blue-600 text-white px-3 py-1 rounded">Check</button>
        </div>
        {userReport && (
          <div className="p-3 border rounded bg-gray-50">
            <h3 className="font-bold mb-1">{userReport.name}</h3>
            <p className="text-sm whitespace-pre-line">{userReport.summary}</p>
          </div>
        )}
      </Section>
    
    </div>
  );

};


const SubmissionTable = ({ submissions }) => {
  if (!submissions || submissions.length === 0) return <p>No submissions found.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b">User</th>
            <th className="py-2 px-4 border-b">Topic</th>
            <th className="py-2 px-4 border-b">Question</th>
            <th className="py-2 px-4 border-b">Answer</th>
            <th className="py-2 px-4 border-b">Correct</th>
            <th className="py-2 px-4 border-b">Answered At</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s, idx) => (
            <tr key={idx} className="border-t hover:bg-gray-50">
              <td className="py-2 px-4">{s.users.name}</td>
              <td className="py-2 px-4">{s.quizzes.sop_topic}</td>
              <td className="py-2 px-4">{s.quizzes.question}</td>
              <td className="py-2 px-4">{s.answer}</td>
              <td className="py-2 px-4">
                {s.is_correct ? (
                  <span className="text-green-600 font-bold">✔</span>
                ) : (
                  <span className="text-red-500 font-bold">✘</span>
                )}
              </td>
              <td className="py-2 px-4 text-sm text-gray-500">{new Date(s.answered_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


const EmployeeView = () => (
  <div>
    <Section title="Today’s Tasks">
      <p>View assigned SOPs and quizzes</p>
      <AssignTraining />
    </Section>
    <Section title="Take Quiz">
      <QuizTaking />
    </Section>
    <Section title="Training Progress">
      <p>Track your performance and history.</p>
    </Section>
  </div>
);

const AssignTraining = () => {
  const [sopText, setSopText] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const generateQuiz = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sop_text: sopText }),
      });

      if (!res.ok) throw new Error("Failed to generate quiz");

      const data = await res.json();
      setQuiz(data);
    } catch (error) {
      console.error("Error generating quiz:", error);
      alert("Error generating quiz. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const saveQuiz = async () => {
    try {
      const res = await fetch("http://localhost:8000/quiz/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quiz }),
      });
      if (!res.ok) throw new Error("Failed to save quiz");
      alert("✅ Quiz saved successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Error saving quiz.");
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...quiz];
    updated[index][field] = value;
    setQuiz(updated);
  };

  return (
    <div>
      <textarea
        className="w-full p-2 border rounded mb-2"
        rows={4}
        placeholder="Paste SOP here..."
        value={sopText}
        onChange={(e) => setSopText(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          onClick={generateQuiz}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading || !sopText}
        >
          {loading ? "Generating..." : "Generate Quiz"}
        </button>
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          {previewMode ? "Edit Mode" : "Preview Mode"}
        </button>
        <button
          onClick={saveQuiz}
          className="bg-green-600 text-white px-4 py-2 rounded"
          disabled={quiz.length === 0}
        >
          Save Changes
        </button>
      </div>
      {quiz.length > 0 && (
        <div className="mt-6 space-y-6">
          <h3 className="text-xl font-semibold mb-2">{previewMode ? "Preview Quiz" : "Review & Edit Quiz"}</h3>
          {quiz.map((q, idx) => (
            <div key={idx} className="bg-white p-4 shadow rounded-xl">
              <h4 className="text-lg font-medium mb-2">Question {idx + 1}</h4>
              <p className="text-gray-700 font-semibold mb-1">{previewMode ? q.question : "Question:"}</p>
              {!previewMode ? (
                <input
                  className="w-full p-2 mb-2 border rounded"
                  value={q.question}
                  onChange={(e) => handleChange(idx, "question", e.target.value)}
                />
              ) : (
                <p className="mb-2">{q.question}</p>
              )}
              {q.options && Array.isArray(q.options) && q.options.length > 0 && (
                <>
                  <p className="text-sm font-medium text-gray-600 mb-1">Options:</p>
                  {q.options.map((opt, i) => (
                    previewMode ? (
                      <p key={i} className="ml-2">- {opt}</p>
                    ) : (
                      <input
                        key={i}
                        className="w-full p-1 mb-1 border rounded"
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...q.options];
                          newOptions[i] = e.target.value;
                          handleChange(idx, "options", newOptions);
                        }}
                      />
                    )
                  ))}
                </>
              )}
              <label className="block text-sm font-medium text-gray-600 mt-2">Answer:</label>
              {previewMode ? (
                <p>{q.answer}</p>
              ) : (
                <input
                  className="w-full p-2 mb-2 border rounded"
                  value={q.answer}
                  placeholder="Correct answer"
                  onChange={(e) => handleChange(idx, "answer", e.target.value)}
                />
              )}
              <p className="text-xs text-gray-500">Type: {q.type}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


export default App;
