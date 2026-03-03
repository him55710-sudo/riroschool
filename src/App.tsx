import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import { QuizProvider } from './context/QuizContext';
import Sidebar from './components/Sidebar';

// 신규 5대 부가기능 라우트 컴포넌트
import WrongAnswers from './pages/WrongAnswers';
import Summary from './pages/Summary';
import Diary from './pages/Diary';
import Community from './pages/Community';
import Store from './pages/Store';

function AppLayout() {
  const location = useLocation();
  const isWideLayout = location.pathname.startsWith('/summary');

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 overflow-hidden font-sans">
      <main
        className={`w-full mx-auto min-h-screen bg-white shadow-[0_0_40px_rgba(0,0,0,0.05)] relative ${isWideLayout ? 'max-w-5xl' : 'max-w-md'
          }`}
      >
        <Sidebar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz/:weekId" element={<Quiz />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/wrong-answers" element={<WrongAnswers />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/diary" element={<Diary />} />
          <Route path="/community" element={<Community />} />
          <Route path="/store" element={<Store />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <QuizProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </QuizProvider>
  );
}

export default App;
