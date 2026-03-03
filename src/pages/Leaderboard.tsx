import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Crown, Medal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuizContext } from '../context/QuizContext';
import { MOCK_USERS, WEEKS } from '../data/mockData';

export default function Leaderboard() {
    const navigate = useNavigate();
    const { scores } = useQuizContext();

    const leaderboard = useMemo(() => {
        return MOCK_USERS.map(user => {
            const weeklyScores = WEEKS.map(week => ({
                weekId: week.id,
                score: scores[`${user.id}_${week.id}`] || 0
            }));

            const totalScore = weeklyScores.reduce((sum, w) => sum + w.score, 0);
            return { ...user, totalScore, weeklyScores };
        }).sort((a, b) => b.totalScore - a.totalScore); // Sort descending
    }, [scores]);

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30 text-slate-800 p-6 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/20 blur-[100px] rounded-full pointer-events-none" />

            <header className="flex items-center gap-4 mb-8 z-10">
                <button onClick={() => navigate('/')} className="p-2 bg-white text-slate-600 shadow-sm border border-slate-200 rounded-full hover:bg-slate-100 transition-colors active:scale-95">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                    <Trophy className="w-5 h-5 text-amber-500" /> 명예의 전당
                </h1>
            </header>

            <main className="flex-1 flex flex-col gap-4 z-10 w-full max-w-md mx-auto">
                <div className="bg-white/60 border border-slate-200/50 shadow-sm rounded-2xl p-5 mb-2 backdrop-blur-md">
                    <p className="text-sm text-slate-600 text-center leading-relaxed">
                        주차별 퀴즈를 풀고 <strong>명예의 전당</strong>에 도전해보세요!<br />
                        <span className="text-xs text-slate-400 mt-1 block">주간 획득 점수들이 모여 월별 합산(총점)이 산정됩니다.</span>
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    {leaderboard.map((user, index) => {
                        const isTop3 = index < 3;
                        const rankColors = [
                            'bg-gradient-to-r from-amber-50 to-yellow-50/50 border-amber-200 shadow-[0_4px_20px_rgba(251,191,36,0.15)]', // 1st
                            'bg-gradient-to-r from-slate-100 to-slate-50 border-slate-300 shadow-sm',   // 2nd
                            'bg-gradient-to-r from-orange-50 to-amber-50/30 border-orange-200 shadow-sm',   // 3rd
                        ];

                        const cardClass = isTop3
                            ? `${rankColors[index]} border-2`
                            : 'bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]';

                        return (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`flex items-center p-4 rounded-2xl ${cardClass} backdrop-blur-sm relative overflow-hidden`}
                            >
                                {/* Rank Badge */}
                                <div className="flex items-center justify-center w-10 h-10 shrink-0">
                                    {index === 0 && <Crown className="w-7 h-7 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" />}
                                    {index === 1 && <Medal className="w-6 h-6 text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.8)]" />}
                                    {index === 2 && <Medal className="w-6 h-6 text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.8)]" />}
                                    {index >= 3 && <span className="text-lg font-bold text-slate-400">{index + 1}</span>}
                                </div>

                                <div className="ml-4 flex-1">
                                    <h3 className={`font-bold text-lg ${isTop3 ? 'text-slate-800' : 'text-slate-600'}`}>
                                        {user.name}
                                    </h3>
                                    <div className="flex gap-1 mt-1 flex-wrap">
                                        {user.weeklyScores.map((w, i) => (
                                            <span
                                                key={w.weekId}
                                                className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium tracking-tight ${w.score > 0
                                                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                                        : 'bg-slate-50 text-slate-400 border border-slate-100'
                                                    }`}
                                            >
                                                {i + 1}주 <strong className={w.score > 0 ? 'font-bold' : 'font-normal'}>{w.score}</strong>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className={`font-extrabold text-2xl tracking-tighter ${isTop3 ? 'text-indigo-600' : 'text-slate-500'}`}>
                                        {user.totalScore}<span className="text-sm font-normal text-slate-400 ml-1">점</span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
