import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, BookOpen, PenTool, MessageSquare, AlertCircle, Trophy, Settings } from 'lucide-react';
import { useQuizContext } from '../context/QuizContext';
import { MOCK_USERS } from '../data/mockData';

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedUserId } = useQuizContext();

    const currentUser = MOCK_USERS.find(u => u.id === selectedUserId);

    // Close sidebar when navigating
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    const handleNavigation = (path: string) => {
        navigate(path);
        setIsOpen(false);
    };

    const navItems = [
        { path: '/', icon: Home, label: '홈으로' },
        { path: '/summary', icon: BookOpen, label: 'QT 요약 프레젠테이션' },
        { path: '/wrong-answers', icon: AlertCircle, label: '나만의 오답노트' },
        { path: '/diary', icon: PenTool, label: '하나님과의 일기장' },
        { path: '/community', icon: MessageSquare, label: '고등부 커뮤니티 공간' },
        { path: '/store', icon: Trophy, label: '🎁 내 포인트 쿠폰 교환소' },
        { path: '/leaderboard', icon: Trophy, label: '명예의 전당' },
    ];

    return (
        <>
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-6 left-6 z-40 p-3 bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm rounded-full text-slate-700 hover:bg-slate-50 transition-colors active:scale-95"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Sidebar Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 pointer-events-auto"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-80 bg-white shadow-2xl z-50 flex flex-col pointer-events-auto border-r border-slate-100"
                        >
                            <div className="p-6 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <BookOpen className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h2 className="font-extrabold text-slate-800 text-lg">고등부 큐티 퀴즈</h2>
                                        {currentUser ? (
                                            <p className="text-sm font-medium text-indigo-600">
                                                {currentUser.name} 접속 중
                                            </p>
                                        ) : (
                                            <p className="text-sm text-slate-500">
                                                이름을 선택해주세요
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">
                                    메뉴
                                </div>
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <button
                                            key={item.path}
                                            onClick={() => handleNavigation(item.path)}
                                            className={`flex items-center gap-4 w-full text-left px-4 py-3.5 rounded-2xl transition-all active:scale-95 ${isActive
                                                ? 'bg-indigo-50 text-indigo-600 font-bold'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                                <button
                                    onClick={() => handleNavigation('/admin')}
                                    className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-2xl text-slate-500 hover:bg-slate-100 transition-colors font-medium active:scale-95 text-sm"
                                >
                                    <Settings className="w-4 h-4" />
                                    선생님 전용 관리자 메뉴
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
