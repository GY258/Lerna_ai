// Full React Frontend Codebase: Connected to FastAPI backend for quiz generation
// Assumes FastAPI running at http://localhost:8000

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate, useParams, Link } from "react-router-dom";
import './App.css';

const mockUser = {
  name: "John",
  role: "employee",
  id: "d33b2c44-baaa-4e43-b532-e82ecbe405d6"
};

function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (loggedInUser) => {
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        {user && <Header user={user} onLogout={handleLogout} />}
        <main className="mx-auto max-w-6xl px-4 py-8">
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/" element={user ? <Navigate to={`/${user.role}`} /> : <Navigate to="/login" />} />
            <Route path="/manager" element={user ? <ManagerView /> : <Navigate to="/login" />} />
            <Route path="/employee" element={user ? <EmployeeQuizList user={user} /> : <Navigate to="/login" />} />
            <Route path="/quiz/:id" element={user ? <QuizTaking user={user} /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function Header({ user, onLogout }) {
  return (
    <header className="border-b border-slate-200 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-600 text-white font-bold">L</div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">Lerna Training</h1>
            <p className="text-xs text-slate-500">Welcome, {user.name}</p>
          </div>
        </div>
        <nav className="flex items-center gap-2">
          <Link className="btn-ghost" to="/employee">Employee</Link>
          <Link className="btn-ghost" to="/manager">Manager</Link>
          <button className="btn-ghost" onClick={onLogout}>Logout</button>
        </nav>
      </div>
    </header>
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
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your Assigned Quizzes</h2>
          <p className="text-sm text-slate-500">Pick up where you left off.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quizzes.length === 0 ? (
          <div className="col-span-full">
            <div className="card flex items-center gap-3">
              <span className="pill">Empty</span>
              <p className="text-slate-600">No quizzes assigned yet.</p>
            </div>
          </div>
        ) : (
          quizzes.map((q) => (
            <button
              key={q.id}
              className="card text-left transition hover:-translate-y-0.5 hover:shadow-xl"
              onClick={() => navigate(`/quiz/${q.id}`)}
            >
              <div className="flex items-start justify-between gap-3">
                <strong className="text-slate-900">{q.sop_topic}</strong>
                <span className="pill">Quiz</span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{q.question}</p>
            </button>
          ))
        )}
      </div>
    </div>
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
  if (!quiz) return <p className="text-slate-600">Loading quiz…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{quiz.sop_topic}</h2>
        <button className="btn-ghost" onClick={() => navigate("/employee")}>
          ⬅ Back to list
        </button>
      </div>

      <div className="card">
        <p className="mb-3 font-medium text-slate-900">{quiz.question}</p>
        <p className="mb-4 text-sm text-slate-500 italic">
          Type: {quiz.type === "choice" ? "Multiple Choice" : "Written Response"}
        </p>
        {quiz.type === "choice" ? (
          <div className="space-y-2">
            {quiz.options?.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedAnswer(opt)}
                className={`w-full rounded-xl border px-3 py-2 text-left transition ${selectedAnswer === opt ? "border-sky-500 bg-sky-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <textarea
            className="textarea"
            rows={4}
            placeholder="Type your answer here…"
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
          />
        )}

        <div className="mt-4 flex gap-2">
          <button onClick={handleSubmit} className="btn-success">Submit</button>
          <button className="btn-secondary" onClick={() => navigate("/employee")}>Cancel</button>
        </div>

        {submitted && (
          <div className="mt-4 rounded-xl border p-3">
            {correct ? (
              <p className="font-semibold text-emerald-600">✅ Correct!</p>
            ) : (
              <p className="font-semibold text-rose-600">❌ Incorrect. Try again or review SOP.</p>
            )}
            <p className="mt-1 text-sm text-slate-600">Your score: {score}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="card mb-6">
    <h2 className="mb-2 text-xl font-semibold">{title}</h2>
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
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Assign SOPs & Quizzes</h2>
            <p className="text-sm text-slate-500">Paste SOP text to generate smart quizzes.</p>
          </div>
        </div>
        <AssignTraining />
      </div>

      <Section title="Team Quiz Submissions">
        <SubmissionTable submissions={submissions} />
      </Section>

      <Section title="Individual Learning Status">
        <div className="mb-3 flex gap-2">
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter user ID"
            className="input"
          />
          <button onClick={fetchUserReport} className="btn-primary">Check</button>
        </div>
        {userReport && (
          <div className="rounded-xl border bg-slate-50 p-4">
            <h3 className="mb-1 font-bold">{userReport.name}</h3>
            <p className="whitespace-pre-line text-sm text-slate-700">{userReport.summary}</p>
          </div>
        )}
      </Section>
    </div>
  );
};

const SubmissionTable = ({ submissions }) => {
  if (!submissions || submissions.length === 0) return <p className="text-slate-600">No submissions found.</p>;

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="min-w-full bg-white text-left text-sm">
        <thead>
          <tr className="bg-slate-50 text-slate-600">
            <th className="py-2 px-4">User</th>
            <th className="py-2 px-4">Topic</th>
            <th className="py-2 px-4">Question</th>
            <th className="py-2 px-4">Answer</th>
            <th className="py-2 px-4">Correct</th>
            <th className="py-2 px-4">Answered At</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s, idx) => (
            <tr key={idx} className="border-t hover:bg-slate-50">
              <td className="py-2 px-4">{s.users.name}</td>
              <td className="py-2 px-4">{s.quizzes.sop_topic}</td>
              <td className="py-2 px-4">{s.quizzes.question}</td>
              <td className="py-2 px-4">{s.answer}</td>
              <td className="py-2 px-4">
                {s.is_correct ? (
                  <span className="text-emerald-600 font-bold">✔</span>
                ) : (
                  <span className="text-rose-500 font-bold">✘</span>
                )}
              </td>
              <td className="py-2 px-4 text-xs text-slate-500">{new Date(s.answered_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

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
    <div className="space-y-4">
      <textarea
        className="textarea"
        rows={5}
        placeholder="Paste SOP here…"
        value={sopText}
        onChange={(e) => setSopText(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <button
          onClick={generateQuiz}
          className="btn-primary"
          disabled={loading || !sopText}
        >
          {loading ? "Generating…" : "Generate Quiz"}
        </button>
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className="btn-warning"
        >
          {previewMode ? "Edit Mode" : "Preview Mode"}
        </button>
        <button
          onClick={saveQuiz}
          className="btn-success"
          disabled={quiz.length === 0}
        >
          Save Changes
        </button>
      </div>
      {quiz.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">{previewMode ? "Preview Quiz" : "Review & Edit Quiz"}</h3>
          {quiz.map((q, idx) => (
            <div key={idx} className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-lg font-medium">Question {idx + 1}</h4>
                <span className="pill">{q.type}</span>
              </div>
              <p className="mb-1 text-slate-700 font-semibold">{previewMode ? q.question : "Question:"}</p>
              {!previewMode ? (
                <input
                  className="input mb-2"
                  value={q.question}
                  onChange={(e) => handleChange(idx, "question", e.target.value)}
                />
              ) : (
                <p className="mb-2 text-slate-800">{q.question}</p>
              )}
              {q.options && Array.isArray(q.options) && q.options.length > 0 && (
                <div className="mb-2">
                  <p className="mb-1 text-sm font-medium text-slate-600">Options:</p>
                  {q.options.map((opt, i) => (
                    previewMode ? (
                      <p key={i} className="ml-2 text-slate-700">- {opt}</p>
                    ) : (
                      <input
                        key={i}
                        className="input mb-1"
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...q.options];
                          newOptions[i] = e.target.value;
                          handleChange(idx, "options", newOptions);
                        }}
                      />
                    )
                  ))}
                </div>
              )}
              <label className="mb-1 block text-sm font-medium text-slate-600">Answer:</label>
              {previewMode ? (
                <p className="text-slate-800">{q.answer}</p>
              ) : (
                <input
                  className="input mb-2"
                  value={q.answer}
                  placeholder="Correct answer"
                  onChange={(e) => handleChange(idx, "answer", e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Login = ({ onLogin }) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("employee");
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    if (!name || !userId) return;
    const user = { name, role, id: userId };
    onLogin(user);
    navigate(`/${role}`);
  };

  const fillDemoEmployee = () => {
    setName("John");
    setRole("employee");
    setUserId("d33b2c44-baaa-4e43-b532-e82ecbe405d6");
  };

  const fillDemoManager = () => {
    setName("Manager");
    setRole("manager");
    setUserId("manager-1");
  };

  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="card w-full max-w-md">
        <h2 className="mb-4 text-xl font-semibold">Sign in</h2>
        <form className="space-y-3" onSubmit={submit}>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Role</label>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">User ID</label>
            <input className="input" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Paste your user ID" />
            <p className="mt-1 text-xs text-slate-500">Use your assigned ID. For a quick demo, use the buttons below.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={fillDemoEmployee} className="btn-secondary">Demo Employee</button>
            <button type="button" onClick={fillDemoManager} className="btn-warning">Demo Manager</button>
          </div>
          <div className="pt-2">
            <button type="submit" className="btn-primary w-full">Continue</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;
