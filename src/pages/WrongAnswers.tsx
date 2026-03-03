import { useMemo } from 'react';
import { ArrowLeft, AlertCircle, Bookmark, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuizContext } from '../context/QuizContext';
import { QUIZ_DATA } from '../data/quizData';
import { MOCK_USERS, WEEKS } from '../data/mockData';

export default function WrongAnswers() {
    const navigate = useNavigate();
    const { selectedUserId, wrongAnswers } = useQuizContext();

    const currentUser = MOCK_USERS.find(u => u.id === selectedUserId);

    // 내가 틀린 문제 리스트 추출
    const myWrongList = useMemo(() => {
        if (!selectedUserId) return [];
        const myAnswerIds = wrongAnswers[selectedUserId.toString()] || [];

        const list: { weekId: number; weekTitle: string; qIndex: number; text: string; correct: string; explanation: string }[] = [];

        myAnswerIds.forEach(globalId => {
            const weekId = Math.floor(globalId / 100);
            const qIndex = globalId % 100;

            const weekData = QUIZ_DATA[weekId];
            if (weekData && weekData[qIndex]) {
                const question = weekData[qIndex];
                const weekInfo = WEEKS.find(w => w.id === weekId);

                list.push({
                    weekId,
                    weekTitle: weekInfo?.title || `${weekId}주차`,
                    qIndex,
                    text: question.text,
                    correct: question.options[question.correctAnswer],
                    explanation: question.explanation
                });
            }
        });

        // 최신 주차부터 오름차순, 문제순으로 정렬
        return list.sort((a, b) => {
            if (a.weekId !== b.weekId) return a.weekId - b.weekId;
            return a.qIndex - b.qIndex;
        });
    }, [selectedUserId, wrongAnswers]);

    if (!selectedUserId) {
        return (
            <div className="flex flex-col min-h-screen bg-slate-50 p-6 items-center justify-center">
                <p className="text-slate-500 mb-4">로그인이 필요합니다.</p>
                <button onClick={() => navigate('/')} className="px-5 py-3 bg-indigo-500 text-white rounded-xl shadow-sm">홈으로</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-[100dvh] bg-slate-50 text-slate-800 p-6 relative">
            <header className="flex items-center gap-4 mb-8 sticky top-0 bg-slate-50/80 backdrop-blur-md pt-4 pb-2 z-20">
                <button onClick={() => navigate('/')} className="p-2 bg-white text-slate-600 shadow-sm border border-slate-200 rounded-full active:scale-95">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                        <AlertCircle className="w-5 h-5 text-rose-500" /> 나만의 오답노트
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">{currentUser?.name} 님의 기록</p>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto pb-10">
                {myWrongList.length === 0 ? (
                    <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-sm mt-10">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-700 mb-2">훌륭해요! 🎉</h2>
                        <p className="text-sm text-slate-500">아직 틀린 문제가 없습니다.<br />앞으로도 화이팅!</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <p className="text-xs font-bold text-slate-400 mb-1 pl-1">총 {myWrongList.length}개의 복습할 말씀이 있습니다.</p>
                        {myWrongList.map((item, idx) => (
                            <motion.div
                                key={`${item.weekId}_${item.qIndex}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white border border-rose-100/50 shadow-sm rounded-2xl p-5"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-50 text-rose-600 rounded-md border border-rose-100">
                                        {item.weekTitle}
                                    </span>
                                    <span className="text-xs text-slate-500 font-medium">Q{item.qIndex + 1}</span>
                                </div>

                                <h3 className="text-[15px] font-bold text-slate-800 leading-snug mb-4">
                                    {item.text}
                                </h3>

                                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 mb-3">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                        <span className="text-[11px] font-bold text-slate-500">정답</span>
                                    </div>
                                    <p className="text-sm text-slate-700 font-medium leading-tight ml-5">
                                        {item.correct}
                                    </p>
                                </div>

                                <div className="bg-indigo-50/50 border border-indigo-50 rounded-xl p-3">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Bookmark className="w-3.5 h-3.5 text-indigo-500" />
                                        <span className="text-[11px] font-bold text-indigo-400">말씀 해설</span>
                                    </div>
                                    <p className="text-[13px] text-indigo-900 leading-relaxed font-medium">
                                        {item.explanation}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
