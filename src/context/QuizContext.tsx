import React, { createContext, useContext, useState, useEffect } from 'react';

export interface PurchasedCoupon {
    id: string; // 고유 구매 ID
    couponId: string; // 상품 ID (ex: 'drink_500')
    title: string; // 상품 이름
    price: number; // 지불한 포인트
    purchasedAt: string; // 구매 일시
}

type QuizContextType = {
    selectedUserId: number | null;
    setSelectedUserId: (id: number | null) => void;
    scores: Record<string, number>; // "userId_weekId" -> score or "userId_attendance_YYYY-MM-DD" -> score
    saveScore: (userId: number, weekId: number, score: number) => void;
    markAttendance: (userId: number) => boolean; // returns true if newly marked
    userPins: Record<string, string>; // "userId" (or "admin") -> pin
    updatePin: (targetId: number | 'admin', newPin: string) => void;
    wrongAnswers: Record<string, number[]>; // "userId" -> [questionIndex1, questionIndex2, ...]
    addWrongAnswer: (userId: number, questionIndex: number) => void;
    purchasedCoupons: Record<string, PurchasedCoupon[]>; // "userId" -> 구매한 쿠폰 리스트
    buyCoupon: (userId: number, coupon: Omit<PurchasedCoupon, 'id' | 'purchasedAt'>) => boolean; // 구매 성공여부 반환
};

const QuizContext = createContext<QuizContextType | undefined>(undefined);
const SCORE_STORAGE_KEY = 'qt_quiz_scores_v3';
const USER_ONE_RESET_MARKER_KEY = 'qt_quiz_user1_reset_v1';

