import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, BarChart3, CheckCircle2, Circle, KeyRound } from 'lucide-react';
import { useQuizContext } from '../context/QuizContext';
import { MOCK_USERS, WEEKS, ADMIN_PIN } from '../data/mockData';
import ChangePinModal from '../components/ChangePinModal';

export default function Admin() {
    const navigate = useNavigate();
    const { scores, userPins, updatePin } = useQuizContext();
    const [isChangePinModalOpen, setIsChangePinModalOpen] = useState(false);

    const handleAdminPinChange = (newPin: string) => {
        updatePin('admin', newPin);
        setIsChangePinModalOpen(false);
        alert('관리자 비밀번호가 성공적으로 변경되었습니다!');
    };

    const studentData = useMemo(() => {
        return MOCK_USERS.map(user => {
            let totalWeeklyScores = 0;

            const weeklyStatus = WEEKS.map(week => {
                const score = scores[`${user.id}_${week.id}`];
                if (score !== undefined) {
                    totalWeeklyScores += score;
                }
                return {
                    weekId: week.id,
                    score: score,
                    completed: score !== undefined
                };
            });

            return {
                ...user,
                weeklyStatus,
                totalScore: totalWeeklyScores
            };
        }).sort((a, b) => b.totalScore - a.totalScore);
    }, [scores]);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 p-4 relative overflow-y-auto">
            <header className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 sticky top-0 bg-slate-50/80 backdrop-blur-md z-20">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/')} className="p-2 bg-white text-slate-600 shadow-sm border border-slate-200 rounded-full hover:bg-slate-100 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <h1 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                        <Users className="w-5 h-5 text-indigo-500" /> 임현수 선생님 메뉴
                    </h1>
                </div>
                <button
                    onClick={() => setIsChangePinModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors shadow-sm"
                >
                    <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                    비밀번호 변경
                </button>
            </header>

            <main className="flex-1 overflow-x-auto">
                <div className="flex items-center gap-2 mb-4 px-1">
                    <BarChart3 className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-md font-bold text-slate-700">학생 참여 모니터링 현황</h2>
                </div>

                <div className="min-w-[600px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                            <tr>
                                <th scope="col" className="px-5 py-4 font-bold w-24">이름</th>
                                {WEEKS.map(week => (
                                    <th key={week.id} scope="col" className="px-3 py-4 text-center">{week.title}</th>
                                ))}
                                <th scope="col" className="px-5 py-4 text-right">총점</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentData.map(student => (
                                <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-4 font-bold text-slate-800 whitespace-nowrap">
                                        {student.name}
                                    </td>
                                    {student.weeklyStatus.map(status => (
                                        <td key={status.weekId} className="px-3 py-4">
                                            {status.completed ? (
                                                <div className="flex flex-col items-center">
                                                    <CheckCircle2 className="w-4 h-4 text-green-500 mb-1" />
                                                    <span className="text-xs text-green-600 font-bold">{status.score}점</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center opacity-40">
                                                    <Circle className="w-4 h-4 text-slate-400 mb-1" />
                                                    <span className="text-xs text-slate-400">-</span>
                                                </div>
                                            )}
                                        </td>
                                    ))}
                                    <td className="px-5 py-4 text-right font-bold text-indigo-600">
                                        {student.totalScore}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8 text-xs text-slate-500 text-center">
                    * 점수는 학생이 각 주차별 퀴즈를 완료할 때 자동으로 계산되어 저장됩니다.
                </div>
            </main>

            <ChangePinModal
                isOpen={isChangePinModalOpen}
                onClose={() => setIsChangePinModalOpen(false)}
                onSuccess={handleAdminPinChange}
                currentPin={userPins['admin'] || ADMIN_PIN}
                title="임현수 선생님"
            />
        </div>
    );
}
