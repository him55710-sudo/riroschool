import { useState, useEffect } from 'react';
import { ArrowLeft, PenTool, Plus, X, Calendar, Edit3, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizContext } from '../context/QuizContext';
import { MOCK_USERS } from '../data/mockData';

interface DiaryEntry {
    id: string;
    date: string;
    content: string;
    emotion: string; // 'happy', 'peaceful', 'thankful', 'sad'
}

const getDiaryStorageKey = (userId: number) => `qt_quiz_diary_v3_${userId}`;

export default function Diary() {
    const navigate = useNavigate();
    const { selectedUserId } = useQuizContext();
    const currentUser = MOCK_USERS.find(u => u.id === selectedUserId);

    const [entries, setEntries] = useState<DiaryEntry[]>(() => {
        if (!selectedUserId) return [];
        const saved = localStorage.getItem(getDiaryStorageKey(selectedUserId));
        if (saved) return JSON.parse(saved);
        return [];
    });

    const [isWriting, setIsWriting] = useState(false);
    const [newContent, setNewContent] = useState('');
    const [newEmotion, setNewEmotion] = useState('thankful');
    const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedUserId) {
            setEntries([]);
            return;
        }
        const saved = localStorage.getItem(getDiaryStorageKey(selectedUserId));
        if (saved) {
            setEntries(JSON.parse(saved));
        } else {
            setEntries([]);
        }
    }, [selectedUserId]);

    useEffect(() => {
        if (selectedUserId) {
            localStorage.setItem(getDiaryStorageKey(selectedUserId), JSON.stringify(entries));
        }
    }, [entries, selectedUserId]);

    const resetEditor = () => {
        setIsWriting(false);
        setEditingEntryId(null);
        setNewContent('');
        setNewEmotion('thankful');
    };

    const startNewEntry = () => {
        setEditingEntryId(null);
        setNewContent('');
        setNewEmotion('thankful');
        setIsWriting(true);
    };

    const startEditEntry = (entry: DiaryEntry) => {
        setEditingEntryId(entry.id);
        setNewContent(entry.content);
        setNewEmotion(entry.emotion);
        setIsWriting(true);
    };

    const handleDeleteEntry = (entryId: string) => {
        if (!window.confirm('이 일기를 삭제할까요? 삭제하면 되돌릴 수 없어요.')) return;
        setEntries(prev => prev.filter(entry => entry.id !== entryId));
        if (editingEntryId === entryId) {
            resetEditor();
        }
    };

    const handleSave = () => {
        if (!newContent.trim()) return;

        if (editingEntryId) {
            setEntries(prev =>
                prev.map(entry =>
                    entry.id === editingEntryId
                        ? { ...entry, content: newContent, emotion: newEmotion }
                        : entry
                )
            );
            resetEditor();
            return;
        }

        const newEntry: DiaryEntry = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }),
            content: newContent,
            emotion: newEmotion
        };

        setEntries(prev => [newEntry, ...prev]);
        resetEditor();
    };

    if (!selectedUserId) {
        return (
            <div className="flex flex-col min-h-screen bg-slate-50 p-6 items-center justify-center">
                <p className="text-slate-500 mb-4">로그인이 필요합니다.</p>
                <button onClick={() => navigate('/')} className="px-5 py-3 bg-indigo-500 text-white rounded-xl shadow-sm">홈으로</button>
            </div>
        );
    }

    const emotions = [
        { id: 'happy', emoji: '😊', label: '기쁜' },
        { id: 'peaceful', emoji: '😌', label: '평안한' },
        { id: 'thankful', emoji: '🙏', label: '감사한' },
        { id: 'sad', emoji: '😢', label: '슬픈' },
    ];

    return (
        <div className="flex flex-col min-h-[100dvh] bg-[#FDFBF7] text-slate-800 p-6 relative">
            <header className="flex items-center justify-between mb-8 sticky top-0 bg-[#FDFBF7]/90 backdrop-blur-md pt-4 pb-2 z-20 border-b border-orange-900/5">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="p-2 bg-white text-slate-600 shadow-sm border border-slate-200 rounded-full active:scale-95">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                            <PenTool className="w-5 h-5 text-amber-600" /> 큐티 일기장
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">{currentUser?.name} 님의 기록</p>
                    </div>
                </div>
                {!isWriting && (
                    <button
                        onClick={startNewEntry}
                        className="p-2.5 bg-amber-500 text-white shadow-md shadow-amber-500/20 rounded-full hover:bg-amber-600 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                )}
            </header>

            <main className="flex-1 overflow-y-auto pb-10">
                <AnimatePresence mode="wait">
                    {isWriting ? (
                        <motion.div
                            key="writer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-6 shadow-xl border border-amber-100 relative"
                        >
                            <button
                                onClick={resetEditor}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-50 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <Edit3 className="w-4 h-4 text-amber-500" /> {editingEntryId ? '일기를 수정해요' : '오늘 하루 어땠나요?'}
                            </h2>

                            <div className="flex gap-2 mb-6">
                                {emotions.map(emo => (
                                    <button
                                        key={emo.id}
                                        onClick={() => setNewEmotion(emo.id)}
                                        className={`flex-1 py-2 px-1 rounded-xl border text-2xl transition-all ${newEmotion === emo.id
                                                ? 'bg-amber-50 border-amber-300 shadow-sm scale-105'
                                                : 'bg-slate-50 border-slate-100 hover:bg-slate-100 grayscale-[0.5]'
                                            }`}
                                    >
                                        {emo.emoji}
                                    </button>
                                ))}
                            </div>

                            <textarea
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                                placeholder="하나님께 드리고 싶은 말이나 오늘 깨달은 점을 적어보세요..."
                                className="w-full h-40 p-4 bg-[#FAFAFA] border border-slate-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm leading-relaxed mb-4 text-slate-700"
                            />

                            <button
                                onClick={handleSave}
                                disabled={!newContent.trim()}
                                className="w-full py-3.5 bg-amber-500 text-white font-bold rounded-xl shadow-md shadow-amber-500/20 hover:bg-amber-600 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                            >
                                {editingEntryId ? '일기 수정하기' : '일기 저장하기'}
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div key="list" className="flex flex-col gap-5">
                            {entries.length === 0 ? (
                                <div className="text-center py-20 opacity-50">
                                    <PenTool className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                    <p className="font-medium text-slate-400">우측 상단 + 버튼을 눌러<br />첫 번째 일기를 기록해보세요.</p>
                                </div>
                            ) : (
                                entries.map((entry, idx) => (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-white p-5 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-amber-900/5 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-amber-200 to-orange-300 left-0" />
                                        <div className="flex justify-between items-start mb-3 mt-1">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {entry.date}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-2xl drop-shadow-sm">
                                                    {emotions.find(e => e.id === entry.emotion)?.emoji}
                                                </div>
                                                <button
                                                    onClick={() => startEditEntry(entry)}
                                                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
                                                    aria-label="일기 수정"
                                                    title="수정"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteEntry(entry.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                                                    aria-label="일기 삭제"
                                                    title="삭제"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-[15px] leading-relaxed text-slate-700 whitespace-pre-wrap font-medium">
                                            {entry.content}
                                        </p>
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
