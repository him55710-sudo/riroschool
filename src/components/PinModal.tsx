import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X } from 'lucide-react';

interface PinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    expectedPin: string;
    title: string;
}

export default function PinModal({ isOpen, onClose, onSuccess, expectedPin, title }: PinModalProps) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setPin('');
            setError(false);
        }
    }, [isOpen]);

    const handleNumberClick = (num: number) => {
        if (pin.length < 4) {
            const newPin = pin + num;
            setPin(newPin);
            setError(false);

            if (newPin.length === 4) {
                // Verify PIN
                setTimeout(() => {
                    if (newPin === expectedPin) {
                        onSuccess();
                    } else {
                        setError(true);
                        setPin('');
                    }
                }, 200);
            }
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
        setError(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 overflow-hidden"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-8 mt-4">
                            <div className="mx-auto w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                                <Lock className="w-6 h-6 text-indigo-500" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 mb-1">{title}</h2>
                            <p className="text-sm text-slate-500 font-medium">비밀번호 4자리를 입력해주세요</p>
                        </div>

                        {/* PIN Dots */}
                        <motion.div
                            animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                            transition={{ duration: 0.4 }}
                            className="flex justify-center gap-4 mb-8"
                        >
                            {[0, 1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className={`w-4 h-4 rounded-full transition-all duration-200 ${error
                                            ? 'bg-red-400'
                                            : pin.length > i
                                                ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                                                : 'bg-slate-200'
                                        }`}
                                />
                            ))}
                        </motion.div>
                        {error && (
                            <p className="text-center text-red-500 text-sm font-bold mb-4 -mt-4">
                                비밀번호가 틀렸습니다. 다시 시도해주세요.
                            </p>
                        )}

                        {/* Keypad */}
                        <div className="grid grid-cols-3 gap-3">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => handleNumberClick(num)}
                                    className="h-14 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-2xl text-xl font-semibold transition-colors active:scale-95 shadow-sm border border-slate-100"
                                >
                                    {num}
                                </button>
                            ))}
                            <div className="h-14"></div>
                            <button
                                onClick={() => handleNumberClick(0)}
                                className="h-14 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-2xl text-xl font-semibold transition-colors active:scale-95 shadow-sm border border-slate-100"
                            >
                                0
                            </button>
                            <button
                                onClick={handleDelete}
                                className="h-14 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-2xl transition-colors active:scale-95 shadow-sm border border-slate-100"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
