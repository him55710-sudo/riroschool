import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizContext } from '../context/QuizContext';
import { QUIZ_DATA } from '../data/quizData';

export default function Quiz() {
    const { weekId } = useParams();
    const navigate = useNavigate();
    const { selectedUserId, saveScore, addWrongAnswer } = useQuizContext();

    const questions = weekId ? QUIZ_DATA[weekId] : undefined;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [scoreCount, setScoreCount] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    if (!selectedUserId) {
        return (
            <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 p-6 justify-center items-center">
                <p className="mb-4">이름이 선택되지 않았습니다.</p>
                <button onClick={() => navigate('/')} className="px-5 py-3 bg-indigo-500 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-600 transition-colors">돌아가기</button>
            </div>
        );
    }

    if (!questions || questions.length === 0) {
        return (
            <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 p-6 justify-center items-center">
                <p className="mb-4">해당 주차의 퀴즈가 준비되지 않았습니다.</p>
                <button onClick={() => navigate(-1)} className="px-5 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition-colors">뒤로 가기</button>
            </div>
        );
    }

    const currentQ = questions[currentIndex];
    const isAnswered = selectedOption !== null;
    const isCorrect = selectedOption === currentQ.correctAnswer;

    const handleOptionClick = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);

        if (index === currentQ.correctAnswer) {
            setScoreCount(prev => prev + 1);
        } else {
            // 오답인 경우 전역 상태에 오답 문제의 전역 고유 ID(주차 및 인덱스 조합)를 저장합니다.
            // 1주차 0번문제 -> ID: 100, 2주차 3번문제 -> ID: 203 등으로 관리
            const globalQuestionId = parseInt(weekId!) * 100 + currentIndex;
            if (selectedUserId) {
                addWrongAnswer(selectedUserId, globalQuestionId);
            }
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setSelectedOption(null);
            setCurrentIndex(prev => prev + 1);
        } else {
            // 퀴즈 종료 시 점수 계산 및 저장 로직
            // 이미 handleOptionClick에서 scoreCount가 반영된 상태(하지만 useState 비동기 특성상 아직 반영 안 됐을 수도 있으니 고려)
            const finalScoreCount = isCorrect ? scoreCount + 1 : scoreCount;
            const actualScore = Math.round((finalScoreCount / questions.length) * 100);

            saveScore(selectedUserId, parseInt(weekId!), actualScore);
            setIsFinished(true);
        }
    };

    if (isFinished) {
        // 이미 scoreCount는 handleOptionClick에서 업데이트 중이므로 결과창 렌더링 시에는 (isCorrect ? scoreCount + 1 : scoreCount)가 진짜 점수
        const finalScore = Math.round(((isCorrect ? scoreCount + 1 : scoreCount) / questions.length) * 100);
        return (
            <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-slate-800 p-6 items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 blur-[100px] rounded-full pointer-events-none" />
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white/80 p-8 rounded-3xl border border-white shadow-[0_10px_40px_rgba(0,0,0,0.08)] backdrop-blur-2xl text-center z-10 max-w-sm w-full">
                    <h2 className="text-2xl font-bold mb-2">수고했어요! 🎉</h2>
                    <p className="text-slate-500 mb-6 font-medium">총 {questions.length}문제 중 {isCorrect ? scoreCount + 1 : scoreCount}문제를 맞췄어요.</p>
                    <div className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 mb-8 drop-shadow-sm">
                        {finalScore}<span className="text-2xl text-slate-400 font-bold ml-1">점</span>
                    </div>
                    <button onClick={() => navigate('/leaderboard')} className="w-full py-4 bg-indigo-500 text-white hover:bg-indigo-600 rounded-xl font-bold transition-colors shadow-lg active:scale-95 mb-3">
                        명예의 전당 보기
                    </button>
                    <button onClick={() => navigate('/')} className="w-full py-4 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-bold transition-colors">
                        홈으로 가기
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 p-6 relative overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between mb-6 z-10">
                <button onClick={() => navigate(-1)} className="p-2 bg-white text-slate-600 shadow-sm border border-slate-200 rounded-full hover:bg-slate-100 transition-colors active:scale-95">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="text-sm font-bold text-slate-500 bg-white/60 px-4 py-1.5 rounded-full shadow-sm border border-slate-200/50 backdrop-blur-md">
                    <span className="text-indigo-600">{currentIndex + 1}</span> / {questions.length}
                </div>
                <div className="w-9" /> {/* Spacer */}
            </header>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-200 rounded-full mb-8 overflow-hidden z-10">
                <motion.div
                    className="h-full bg-indigo-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Card Content */}
            <main className="flex-1 flex flex-col z-10 relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="flex-1 flex flex-col"
                    >
                        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex-1 flex flex-col mb-4">
                            <h2 className="text-xl font-bold leading-snug text-slate-800 mb-8 min-h-[4rem]">
                                {currentQ.text}
                            </h2>

                            <div className="flex flex-col gap-3 mt-auto">
                                {currentQ.options.map((option, idx) => {
                                    let btnClass = "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700";
                                    let Icon = null;

                                    if (isAnswered) {
                                        if (idx === currentQ.correctAnswer) {
                                            btnClass = "bg-green-50 border-green-500 text-green-700 shadow-[0_0_15px_rgba(34,197,94,0.2)]";
                                            Icon = <CheckCircle2 className="w-5 h-5 text-green-600" />;
                                        } else if (idx === selectedOption) {
                                            btnClass = "bg-red-50 border-red-400 text-red-600";
                                            Icon = <XCircle className="w-5 h-5 text-red-500" />;
                                        } else {
                                            btnClass = "bg-slate-50/50 border-slate-200 text-slate-400 opacity-60";
                                        }
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleOptionClick(idx)}
                                            disabled={isAnswered}
                                            className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left font-medium ${!isAnswered ? 'active:scale-95' : ''} ${btnClass}`}
                                        >
                                            <span className="flex-1 pr-2">{option}</span>
                                            {Icon && <span className="flex-shrink-0">{Icon}</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <AnimatePresence>
                            {isAnswered && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-4 shadow-sm"
                                >
                                    <p className="text-sm text-indigo-900 leading-relaxed font-medium">
                                        <span className="font-bold text-indigo-600 mr-2 flex items-center gap-1 mb-1"><BookOpen className="w-4 h-4" />해설</span>
                                        {currentQ.explanation}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Footer next button */}
            <AnimatePresence>
                {isAnswered && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-auto z-10 pt-4"
                    >
                        <button
                            onClick={handleNext}
                            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-[0_4px_15px_rgba(79,70,229,0.3)] hover:bg-indigo-700 active:scale-95 transition-all text-lg"
                        >
                            {currentIndex < questions.length - 1 ? '다음 문제' : '결과 저장 및 완료'}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