export function QuizProvider({ children }: { children: React.ReactNode }) {
    const [selectedUserId, setSelectedUserId] = useState<number | null>(() => {
        const saved = localStorage.getItem('qt_quiz_user_v2');
        return saved ? parseInt(saved, 10) : null;
    });

    const [scores, setScores] = useState<Record<string, number>>(() => {
        const saved = localStorage.getItem(SCORE_STORAGE_KEY);
        if (saved) return JSON.parse(saved);

        // 초기 시작 데이터 (모두 0 점)
        return {};
    });

    // 커스텀 PIN 번호 저장소 추가 (초기화하지 않음, 비밀번호는 유지)
    const [userPins, setUserPins] = useState<Record<string, string>>(() => {
        try {
            const saved = localStorage.getItem('qt_quiz_pins');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (typeof parsed === 'object' && parsed !== null) {
                    return parsed;
                }
            }
        } catch (e) {
            console.error('Failed to parse user pins', e);
        }
        return {}; // 빈 객체 (저장된 값이 없으면 기본 1234 처리됨)
    });

    const [wrongAnswers, setWrongAnswers] = useState<Record<string, number[]>>(() => {
        try {
            const saved = localStorage.getItem('qt_quiz_wrong_answers_v2');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (typeof parsed === 'object' && parsed !== null) {
                    return parsed;
                }
            }
        } catch (e) {
            console.error('Failed to parse wrong answers', e);
        }
        return {};
    });

    // 쿠폰 구매 내역
    const [purchasedCoupons, setPurchasedCoupons] = useState<Record<string, PurchasedCoupon[]>>(() => {
        try {
            const saved = localStorage.getItem('qt_quiz_coupons_v2');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (typeof parsed === 'object' && parsed !== null) {
                    return parsed;
                }
            }
        } catch (e) {
            console.error('Failed to parse coupons', e);
        }
        return {};
    });

    useEffect(() => {
        if (selectedUserId !== null) {
            localStorage.setItem('qt_quiz_user_v2', selectedUserId.toString());
        } else {
            localStorage.removeItem('qt_quiz_user_v2');
        }
    }, [selectedUserId]);

    useEffect(() => {
        localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(scores));
    }, [scores]);

    useEffect(() => {
        // 비밀번호는 초기화 대상 제외 (기존 키 유지)
        localStorage.setItem('qt_quiz_pins', JSON.stringify(userPins));
    }, [userPins]);

    useEffect(() => {
        localStorage.setItem('qt_quiz_wrong_answers_v2', JSON.stringify(wrongAnswers));
    }, [wrongAnswers]);

    useEffect(() => {
        localStorage.setItem('qt_quiz_coupons_v2', JSON.stringify(purchasedCoupons));
    }, [purchasedCoupons]);

    useEffect(() => {
        if (localStorage.getItem(USER_ONE_RESET_MARKER_KEY)) return;

        setScores(prev => {
            const filtered = Object.fromEntries(
                Object.entries(prev).filter(([key]) => !key.startsWith('1_'))
            );
            return filtered;
        });

        setWrongAnswers(prev => {
            if (!prev['1']) return prev;
            const next = { ...prev };
            delete next['1'];
            return next;
        });

        setPurchasedCoupons(prev => {
            if (!prev['1']) return prev;
            const next = { ...prev };
            delete next['1'];
            return next;
        });

        localStorage.removeItem('qt_quiz_diary_v3_1');
        localStorage.setItem(USER_ONE_RESET_MARKER_KEY, 'done');
    }, []);

    const saveScore = (userId: number, weekId: number, score: number) => {
        setScores(prev => ({
            ...prev,
            [`${userId}_${weekId}`]: Math.max(prev[`${userId}_${weekId}`] || 0, score),
        }));
    };

    const markAttendance = (userId: number) => {
        const todayStr = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '-').replace('.', '');
        const attendanceKey = `${userId}_attendance_${todayStr}`;

        let isNewlyMarked = false;
        setScores(prev => {
            if (prev[attendanceKey]) return prev; // 이미 오늘 출석함

            isNewlyMarked = true;
            return {
                ...prev,
                [attendanceKey]: 20 // 매일 20점 부여
            };
        });

        return isNewlyMarked;
    };

    const updatePin = (targetId: number | 'admin', newPin: string) => {
        setUserPins(prev => ({
            ...prev,
            [targetId.toString()]: newPin
        }));
    };

    const addWrongAnswer = (userId: number, questionIndex: number) => {
        setWrongAnswers(prev => {
            const currentUserKey = userId.toString();
            const prevAnswers = prev[currentUserKey] || [];
            if (!prevAnswers.includes(questionIndex)) {
                return {
                    ...prev,
                    [currentUserKey]: [...prevAnswers, questionIndex]
                };
            }
            return prev;
        });
    };

    const buyCoupon = (userId: number, coupon: Omit<PurchasedCoupon, 'id' | 'purchasedAt'>) => {
        // 1. 현재 유저의 총 가용 포인트 계산
        let totalScore = 0;
        Object.entries(scores).forEach(([key, score]) => {
            if (key.startsWith(`${userId}_`)) {
                totalScore += score;
            }
        });

        const userCoupons = purchasedCoupons[userId.toString()] || [];
        const spentPoints = userCoupons.reduce((sum, c) => sum + c.price, 0);
        const currentPoints = totalScore - spentPoints;

        // 2. 가격 비교
        if (currentPoints < coupon.price) {
            return false; // 구매 실패 (잔액 부족)
        }

        // 3. 구매 처리
        const newCoupon: PurchasedCoupon = {
            ...coupon,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            purchasedAt: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
        };

        setPurchasedCoupons(prev => ({
            ...prev,
            [userId.toString()]: [newCoupon, ...(prev[userId.toString()] || [])]
        }));

        return true; // 구매 성공
    };

    return (
        <QuizContext.Provider value={{
            selectedUserId, setSelectedUserId, scores, saveScore,
            markAttendance,
            userPins, updatePin, wrongAnswers, addWrongAnswer,
            purchasedCoupons, buyCoupon
        }}>
            {children}
        </QuizContext.Provider>
    );
}

export function useQuizContext() {
    const context = useContext(QuizContext);
    if (context === undefined) {
        throw new Error('useQuizContext must be used within a QuizProvider');
    }
    return context;
}
