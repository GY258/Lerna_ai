// Full React Frontend Codebase for Role-Based LLM Training Platform
// Structure: App + ManagerView + EmployeeView + Quiz UI + Routing + API example
// You can use Vite or Create React App to bootstrap the project

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import './App.css'; // Tailwind should be configured here

const mockUser = {
  name: "Gary",
  role: "manager", // Change to 'employee' to test
};

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Simulate auth fetch
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
          <Route path="/employee" element={<EmployeeView />} />
        </Routes>
      </div>
    </Router>
  );
}

const Section = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow p-6 mb-4">
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    {children}
  </div>
);

const ManagerView = () => (
  <div>
    <Section title="Team Overview">
      <p>Completion rates, performance analytics...</p>
    </Section>
    <Section title="Assign SOPs & Quizzes">
      <AssignTraining />
    </Section>
    <Section title="Review Content">
      <p>Preview and edit AI-generated quizzes.</p>
    </Section>
  </div>
);

const EmployeeView = () => (
  <div>
    <Section title="Today’s Tasks">
      <p>View assigned SOPs and quizzes</p>
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
  const [quiz, setQuiz] = useState(null);

  const generateQuiz = async () => {
    const res = await fetch("/api/generate_quiz/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sop_text: sopText })
    });
    const data = await res.json();
    setQuiz(data);
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
      <button
        onClick={generateQuiz}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Generate Quiz
      </button>
      {quiz && <pre className="mt-2 bg-gray-100 p-2 text-sm">{JSON.stringify(quiz, null, 2)}</pre>}
    </div>
  );
};

const QuizTaking = () => {
  const sampleQuiz = {
    question: "藕块改刀的标准尺寸是多少？",
    options: ["1cm*1cm", "2.5cm*3cm", "3cm*4cm", "2cm*2cm"],
    answer: "2.5cm*3cm",
  };
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div>
      <p className="mb-2 font-medium">{sampleQuiz.question}</p>
      <div className="space-y-2">
        {sampleQuiz.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => setSelected(opt)}
            className={`block w-full text-left p-2 rounded border ${selected === opt ? "bg-blue-100" : "bg-white"}`}
          >
            {opt}
          </button>
        ))}
      </div>
      <button
        onClick={() => setSubmitted(true)}
        className="mt-3 bg-green-500 text-white px-4 py-2 rounded"
      >
        Submit
      </button>
      {submitted && (
        <div className="mt-2 text-sm">
          {selected === sampleQuiz.answer ? "✅ Correct!" : "❌ Wrong. Correct: " + sampleQuiz.answer}
        </div>
      )}
    </div>
  );
};

export default App;
