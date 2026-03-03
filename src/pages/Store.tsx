import { useState, useMemo } from 'react';
import { ArrowLeft, Store as StoreIcon, Ticket, PartyPopper, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizContext } from '../context/QuizContext';
import { MOCK_USERS } from '../data/mockData';
import confetti from 'canvas-confetti';

const STORE_ITEMS = [
    { id: 'item_500', title: '카페 음료 1잔', price: 500, desc: '아메리카노, 라떼 등 원하는 카페 음료 한 잔!', icon: '☕', color: 'bg-amber-500' },
    { id: 'item_1500', title: '든든한 식사 한 끼', price: 1500, desc: '국밥, 햄버거 세트 등 맛있는 식사!', icon: '🍔', color: 'bg-amber-500' },
    { id: 'item_3000', title: '애슐리 퀸즈 식사권', price: 3000, desc: '최고급 프리미엄 뷔페 애슐리 퀸즈!', icon: '👑', color: 'bg-purple-600' },
];

export default function Store() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'shop' | 'inventory'>('shop');

    const { selectedUserId, scores, purchasedCoupons, buyCoupon } = useQuizContext();
    const currentUser = MOCK_USERS.find(u => u.id === selectedUserId);

    // 총 점수 계산
    const totalScore = useMemo(() => {
        if (!selectedUserId) return 0;
        let total = 0;
        Object.entries(scores).forEach(([key, score]) => {
            if (key.startsWith(`${selectedUserId}_`)) total += score;
        });
        return total;
    }, [scores, selectedUserId]);

    // 내 쿠폰 (인벤토리)
    const myCoupons = useMemo(() => {
        if (!selectedUserId) return [];
        return purchasedCoupons[selectedUserId.toString()] || [];
    }, [purchasedCoupons, selectedUserId]);

    // 사용한 포인트 합계
    const spentPoints = useMemo(() => {
        return myCoupons.reduce((sum, c) => sum + c.price, 0);
    }, [myCoupons]);

    // 현재 남은 잔액
    const currentPoints = totalScore - spentPoints;

    const handleBuy = (item: typeof STORE_ITEMS[0]) => {
        if (!selectedUserId) return;

        if (currentPoints < item.price) {
            alert("포인트가 부족합니다! 더 많은 퀴즈를 풀고 포인트를 모아보세요.");
            return;
        }

        if (window.confirm(`[${item.title}] 상품을 ${item.price}P에 구매하시겠습니까?\n(구매 후에는 포인트가 차감됩니다)`)) {
            const success = buyCoupon(selectedUserId, {
                couponId: item.id,
                title: item.title,
                price: item.price
            });

            if (success) {
                // 폭죽 이펙트
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#818cf8', '#c084fc', '#f472b6']
                });
                alert("🎉 구매 완료! '내 쿠폰함'에서 확인하세요.");
                setActiveTab('inventory');
            }
        }
    };

    if (!selectedUserId) {
        return (
            <div className="flex flex-col min-h-screen bg-slate-50 p-6 items-center justify-center">
                <p className="text-slate-500 mb-4">로그인이 필요합니다.</p>
                <button onClick={() => navigate('/')} className="px-5 py-3 bg-indigo-500 text-white rounded-xl shadow-sm">홈으로</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-[100dvh] bg-slate-50 text-slate-800 relative">
            {/* Header */}
            <header className="px-6 pt-6 pb-4 bg-white sticky top-0 z-20 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate('/')} className="p-2 bg-slate-50 text-slate-600 shadow-sm border border-slate-100 rounded-full active:scale-95">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                        <StoreIcon className="w-5 h-5 text-indigo-500" /> 포인트 스토어
                    </h1>
                </div>

                {/* 내 자산 요약 */}
                <div className="bg-gradient-to-br from-slate-800 to-indigo-950 p-6 rounded-3xl shadow-lg relative overflow-hidden mb-6">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
                    <p className="text-slate-300 text-sm font-medium flex items-center gap-2 mb-2 relative z-10">
                        {currentUser?.name} 님의 지갑
                    </p>
                    <div className="flex items-baseline gap-1.5 relative z-10">
                        <span className="text-4xl font-extrabold text-white tracking-tight">{currentPoints.toLocaleString()}</span>
                        <span className="text-indigo-300 font-bold">P</span>
                    </div>
                </div>

                {/* 탭 메뉴 */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('shop')}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'shop' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        교환소 목록
                    </button>
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        내 쿠폰함 <span className="ml-1 bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-md text-[10px]">{myCoupons.length}</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 pt-4">
                <AnimatePresence mode="sync">
                    {activeTab === 'shop' ? (
                        <motion.div
                            key="shop"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col gap-4"
                        >
                            {STORE_ITEMS.map((item, idx) => {
                                const canAfford = currentPoints >= item.price;
                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`bg-white rounded-3xl p-5 border flex flex-col gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all ${canAfford ? 'border-indigo-100' : 'border-slate-100 opacity-70 grayscale-[0.3]'}`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-3xl shadow-inner shrink-0 leading-none`}>
                                                {item.icon}
                                            </div>
                                            <div className="flex-1 pt-1">
                                                <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{item.title}</h3>
                                                <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleBuy(item)}
                                            disabled={!canAfford}
                                            className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${canAfford ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}
                                        >
                                            {canAfford ? (
                                                <>
                                                    <PartyPopper className="w-4 h-4" />
                                                    {item.price.toLocaleString()}P로 교환하기
                                                </>
                                            ) : (
                                                <>{item.price.toLocaleString()}P (포인트 부족)</>
                                            )}
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="inventory"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex flex-col gap-4"
                        >
                            {myCoupons.length === 0 ? (
                                <div className="text-center py-20 px-6">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Ticket className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <p className="text-slate-400 font-medium">아직 구매한 쿠폰이 없습니다.<br />퀴즈를 풀고 교환소에서 쿠폰을 얻어보세요!</p>
                                </div>
                            ) : (
                                myCoupons.map((coupon, idx) => {
                                    const storeItem = STORE_ITEMS.find(s => s.id === coupon.couponId);
                                    return (
                                        <motion.div
                                            key={coupon.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="bg-indigo-600 rounded-3xl p-1 relative overflow-hidden shadow-lg"
                                        >
                                            {/* 절취선 효과를 위한 디자인 요소 */}
                                            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-slate-50 rounded-full transform -translate-y-1/2 z-10" />
                                            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-slate-50 rounded-full transform -translate-y-1/2 z-10" />

                                            <div className="bg-white rounded-[22px] p-5 flex items-center gap-4 relative z-0 border border-white/20 h-full">
                                                <div className={`w-12 h-12 ${storeItem?.color || 'bg-indigo-500'} rounded-2xl flex items-center justify-center text-2xl shrink-0`}>
                                                    {storeItem?.icon || '🎫'}
                                                </div>
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full whitespace-nowrap">사용 가능</span>
                                                        <span className="text-[10px] text-slate-400 font-medium truncate">{coupon.purchasedAt}</span>
                                                    </div>
                                                    <h3 className="font-bold text-slate-800 text-[15px] truncate">{coupon.title}</h3>
                                                </div>
                                                <div className="w-8 flex justify-end shrink-0 text-slate-300 border-l border-dashed border-slate-200 pl-4 h-full items-center">
                                                    <ChevronRight className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
