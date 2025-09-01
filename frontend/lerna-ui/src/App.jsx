// Full React Frontend Codebase: Connected to FastAPI backend for quiz generation
// Assumes FastAPI running at http://localhost:8000

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate, useParams, Link } from "react-router-dom";
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { useTranslation } from './hooks/useTranslation';
import LanguageSwitcher from './components/LanguageSwitcher';
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
    <LanguageProvider>
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
    </LanguageProvider>
  );
}

function Header({ user, onLogout }) {
  const { t } = useTranslation();
  
  return (
    <header className="border-b border-slate-200 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-600 text-white font-bold">L</div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">{t('header.title')}</h1>
            <p className="text-xs text-slate-500">{t('header.welcome')}, {user.name}</p>
          </div>
        </div>
        <nav className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link className="btn-ghost" to="/employee">
            {user.role === "store_manager" ? "店长" : 
             user.role === "head_chef" ? "主厨" : 
             t('header.employee')}
          </Link>
          <Link className="btn-ghost" to="/manager">{t('header.manager')}</Link>
          <button className="btn-ghost" onClick={onLogout}>{t('header.logout')}</button>
        </nav>
      </div>
    </header>
  );
}

const EmployeeQuizList = ({ user }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [activeLearningTab, setActiveLearningTab] = useState("quizzes");
  const navigate = useNavigate();
  const { t } = useTranslation();

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
          <h2 className="text-2xl font-bold tracking-tight">
            {user.role === "store_manager" ? "店长培训中心" : 
             user.role === "head_chef" ? "主厨培训中心" : 
             t('employee.title')}
          </h2>
          <p className="text-sm text-slate-500">
            {user.role === "store_manager" ? "提升您的店长技能和领导能力" : 
             user.role === "head_chef" ? "提升您的主厨技能和管理能力" : 
             t('employee.subtitle')}
          </p>
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
          {t('employee.assignedQuizzes')}
        </button>
        <button
          onClick={() => setActiveLearningTab("ai-testing")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
            activeLearningTab === "ai-testing"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {t('employee.aiTesting')}
        </button>
        <button
          onClick={() => setActiveLearningTab("ai-roleplay")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
            activeLearningTab === "ai-roleplay"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {t('employee.aiRoleplay')}
        </button>
        <button
          onClick={() => setActiveLearningTab("case-study")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
            activeLearningTab === "case-study"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {t('employee.aiproblemstudy')}
        </button>
      </div>

      {/* Quizzes Tab */}
      {activeLearningTab === "quizzes" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.length === 0 ? (
            <div className="col-span-full">
              <div className="card flex items-center gap-3">
                <span className="pill">{t('employee.empty')}</span>
                <p className="text-slate-600">{t('employee.noQuizzes')}</p>
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

      {/* Problem-solving Case Study Tab */}
      {activeLearningTab === "case-study" && (
        <ProblemSolvingCaseStudy user={user} />
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
  const { t } = useTranslation();

  const topics = [
    { id: "customer-service", name: t('aiTesting.customerService'), icon: "👥" },
    { id: "food-safety", name: t('aiTesting.foodSafety'), icon: "🛡️" },
    { id: "menu-knowledge", name: t('aiTesting.menuKnowledge'), icon: "📋" },
    { id: "teamwork", name: t('aiTesting.teamwork'), icon: "🤝" },
    { id: "problem-solving", name: t('aiTesting.problemSolving'), icon: "🧩" }
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
        const errorMessage = { role: "assistant", content: t('errors.generalError') };
        setConversation(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { role: "assistant", content: t('errors.connectionError') };
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
            <h3 className="text-lg font-semibold text-slate-900">{t('aiTesting.title')}</h3>
            <p className="text-sm text-slate-500">{t('aiTesting.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Topic Selection */}
      {!selectedTopic && (
        <div className="card">
          <h4 className="mb-4 font-medium text-slate-900">{t('aiTesting.chooseTopic')}</h4>
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
            <h4 className="font-medium text-slate-900">{t('aiTesting.assistant')}</h4>
            <button
              onClick={startNewSession}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              {t('aiTesting.newSession')}
            </button>
          </div>

          {conversation.length === 0 && (
            <div className="text-center py-8 text-slate-600">
              <p className="mb-2">{t('aiTesting.welcomeMessage')}</p>
              <p className="text-sm">{t('aiTesting.startMessage')}</p>
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => setUserInput("test my food safety handling skills")}
                  className="block w-full p-2 text-sm border border-slate-200 rounded hover:bg-slate-50"
                >
                  {t('aiTesting.testFoodSafety')}
                </button>
                <button
                  onClick={() => setUserInput("assess my customer service approach")}
                  className="block w-full p-2 text-sm border border-slate-200 rounded hover:bg-slate-50"
                >
                  {t('aiTesting.assessCustomerService')}
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
                    {t('aiTesting.thinking')}
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
              placeholder={t('aiTesting.inputPlaceholder')}
              className="flex-1 input"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !userInput.trim()}
              className="btn-primary"
            >
              {t('aiTesting.send')}
            </button>
          </div>
        </div>
      )}

      {/* Test History */}
      {testHistory.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-slate-900">{t('aiTesting.testHistory')}</h4>
            <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
              <button
                onClick={() => setActiveTab("active")}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === "active"
                    ? "bg-white text-slate-900"
                    : "text-slate-600"
                }`}
              >
                {t('aiTesting.activeTesting')}
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === "history"
                    ? "bg-white text-slate-900"
                    : "text-slate-600"
                }`}
              >
                {t('aiTesting.testHistoryTab')}
              </button>
            </div>
          </div>

          {activeTab === "active" && (
            <div className="text-center py-4 text-slate-600">
              <p>{t('aiTesting.continueMessage')}</p>
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
                      {t('aiTesting.loadSession')}
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
  const [scenarios, setScenarios] = useState([]);
  const [scenariosLoading, setScenariosLoading] = useState(true);
  const { t } = useTranslation();

  // Fetch skill dimensions and convert to training scenarios
  useEffect(() => {
    const fetchSkillDimensions = async () => {
      try {
        setScenariosLoading(true);
        const response = await fetch('http://localhost:8000/employee/skill-dimensions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: user.role })
        });
        
        if (response.ok) {
          const data = await response.json();
          const skillDimensions = data.skill_dimensions || [];
          
          // Convert skill dimensions to training scenarios
          const trainingScenarios = skillDimensions.map((skill, index) => ({
            id: `skill-${index}`,
            name: skill,
            icon: getSkillIcon(skill),
            description: `Practice and improve your skills in ${skill} through interactive role-play scenarios.`
          }));
          
          setScenarios(trainingScenarios);
        } else {
          console.error('Failed to fetch skill dimensions');
          // Fallback to default scenarios if API fails
          setScenarios(getDefaultScenarios());
        }
      } catch (error) {
        console.error('Error fetching skill dimensions:', error);
        // Fallback to default scenarios if API fails
        setScenarios(getDefaultScenarios());
      } finally {
        setScenariosLoading(false);
      }
    };

    if (user && user.role) {
      fetchSkillDimensions();
    }
  }, [user]);

  // Helper function to get appropriate icon for each skill
  const getSkillIcon = (skill) => {
    const iconMap = {
      '运营与标准执行': '📋',
      '财务与成本管理': '💰',
      '顾客体验与客诉闭环': '😊',
      '团队管理与人事': '👥',
      '应急与跨部门协同': '🚨',
      '排班与人效管理': '⏰',
      '供应链保障': '📦',
      '菜品与标准化': '🍽️',
      '食安与安全管理': '🛡️',
      '成本与毛利控制': '📊',
      '出菜与产能': '⚡',
      '团队与培训': '🎓',
      '供应链协同': '🤝'
    };
    return iconMap[skill] || '🎯';
  };

  // Fallback default scenarios if API fails
  const getDefaultScenarios = () => [
    { 
      id: "customer-complaint", 
      name: t('aiRoleplay.customerComplaint'), 
      icon: "😤",
      description: t('aiRoleplay.customerComplaintDesc')
    },
    { 
      id: "food-safety-issue", 
      name: t('aiRoleplay.foodSafetyIssue'), 
      icon: "🛡️",
      description: t('aiRoleplay.foodSafetyIssueDesc')
    },
    { 
      id: "team-conflict", 
      name: t('aiRoleplay.teamConflict'), 
      icon: "🤝",
      description: t('aiRoleplay.teamConflictDesc')
    },
    { 
      id: "rush-hour-pressure", 
      name: t('aiRoleplay.rushHourPressure'), 
      icon: "⏰",
      description: t('aiRoleplay.rushHourPressureDesc')
    },
    { 
      id: "menu-recommendation", 
      name: t('aiRoleplay.menuRecommendation'), 
      icon: "🍽️",
      description: t('aiRoleplay.menuRecommendationDesc')
    },
    { 
      id: "emergency-situation", 
      name: t('aiRoleplay.emergencySituation'), 
      icon: "🚨",
      description: t('aiRoleplay.emergencySituationDesc')
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
          scenario_name: scenarios.find(s => s.id === selectedScenario)?.name || 'Unknown Skill',
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
          skill_dimension: scenarios.find(s => s.id === selectedScenario)?.name || 'General Training',
          conversation_history: conversation,
          test_history: []
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = { role: "assistant", content: data.response };
        setConversation(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = { role: "assistant", content: t('errors.generalError') };
        setConversation(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { role: "assistant", content: t('errors.connectionError') };
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
            <h3 className="text-lg font-semibold text-slate-900">{t('aiRoleplay.title')}</h3>
            <p className="text-sm text-slate-500">{t('aiRoleplay.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Scenario Selection */}
      {!selectedScenario && (
        <div className="card">
          <h4 className="mb-4 font-medium text-slate-900">
            {scenariosLoading ? 'Loading your skill dimensions...' : 'Choose a training scenario based on your role'}
          </h4>
          
          {scenariosLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-500 border-t-transparent"></div>
              <span className="ml-2 text-slate-600">Loading skill dimensions...</span>
            </div>
          ) : scenarios.length > 0 ? (
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
          ) : (
            <div className="text-center py-8 text-slate-600">
              <p className="mb-2">No skill dimensions found for your role.</p>
              <p className="text-sm">Please contact your administrator to configure skill dimensions for {user.role}.</p>
            </div>
          )}
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
              <p className="text-xs text-sky-600 mt-1">
                Training scenario for: {user.role === 'store_manager' ? 'Store Manager' : user.role === 'head_chef' ? 'Head Chef' : user.role}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={requestFeedback}
                disabled={conversation.length === 0 || isLoading}
                className="btn-secondary text-sm"
              >
                {t('aiRoleplay.getFeedback')}
              </button>
              <button
                onClick={startNewScenario}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                {t('aiRoleplay.newScenario')}
              </button>
            </div>
          </div>

          {conversation.length === 0 && (
            <div className="text-center py-8 text-slate-600">
              <p className="mb-2">{t('aiRoleplay.welcomeMessage')}</p>
              <p className="text-sm">{t('aiRoleplay.startMessage')}</p>
              <div className="mt-4">
                <button
                  onClick={() => setUserInput("I'm ready to start the role play scenario")}
                  className="btn-primary"
                >
                  {t('aiRoleplay.startRolePlay')}
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
                    {t('aiRoleplay.aiResponding')}
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
              placeholder={t('aiRoleplay.inputPlaceholder')}
              className="flex-1 input"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !userInput.trim()}
              className="btn-primary"
            >
              {t('aiTesting.send')}
            </button>
          </div>
        </div>
      )}

      {/* Feedback Section */}
      {showFeedback && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-slate-900">{t('aiRoleplay.trainingFeedback')}</h4>
            <button
              onClick={() => setShowFeedback(false)}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              {t('aiRoleplay.close')}
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

const ProblemSolvingCaseStudy = ({ user }) => {
  const [conversation, setConversation] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCase, setSelectedCase] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [cases, setCases] = useState([]);
  const [casesLoading, setCasesLoading] = useState(true);
  const { t } = useTranslation();

  // Fetch skill dimensions and convert to case study scenarios
  useEffect(() => {
    const fetchSkillDimensions = async () => {
      try {
        setCasesLoading(true);
        const response = await fetch('http://localhost:8000/employee/skill-dimensions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: user.role })
        });
        
        if (response.ok) {
          const data = await response.json();
          const skillDimensions = data.skill_dimensions || [];
          
          // Convert skill dimensions to case study scenarios
          const caseScenarios = skillDimensions.map((skill, index) => ({
            id: `case-${index}`,
            name: skill,
            icon: getCaseIcon(skill),
            description: `Analyze and solve real-world problems related to ${skill}. Practice critical thinking and decision-making skills.`,
            difficulty: getDifficultyLevel(skill)
          }));
          
          setCases(caseScenarios);
        } else {
          console.error('Failed to fetch skill dimensions');
          setCases(getDefaultCases());
        }
      } catch (error) {
        console.error('Error fetching skill dimensions:', error);
        setCases(getDefaultCases());
      } finally {
        setCasesLoading(false);
      }
    };

    if (user && user.role) {
      fetchSkillDimensions();
    }
  }, [user]);

  // Helper function to get appropriate icon for each case
  const getCaseIcon = (skill) => {
    const iconMap = {
      '运营与标准执行': '📋',
      '财务与成本管理': '💰',
      '顾客体验与客诉闭环': '😊',
      '团队管理与人事': '👥',
      '应急与跨部门协同': '🚨',
      '排班与人效管理': '⏰',
      '供应链保障': '📦',
      '菜品与标准化': '🍽️',
      '食安与安全管理': '🛡️',
      '成本与毛利控制': '📊',
      '出菜与产能': '⚡',
      '团队与培训': '🎓',
      '供应链协同': '🤝'
    };
    return iconMap[skill] || '🎯';
  };

  // Helper function to assign difficulty levels
  const getDifficultyLevel = (skill) => {
    const difficultyMap = {
      '运营与标准执行': 'Intermediate',
      '财务与成本管理': 'Advanced',
      '顾客体验与客诉闭环': 'Intermediate',
      '团队管理与人事': 'Advanced',
      '应急与跨部门协同': 'Expert',
      '排班与人效管理': 'Intermediate',
      '供应链保障': 'Advanced',
      '菜品与标准化': 'Intermediate',
      '食安与安全管理': 'Advanced',
      '成本与毛利控制': 'Advanced',
      '出菜与产能': 'Intermediate',
      '团队与培训': 'Advanced',
      '供应链协同': 'Advanced'
    };
    return difficultyMap[skill] || 'Intermediate';
  };

  // Fallback default cases if API fails
  const getDefaultCases = () => [
    { 
      id: "customer-complaint", 
      name: "Customer Complaint Resolution", 
      icon: "😤",
      description: "Handle difficult customer complaints and find effective solutions.",
      difficulty: "Intermediate"
    },
    { 
      id: "food-safety-issue", 
      name: "Food Safety Incident", 
      icon: "🛡️",
      description: "Address food safety concerns and implement preventive measures.",
      difficulty: "Advanced"
    },
    { 
      id: "team-conflict", 
      name: "Team Conflict Management", 
      icon: "🤝",
      description: "Resolve conflicts between team members and improve collaboration.",
      difficulty: "Advanced"
    }
  ];

  const startNewCase = () => {
    setConversation([]);
    setUserInput("");
    setSelectedCase("");
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
          scenario_id: selectedCase,
          scenario_name: cases.find(c => c.id === selectedCase)?.name || 'Unknown Case',
          user_response: conversation.map(msg => `${msg.role}: ${msg.content}`).join('\n'),
          user_role: user.role,
          scenario_history: []
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback || data.response || "Excellent problem-solving approach! Your analysis shows strong critical thinking skills.");
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
          skill_dimension: cases.find(c => c.id === selectedCase)?.name || 'General Case Study',
          conversation_history: conversation,
          test_history: []
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = { role: "assistant", content: data.response };
        setConversation(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = { role: "assistant", content: "I'm sorry, I'm having trouble processing your response. Please try again." };
        setConversation(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { role: "assistant", content: "I'm sorry, there was a connection error. Please check your internet connection and try again." };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Case Study Selection */}
      {!selectedCase && (
        <div className="card">
          <h4 className="mb-4 font-medium text-slate-900">
            {casesLoading ? 'Loading case study scenarios...' : 'Choose a problem-solving case study'}
          </h4>
          
          {casesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-500 border-t-transparent"></div>
              <span className="ml-2 text-slate-600">Loading case studies...</span>
            </div>
          ) : cases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cases.map(caseStudy => (
                <button
                  key={caseStudy.id}
                  onClick={() => setSelectedCase(caseStudy.id)}
                  className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{caseStudy.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">{caseStudy.name}</div>
                      <div className="text-sm text-slate-600">{caseStudy.description}</div>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          caseStudy.difficulty === 'Expert' ? 'bg-red-100 text-red-800' :
                          caseStudy.difficulty === 'Advanced' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {caseStudy.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-600">
              <p className="mb-2">No case studies found for your role.</p>
              <p className="text-sm">Please contact your administrator to configure case studies for {user.role}.</p>
            </div>
          )}
        </div>
      )}

      {/* Case Study Interface */}
      {selectedCase && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium text-slate-900">
                {cases.find(c => c.id === selectedCase)?.name}
              </h4>
              <p className="text-sm text-slate-500">
                {cases.find(c => c.id === selectedCase)?.description}
              </p>
              <p className="text-xs text-sky-600 mt-1">
                Case study for: {user.role === 'store_manager' ? 'Store Manager' : user.role === 'head_chef' ? 'Head Chef' : user.role}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={requestFeedback}
                disabled={conversation.length === 0 || isLoading}
                className="btn-secondary text-sm"
              >
                Get Analysis Feedback
              </button>
              <button
                onClick={startNewCase}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                New Case Study
              </button>
            </div>
          </div>

          {conversation.length === 0 && (
            <div className="text-center py-8 text-slate-600">
              <p className="mb-2">Welcome to the Problem-solving Case Study!</p>
              <p className="text-sm">This case study will present you with a real-world scenario related to your selected skill area.</p>
              <div className="mt-4">
                <button
                  onClick={() => setUserInput("I'm ready to begin the case study analysis")}
                  className="btn-primary"
                >
                  Start Case Study
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
                    AI is analyzing your response...
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
              placeholder="Type your analysis, questions, or solutions..."
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
            <h4 className="font-medium text-slate-900">Case Study Analysis Feedback</h4>
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
  const { t } = useTranslation();

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
  if (!quiz) return <p className="text-slate-600">{t('quiz.loading')}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{quiz.sop_topic}</h2>
        <button className="btn-ghost" onClick={() => navigate("/employee")}>
          {t('employee.backToList')}
        </button>
      </div>

      <div className="card">
        <p className="mb-3 font-medium text-slate-900">{quiz.question}</p>
        <p className="mb-4 text-sm text-slate-500 italic">
          {t('quiz.type')}: {quiz.type === "choice" ? t('quiz.multipleChoice') : t('quiz.writtenResponse')}
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
          <button onClick={handleSubmit} className="btn-success">{t('quiz.submit')}</button>
          <button className="btn-secondary" onClick={() => navigate("/employee")}>{t('quiz.cancel')}</button>
        </div>

        {submitted && (
          <div className="mt-4 rounded-xl border p-3">
            {correct ? (
              <p className="font-semibold text-emerald-600">{t('quiz.correct')}</p>
            ) : (
              <p className="font-semibold text-rose-600">{t('quiz.incorrect')}</p>
            )}
            <p className="mt-1 text-sm text-slate-600">{t('quiz.score')}: {score}</p>
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
  const { t } = useTranslation();

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
            <h2 className="text-xl font-semibold">{t('manager.title')}</h2>
            <p className="text-sm text-slate-500">{t('manager.subtitle')}</p>
          </div>
        </div>
        <AssignTraining />
      </div>

      <Section title={t('manager.teamSubmissions')}>
        <SubmissionTable submissions={submissions} />
      </Section>

      <Section title={t('manager.individualStatus')}>
        <div className="mb-3 flex gap-2">
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder={t('manager.enterUserId')}
            className="input"
          />
          <button onClick={fetchUserReport} className="btn-primary">{t('manager.check')}</button>
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
  const { t } = useTranslation();
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
  const { t } = useTranslation();

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
      alert(t('manager.generateError'));
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
      alert(t('manager.quizSaved'));
    } catch (err) {
      console.error(err);
      alert(t('manager.saveError'));
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
        placeholder={t('manager.pasteSop')}
        value={sopText}
        onChange={(e) => setSopText(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <button
          onClick={generateQuiz}
          className="btn-primary"
          disabled={loading || !sopText}
        >
          {loading ? t('manager.generating') : t('manager.generateQuiz')}
        </button>
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className="btn-warning"
        >
          {previewMode ? t('manager.editMode') : t('manager.previewMode')}
        </button>
        <button
          onClick={saveQuiz}
          className="btn-success"
          disabled={quiz.length === 0}
        >
          {t('manager.saveChanges')}
        </button>
      </div>
      {quiz.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">{previewMode ? t('manager.previewQuiz') : t('manager.reviewEditQuiz')}</h3>
          {quiz.map((q, idx) => (
            <div key={idx} className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-lg font-medium">{t('manager.question')} {idx + 1}</h4>
                <span className="pill">{q.type}</span>
              </div>
              <p className="mb-1 text-slate-700 font-semibold">{previewMode ? q.question : t('manager.questionLabel')}</p>
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
                  <p className="mb-1 text-sm font-medium text-slate-600">{t('quiz.options')}:</p>
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
              <label className="mb-1 block text-sm font-medium text-slate-600">{t('quiz.answer')}:</label>
              {previewMode ? (
                <p className="text-slate-800">{q.answer}</p>
              ) : (
                <input
                  className="input mb-2"
                  value={q.answer}
                  placeholder={t('manager.correctAnswer')}
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
  const [role, setRole] = useState("store_manager");
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const submit = (e) => {
    e.preventDefault();
    if (!name || !userId) return;
    const user = { name, role, id: userId };
    onLogin(user);
    
    // Redirect to appropriate route based on role
    if (role === "store_manager" || role === "head_chef") {
      navigate("/employee"); // Both skill dimension roles go to employee view
    } else {
      navigate(`/${role}`);
    }
  };

  const fillDemoEmployee = () => {
    setName("John");
    setRole("store_manager");
    setUserId("d33b2c44-baaa-4e43-b532-e82ecbe405d6");
  };

  const fillDemoManager = () => {
    setName("Manager");
    setRole("manager");
    setUserId("manager-1");
  };

  const fillDemoHeadChef = () => {
    setName("Chef Sarah");
    setRole("head_chef");
    setUserId("head-chef-001");
  };

  const fillDemoHeadManager = () => {
    setName("店长 Mike");
    setRole("store_manager");
    setUserId("head-manager-001");
  };

  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="card w-full max-w-md">
        <h2 className="mb-4 text-xl font-semibold">{t('login.title')}</h2>
        <form className="space-y-3" onSubmit={submit}>
          <div>
            <label className="mb-1 block text-sm text-slate-600">{t('login.name')}</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('login.namePlaceholder')} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">{t('login.role')}</label>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="store_manager">店长 (Store Manager)</option>
              <option value="head_chef">主厨 (Head Chef)</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">{t('login.userId')}</label>
            <input className="input" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder={t('login.userIdPlaceholder')} />
            <p className="mt-1 text-xs text-slate-500">{t('login.userIdHelp')}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={fillDemoEmployee} className="btn-secondary">{t('login.demoEmployee')}</button>
            <button type="button" onClick={fillDemoManager} className="btn-warning">{t('login.demoManager')}</button>
            <button type="button" onClick={fillDemoHeadChef} className="btn-success">{t('login.demoHeadChef')}</button>
            <button type="button" onClick={fillDemoHeadManager} className="btn-danger">{t('login.demoHeadManager')}</button>
          </div>
          <div className="pt-2">
            <button type="submit" className="btn-primary w-full">{t('login.continue')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;
