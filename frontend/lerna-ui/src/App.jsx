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
  const [activeLearningTab, setActiveLearningTab] = useState("quizzes");
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
      {/* Learning Tabs */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Learning Dashboard</h2>
          <p className="text-sm text-slate-500">Choose your learning path.</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        <button
          onClick={() => setActiveLearningTab("quizzes")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
            activeLearningTab === "quizzes"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          📝 Assigned Quizzes
        </button>
        <button
          onClick={() => setActiveLearningTab("ai-testing")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
            activeLearningTab === "ai-testing"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          🤖 AI Testing
        </button>
        <button
          onClick={() => setActiveLearningTab("ai-roleplay")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
            activeLearningTab === "ai-roleplay"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          🎭 AI Role Play Training
        </button>
      </div>

      {/* Quizzes Tab */}
      {activeLearningTab === "quizzes" && (
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
      )}

      {/* AI Testing Tab */}
      {activeLearningTab === "ai-testing" && (
        <RoleplayTraining user={user} />
      )}

      {/* AI Role Play Training Tab */}
      {activeLearningTab === "ai-roleplay" && (
        <AIRolePlayTraining user={user} />
      )}
    </div>
  );
};

const RoleplayTraining = ({ user }) => {
  const [testHistory, setTestHistory] = useState([]);
  const [conversation, setConversation] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  const topics = [
    { id: "customer-service", name: "Customer Service", icon: "👥" },
    { id: "food-safety", name: "Food Safety", icon: "🛡️" },
    { id: "menu-knowledge", name: "Menu Knowledge", icon: "📋" },
    { id: "teamwork", name: "Teamwork", icon: "🤝" },
    { id: "problem-solving", name: "Problem Solving", icon: "🧩" }
  ];

  const saveToTestHistory = (session) => {
    setTestHistory(prev => [session, ...prev]);
  };

  const loadTestSession = (session) => {
    setConversation(session.conversation);
    setSelectedTopic(session.topic);
    setActiveTab("active");
  };

  const startNewSession = () => {
    setConversation([]);
    setUserInput("");
    setSelectedTopic("");
    setActiveTab("active");
  };

  const sendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage = { role: "user", content: userInput };
    setConversation(prev => [...prev, userMessage]);
    setUserInput("");
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/ai-training/roleplay-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInput,
          user_role: user.role,
          conversation_history: conversation,
          test_history: testHistory.slice(0, 5) // Send last 5 sessions
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = { role: "assistant", content: data.response };
        setConversation(prev => [...prev, aiMessage]);

        // Save session if it's the first exchange
        if (conversation.length === 0) {
          const testSession = {
            id: Date.now(),
            topic: selectedTopic,
            conversation: [userMessage, aiMessage],
            timestamp: new Date().toISOString()
          };
          saveToTestHistory(testSession);
        }
      } else {
        const errorMessage = { role: "assistant", content: "抱歉，我遇到了一些问题。请稍后再试。" };
        setConversation(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { role: "assistant", content: "抱歉，连接出现问题。请检查网络连接后重试。" };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">🤖 AI Testing</h3>
            <p className="text-sm text-slate-500">Test your skills with AI-generated scenarios and assessments</p>
          </div>
        </div>
      </div>

      {/* Topic Selection */}
      {!selectedTopic && (
        <div className="card">
          <h4 className="mb-4 font-medium text-slate-900">Choose a topic to test</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {topics.map(topic => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors text-left"
              >
                <div className="text-2xl mb-2">{topic.icon}</div>
                <div className="font-medium text-slate-900">{topic.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Interface */}
      {selectedTopic && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-slate-900">AI Testing Assistant</h4>
            <button
              onClick={startNewSession}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              New Session
            </button>
          </div>

          {conversation.length === 0 && (
            <div className="text-center py-8 text-slate-600">
              <p className="mb-2">I'm your AI testing assistant for skill assessment scenarios.</p>
              <p className="text-sm">Start by describing what you'd like to test, or try these examples:</p>
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => setUserInput("test my food safety handling skills")}
                  className="block w-full p-2 text-sm border border-slate-200 rounded hover:bg-slate-50"
                >
                  Test my food safety handling skills
                </button>
                <button
                  onClick={() => setUserInput("assess my customer service approach")}
                  className="block w-full p-2 text-sm border border-slate-200 rounded hover:bg-slate-50"
                >
                  Assess my customer service approach
                </button>
              </div>
            </div>
          )}

          {/* Conversation History */}
          <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
            {conversation.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 text-slate-900 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent"></div>
                    Thinking...
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Describe what you want to test..."
              className="flex-1 input"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !userInput.trim()}
              className="btn-primary"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Test History */}
      {testHistory.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-slate-900">Your Test History</h4>
            <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
              <button
                onClick={() => setActiveTab("active")}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === "active"
                    ? "bg-white text-slate-900"
                    : "text-slate-600"
                }`}
              >
                Active Testing
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === "history"
                    ? "bg-white text-slate-900"
                    : "text-slate-600"
                }`}
              >
                Test History
              </button>
            </div>
          </div>

          {activeTab === "active" && (
            <div className="text-center py-4 text-slate-600">
              <p>Continue your current test session or start a new one.</p>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-3">
              {testHistory.map((session) => (
                <div
                  key={session.id}
                  className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                  onClick={() => loadTestSession(session)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">
                        {topics.find(t => t.id === session.topic)?.name || session.topic}
                      </p>
                      <p className="text-sm text-slate-500">
                        {new Date(session.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <button className="text-sm text-sky-600 hover:text-sky-700">
                      Load Session
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AIRolePlayTraining = ({ user }) => {
  const [conversation, setConversation] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  const scenarios = [
    { 
      id: "customer-complaint", 
      name: "Customer Complaint Handling", 
      icon: "😤",
      description: "Handle difficult customer complaints professionally"
    },
    { 
      id: "food-safety-issue", 
      name: "Food Safety Issue", 
      icon: "🛡️",
      description: "Respond to food safety concerns and incidents"
    },
    { 
      id: "team-conflict", 
      name: "Team Conflict Resolution", 
      icon: "🤝",
      description: "Resolve conflicts between team members"
    },
    { 
      id: "rush-hour-pressure", 
      name: "Rush Hour Pressure", 
      icon: "⏰",
      description: "Manage high-pressure situations during busy hours"
    },
    { 
      id: "menu-recommendation", 
      name: "Menu Recommendation", 
      icon: "🍽️",
      description: "Provide excellent menu recommendations to customers"
    },
    { 
      id: "emergency-situation", 
      name: "Emergency Situation", 
      icon: "🚨",
      description: "Handle emergency situations calmly and effectively"
    }
  ];

  const startNewScenario = () => {
    setConversation([]);
    setUserInput("");
    setSelectedScenario("");
    setFeedback("");
    setShowFeedback(false);
  };

  const requestFeedback = async () => {
    if (conversation.length === 0) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/ai-training/roleplay-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_id: selectedScenario,
          user_response: conversation.map(msg => `${msg.role}: ${msg.content}`).join('\n'),
          user_role: user.role,
          scenario_history: []
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback || data.response || "Great job! Keep practicing to improve your skills.");
        setShowFeedback(true);
      } else {
        setFeedback("抱歉，无法获取反馈。请稍后再试。");
        setShowFeedback(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setFeedback("抱歉，连接出现问题。请检查网络连接后重试。");
      setShowFeedback(true);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage = { role: "user", content: userInput };
    setConversation(prev => [...prev, userMessage]);
    setUserInput("");
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/ai-training/roleplay-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInput,
          user_role: user.role,
          conversation_history: conversation,
          test_history: []
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = { role: "assistant", content: data.response };
        setConversation(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = { role: "assistant", content: "抱歉，我遇到了一些问题。请稍后再试。" };
        setConversation(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { role: "assistant", content: "抱歉，连接出现问题。请检查网络连接后重试。" };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">🎭 AI Role Play Training</h3>
            <p className="text-sm text-slate-500">Practice real-world scenarios with AI and get personalized feedback</p>
          </div>
        </div>
      </div>

      {/* Scenario Selection */}
      {!selectedScenario && (
        <div className="card">
          <h4 className="mb-4 font-medium text-slate-900">Choose a training scenario</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenarios.map(scenario => (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
                className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{scenario.icon}</div>
                  <div>
                    <div className="font-medium text-slate-900">{scenario.name}</div>
                    <div className="text-sm text-slate-600">{scenario.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Role Play Interface */}
      {selectedScenario && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium text-slate-900">
                {scenarios.find(s => s.id === selectedScenario)?.name}
              </h4>
              <p className="text-sm text-slate-500">
                {scenarios.find(s => s.id === selectedScenario)?.description}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={requestFeedback}
                disabled={conversation.length === 0 || isLoading}
                className="btn-secondary text-sm"
              >
                Get Feedback
              </button>
              <button
                onClick={startNewScenario}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                New Scenario
              </button>
            </div>
          </div>

          {conversation.length === 0 && (
            <div className="text-center py-8 text-slate-600">
              <p className="mb-2">Welcome to your role play training session!</p>
              <p className="text-sm">Start the conversation by responding to the scenario. The AI will guide you through the situation.</p>
              <div className="mt-4">
                <button
                  onClick={() => setUserInput("I'm ready to start the role play scenario")}
                  className="btn-primary"
                >
                  Start Role Play
                </button>
              </div>
            </div>
          )}

          {/* Conversation History */}
          <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
            {conversation.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 text-slate-900 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent"></div>
                    AI is responding...
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your response to the scenario..."
              className="flex-1 input"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !userInput.trim()}
              className="btn-primary"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Feedback Section */}
      {showFeedback && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-slate-900">Training Feedback</h4>
            <button
              onClick={() => setShowFeedback(false)}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Close
            </button>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="prose prose-sm max-w-none">
              {feedback.split('\n').map((line, index) => (
                <p key={index} className="mb-2">{line}</p>
              ))}
            </div>
          </div>
        </div>
      )}
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
