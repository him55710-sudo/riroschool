import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_USERS, WEEKS, ADMIN_PIN } from '../data/mockData';
import { BookOpen, Trophy, UserCheck, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizContext } from '../context/QuizContext';
import PinModal from '../components/PinModal';
import ChangePinModal from '../components/ChangePinModal';

export default function Home() {
    const navigate = useNavigate();
    const { selectedUserId, setSelectedUserId, markAttendance } = useQuizContext();
    const [showAttendanceToast, setShowAttendanceToast] = useState(false);

    const [pinModalConfig, setPinModalConfig] = useState<{
        isOpen: boolean;
        expectedPin: string;
        title: string;
        targetId: number | 'admin' | null;
    }>({
        isOpen: false,
        expectedPin: '',
        title: '',
        targetId: null,
    });

    const [isChangePinModalOpen, setIsChangePinModalOpen] = useState(false);
    const { userPins, updatePin } = useQuizContext();

    useEffect(() => {
        if (selectedUserId) {
            const isNewlyMarked = markAttendance(selectedUserId);
            if (isNewlyMarked) {
                setShowAttendanceToast(true);
                setTimeout(() => setShowAttendanceToast(false), 3500);
            }
        }
    }, [selectedUserId, markAttendance]);

    const handleUserSelect = (user: typeof MOCK_USERS[0]) => {
        if (selectedUserId === user.id) return; // 이미 선택됨
        setPinModalConfig({
            isOpen: true,
            expectedPin: user.pin,
            title: `${user.name} 님`,
            targetId: user.id
        });
    };

    const handleAdminClick = () => {
        const currentAdminPin = userPins['admin'] || ADMIN_PIN;
        setPinModalConfig({
            isOpen: true,
            expectedPin: currentAdminPin,
            title: '임현수 선생님',
            targetId: 'admin'
        });
    };

    const handlePinSuccess = () => {
        setPinModalConfig(prev => ({ ...prev, isOpen: false }));
        // 약간의 딜레이 후 액션 실행 (모달 닫히는 애니메이션 자연스럽게)
        setTimeout(() => {
            if (pinModalConfig.targetId === 'admin') {
                navigate('/admin');
            } else if (typeof pinModalConfig.targetId === 'number') {
                setSelectedUserId(pinModalConfig.targetId);
            }
        }, 200);
    };

    const handleWeekClick = (weekId: number) => {
        if (!selectedUserId) {
            alert('먼저 위에서 내 이름을 선택해주세요!');
            return;
        }
        navigate(`/quiz/${weekId}`);
    };

    const handleChangePinClick = () => {
        if (!selectedUserId) return;
        setIsChangePinModalOpen(true);
    };

    const handleChangePinSuccess = (newPin: string) => {
        if (selectedUserId) {
            updatePin(selectedUserId, newPin);
        }
        setIsChangePinModalOpen(false);
        alert('비밀번호가 성공적으로 변경되었습니다!');
    };

    // 현재 로그인된 유저 정보 찾기
    const currentUser = MOCK_USERS.find(u => u.id === selectedUserId);

    return (
        <div className="flex flex-col h-full min-h-screen p-6 relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <div className="absolute top-0 inset-x-0 h-64 bg-indigo-400/10 blur-[100px] rounded-full pointer-events-none" />

            <header className="pt-8 pb-10 z-10 text-center">
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-block p-3 bg-white/60 shadow-[0_0_20px_rgba(99,102,241,0.15)] rounded-2xl mb-4 backdrop-blur-md border border-white/50">
                    <BookOpen className="w-8 h-8 text-indigo-400" />
                </motion.div>
                <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    고등부 큐티 퀴즈
                </motion.h1>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-slate-500 text-sm font-medium">
                    말씀을 기억하고, 간식을 획득하세요!
                </motion.p>
            </header>

            <main className="flex-1 flex flex-col gap-6 z-10">
                <motion.section initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-white/70 p-6 rounded-3xl border border-white shadow-[0_4px_30px_rgba(0,0,0,0.03)] backdrop-blur-2xl">
                    <div className="flex items-center gap-2 mb-4">
                        <UserCheck className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-lg font-bold text-slate-800">내 이름 선택하기</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {MOCK_USERS.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => handleUserSelect(user)}
                                className={`py-3 px-4 transition-all rounded-xl font-bold text-sm border active:scale-95 ${selectedUserId === user.id
                                    ? 'bg-indigo-500 text-white border-indigo-400 shadow-[0_4px_15px_rgba(99,102,241,0.4)] transform -translate-y-0.5'
                                    : 'bg-white hover:bg-indigo-50 text-slate-600 border-slate-200 hover:border-indigo-200 shadow-sm'
                                    }`}
                            >
                                {user.name}
                            </button>
                        ))}
                    </div>

                    {selectedUserId && (
                        <div className="mt-4 text-center">
                            <button
                                onClick={handleChangePinClick}
                                className="text-xs text-indigo-500 hover:text-indigo-600 font-semibold underline underline-offset-4 transition-colors"
                            >
                                [ 내 비밀번호 변경하기 ]
                            </button>
                        </div>
                    )}
                </motion.section>

                <motion.section initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="bg-white/70 p-6 rounded-3xl border border-white shadow-[0_4px_30px_rgba(0,0,0,0.03)] backdrop-blur-2xl mt-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-800">주차별 퀴즈</h2>
                        <button onClick={() => navigate('/leaderboard')} className="p-2 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-colors shadow-sm">
                            <Trophy className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex flex-col gap-3">
                        {WEEKS.map((week) => (
                            <button key={week.id} onClick={() => handleWeekClick(week.id)} className="flex items-center justify-between p-4 bg-white hover:bg-indigo-50/80 rounded-2xl border border-slate-200 transition-all active:scale-95 group shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(99,102,241,0.1)] hover:-translate-y-0.5">
                                <div className="text-left">
                                    <h3 className="font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">{week.title}</h3>
                                    <p className="text-xs text-slate-500 mt-1">{week.description}</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                                    <span className="text-slate-400 group-hover:text-white text-lg leading-none transform translate-x-[1px] transition-colors">›</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </motion.section>
            </main>

            <div className="mt-8 mb-4 text-center z-10">
                <button onClick={handleAdminClick} className="text-xs text-slate-400 hover:text-indigo-500 font-medium underline underline-offset-4 transition-colors">
                    선생님 전용 관리자 페이지 (임현수)
                </button>
            </div>

            <PinModal
                isOpen={pinModalConfig.isOpen}
                onClose={() => setPinModalConfig(prev => ({ ...prev, isOpen: false }))}
                onSuccess={handlePinSuccess}
                expectedPin={pinModalConfig.expectedPin}
                title={pinModalConfig.title}
            />

            {currentUser && (
                <ChangePinModal
                    isOpen={isChangePinModalOpen}
                    onClose={() => setIsChangePinModalOpen(false)}
                    onSuccess={handleChangePinSuccess}
                    currentPin={userPins[currentUser.id.toString()] || currentUser.pin}
                    title={`${currentUser.name} 님`}
                />
            )}

            {/* 출석 토스트 팝업 */}
            <AnimatePresence>
                {showAttendanceToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 z-50 whitespace-nowrap border border-indigo-400"
                    >
                        <div className="bg-white/20 p-2 rounded-full">
                            <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">출석 완료! 20포인트 획득 🎉</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
