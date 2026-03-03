import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BOOK_SUMMARIES } from '../data/summaryData';

export default function Summary() {
    const navigate = useNavigate();
    const [activeBookIndex, setActiveBookIndex] = useState(0);
    const [activeChapterId, setActiveChapterId] = useState<string>('');
    const [openAccordionIdx, setOpenAccordionIdx] = useState<number | null>(null);
    const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

    const activeBook = BOOK_SUMMARIES[activeBookIndex];

    useEffect(() => {
        // 책이 바뀔 때마다 첫 번째 챕터 탭을 활성화하고 아코디언은 닫기
        if (activeBook && activeBook.chapters.length > 0) {
            setActiveChapterId(activeBook.chapters[0].id);
        }
        setOpenAccordionIdx(null);
        setFlippedCards(new Set());
        window.scrollTo({ top: 0, behavior: 'smooth' }); // 새 책 선택 시 맨 위로 스크롤
    }, [activeBookIndex, activeBook]);

    if (!activeBook) return null;

    const toggleCardFlip = (cardIndex: number) => {
        setFlippedCards(prev => {
            const next = new Set(prev);
            if (next.has(cardIndex)) {
                next.delete(cardIndex);
            } else {
                next.add(cardIndex);
            }
            return next;
        });
    };

    return (
        <div className="flex flex-col min-h-[100dvh] bg-[#fafaf9] text-stone-800 antialiased selection:bg-indigo-200 selection:text-indigo-900 pb-20">
            {/* Navigation Header */}
            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
                <div className="max-w-5xl mx-auto px-4">
                    {/* 상단 햄버거/뒤로가기 영역 */}
                    <div className="flex items-center gap-3 h-14 border-b border-stone-100">
                        <button onClick={() => navigate('/')} className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-colors active:scale-95">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="font-black text-lg text-indigo-700 tracking-tighter cursor-default flex items-center gap-1.5">
                            <BookOpen className="w-5 h-5" />
                            권별 심층 프리뷰
                        </div>
                    </div>
                    {/* 성경책 선택 탭바 (Scrollable) */}
                    <div className="flex overflow-x-auto hide-scrollbar py-2 gap-2 h-14 items-center">
                        {BOOK_SUMMARIES.map((book, idx) => (
                            <button
                                key={book.id}
                                onClick={() => setActiveBookIndex(idx)}
                                className={`whitespace-nowrap px-4 py-1.5 font-bold rounded-full text-sm transition-all focus:outline-none flex-shrink-0 ${activeBookIndex === idx
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                                    }`}
                            >
                                {book.title}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-20 md:space-y-24 overflow-x-hidden w-full">
                {/* 1. Hero Intro */}
                <motion.section
                    key={`hero_${activeBook.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center space-y-4 md:space-y-6 pt-4 md:pt-8"
                >
                    <div className="inline-block bg-indigo-100 text-indigo-800 font-bold px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm mb-2 shadow-sm">
                        {activeBook.heroSubtitle}
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-stone-900 tracking-tight leading-tight break-keep">
                        {activeBook.heroTitleLine1}<br />
                        <span className={`text-transparent bg-clip-text bg-gradient-to-r ${activeBook.heroTitleGradient}`}>
                            {activeBook.heroTitleLine2}
                        </span>
                    </h1>
                    <p className="text-base md:text-xl text-stone-600 max-w-2xl mx-auto font-medium mt-4 leading-relaxed break-keep whitespace-pre-wrap">
                        {activeBook.heroDesc}
                    </p>
                </motion.section>

                {/* 2. Context (Flip Cards) */}
                <section className="space-y-6 md:space-y-8">
                    <div className="text-center max-w-2xl mx-auto px-2">
                        <p className="text-indigo-600 font-bold tracking-widest text-xs md:text-sm mb-1 md:mb-2">BACKGROUND</p>
                        <h2 className="text-2xl md:text-3xl font-black text-stone-800 mb-3 md:mb-4">📍 읽기 전 필수 배경지식</h2>
                        <p className="text-sm md:text-base text-stone-500 font-medium break-keep">
                            {activeBook.title}를 읽기 전 꼭 알아야 할 {activeBook.cards.length}가지 팩트입니다. 카드를 터치하면 설명이 펼쳐집니다.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
                        {activeBook.cards.map((card, i) => {
                            const isFlipped = flippedCards.has(i);

                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => toggleCardFlip(i)}
                                    aria-pressed={isFlipped}
                                    className="h-[270px] sm:h-[290px] w-full cursor-pointer text-left rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-300 [perspective:1200px]"
                                >
                                    <motion.div
                                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                                        transition={{ duration: 0.55, ease: 'easeInOut' }}
                                        className="relative w-full h-full"
                                        style={{ transformStyle: 'preserve-3d' }}
                                    >
                                        {/* Front */}
                                        <div
                                            className="absolute w-full h-full rounded-2xl bg-white text-stone-800 shadow-md border border-stone-200 flex flex-col justify-center items-center p-6"
                                            style={{ backfaceVisibility: 'hidden' }}
                                        >
                                            <span className="text-4xl md:text-5xl mb-3 block">{card.emoji}</span>
                                            <h3 className="font-bold text-lg md:text-xl text-stone-800 break-keep text-center">{card.frontTitle}</h3>
                                            <p className="text-xs text-stone-500 mt-2 font-medium text-center">터치해서 설명 보기 👆</p>
                                        </div>
                                        {/* Back */}
                                        <div
                                            className="absolute w-full h-full rounded-2xl bg-indigo-600 text-white shadow-xl flex flex-col justify-center items-center p-6"
                                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                        >
                                            <p className="font-black text-xl md:text-2xl mb-3 text-white break-keep text-center">{card.backTitle}</p>
                                            <p className="text-sm md:text-base text-indigo-100 font-semibold leading-relaxed break-keep text-center">
                                                {card.backDesc}
                                            </p>
                                            <p className="mt-3 text-xs text-indigo-200 font-medium">다시 터치하면 앞면</p>
                                        </div>
                                    </motion.div>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* 3. Core Message (Visual Equation) */}
                <section className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-xl p-6 md:p-12 border border-stone-200 flex flex-col items-center gap-8 md:gap-12">
                    <div className="w-full text-center max-w-3xl mx-auto space-y-4 md:space-y-6">
                        <p className="text-indigo-500 font-bold tracking-widest text-xs md:text-sm mb-1">{activeBook.coreMessageSubtitle}</p>
                        <h2 className="text-2xl md:text-3xl font-black text-stone-900 leading-tight">
                            {activeBook.coreMessageTitleLine1} <br />
                            <span className="text-violet-600">{activeBook.coreMessageTitleLine2}</span>
                        </h2>
                        <p className="text-sm md:text-base text-stone-600 leading-relaxed font-medium break-keep">
                            {activeBook.coreMessageDesc}
                        </p>
                    </div>

                    <div className="flex flex-col xl:flex-row items-stretch justify-center w-full gap-2 xl:gap-6 py-2">
                        {/* Box 1 (Left) */}
                        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 md:p-7 text-center w-full max-w-[340px] xl:max-w-none xl:w-1/3 min-h-[230px] flex flex-col justify-center shadow-sm hover:-translate-y-1 transition-transform">
                            <div className="text-4xl md:text-5xl mb-3 block">{activeBook.equation.leftEmoji}</div>
                            <h3 className="font-black text-indigo-800 text-lg md:text-2xl">{activeBook.equation.leftTitle}</h3>
                            <p className="text-xs md:text-sm text-indigo-600 mt-2 font-medium break-keep">{activeBook.equation.leftDesc}</p>
                        </div>

                        {/* Plus */}
                        <div className="flex items-center justify-center text-3xl md:text-4xl font-black text-violet-400 my-2 xl:my-0">➕</div>

                        {/* Box 2 (Right) */}
                        <div className="bg-violet-50 border-2 border-violet-200 rounded-2xl p-6 md:p-7 text-center w-full max-w-[340px] xl:max-w-none xl:w-1/3 min-h-[230px] flex flex-col justify-center shadow-sm hover:-translate-y-1 transition-transform">
                            <div className="text-4xl md:text-5xl mb-3 block">{activeBook.equation.rightEmoji}</div>
                            <h3 className="font-black text-violet-800 text-lg md:text-2xl">{activeBook.equation.rightTitle}</h3>
                            <p className="text-xs md:text-sm text-violet-700 mt-2 font-medium break-keep">{activeBook.equation.rightDesc}</p>
                        </div>

                        {/* Equals */}
                        <div className="flex items-center justify-center text-3xl md:text-4xl font-black text-violet-400 my-2 xl:my-0">🟰</div>

                        {/* Result */}
                        <div className="bg-violet-100 border-2 border-violet-200 rounded-2xl p-6 md:p-7 text-center w-full max-w-[340px] xl:max-w-none xl:w-1/3 min-h-[230px] flex flex-col justify-center shadow-sm hover:-translate-y-1 transition-transform">
                            <div className="text-4xl md:text-5xl mb-3 block">{activeBook.equation.resultEmoji}</div>
                            <h3 className="font-black text-violet-900 text-lg md:text-2xl">{activeBook.equation.resultTitle}</h3>
                            <p className="text-xs md:text-sm text-violet-700 mt-2 font-medium break-keep">{activeBook.equation.resultDesc}</p>
                        </div>
                    </div>
                </section>

                {/* 4. Chapters (Tabs) */}
                <section className="space-y-6 md:space-y-8">
                    <div className="text-center max-w-2xl mx-auto px-2">
                        <p className="text-indigo-600 font-bold tracking-widest text-xs md:text-sm mb-1 md:mb-2">CHAPTER SUMMARY</p>
                        <h2 className="text-2xl md:text-3xl font-black text-stone-800 mb-3 md:mb-4">📖 챕터별 핵심 파헤치기</h2>
                        <p className="text-sm md:text-base text-stone-500 font-medium break-keep">
                            버튼을 눌러 각 장의 핵심 내용과 내 삶에 적용할 포인트를 찾아보세요.
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto bg-white rounded-[1.5rem] md:rounded-2xl shadow-lg border border-stone-200 overflow-hidden">
                        {/* Tab Buttons */}
                        <div className="flex flex-col sm:flex-row border-b border-stone-200 bg-stone-100">
                            {activeBook.chapters.map((ch, idx) => (
                                <button
                                    key={ch.id}
                                    onClick={() => setActiveChapterId(ch.id)}
                                    className={`flex-1 py-4 md:py-5 text-center font-bold transition focus:outline-none text-sm md:text-base border-b-2 sm:border-b-4 ${idx > 0 ? 'sm:border-l border-stone-200' : ''
                                        } ${activeChapterId === ch.id
                                            ? 'text-indigo-600 bg-white border-b-indigo-600 sm:border-b-indigo-600'
                                            : 'text-stone-500 hover:text-indigo-600 border-b-stone-200 sm:border-b-transparent'
                                        }`}
                                >
                                    {ch.tabTitle}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="p-6 md:p-10 min-h-[350px]">
                            <AnimatePresence mode="wait">
                                {activeBook.chapters.map(ch => (
                                    ch.id === activeChapterId && (
                                        <motion.div
                                            key={ch.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <h3 className="text-xl md:text-2xl font-black mb-3 md:mb-4 text-slate-800">
                                                {ch.title}
                                            </h3>
                                            <p className="text-sm md:text-lg text-stone-700 mb-5 md:mb-6 leading-relaxed break-keep">
                                                {ch.desc}
                                            </p>
                                            <div className="p-5 md:p-6 rounded-2xl border border-indigo-100 bg-indigo-50/70">
                                                <strong className="text-indigo-700 block mb-2 text-base md:text-lg">
                                                    {ch.pointTitle}
                                                </strong>
                                                <p className="text-sm md:text-base font-medium break-keep opacity-90 text-slate-700">
                                                    {ch.pointDesc}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </section>

                {/* 5. Theology (Accordion) */}
                <section className="bg-slate-100 text-slate-700 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-12 shadow-lg border border-slate-200 relative overflow-hidden mt-10 md:mt-16">
                    <div className="absolute -right-10 -top-10 text-9xl opacity-10 select-none pointer-events-none hidden md:block">🏛️</div>

                    <p className="text-indigo-600 font-bold tracking-widest text-xs md:text-sm mb-1 md:mb-2 relative z-10">
                        {activeBook.theologySubtitle}
                    </p>
                    <h2 className="text-2xl md:text-4xl font-black mb-4 md:mb-6 text-slate-900 relative z-10 break-keep">
                        {activeBook.theologyTitle}
                    </h2>
                    <p className="text-sm md:text-lg text-slate-600 mb-8 md:mb-10 font-medium leading-relaxed max-w-3xl relative z-10 break-keep">
                        {activeBook.theologyDesc}
                    </p>

                    <div className="space-y-3 md:space-y-4 relative z-10">
                        {activeBook.qna.map((qnaItem, idx) => {
                            const isOpen = openAccordionIdx === idx;
                            return (
                                <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                    <button
                                        onClick={() => setOpenAccordionIdx(isOpen ? null : idx)}
                                        className={`w-full text-left p-5 md:p-6 font-bold flex justify-between items-center focus:outline-none text-base md:text-lg hover:text-indigo-600 transition-colors ${isOpen ? 'text-indigo-600' : 'text-slate-700'}`}
                                    >
                                        <span className="pr-4 break-keep">{qnaItem.q}</span>
                                        <ChevronDown className={`w-6 h-6 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    <div
                                        className="transition-all duration-300 ease-out overflow-hidden"
                                        style={{ maxHeight: isOpen ? '800px' : '0px' }}
                                    >
                                        <div className="px-5 md:px-6 pb-5 md:pb-6 text-slate-600 leading-relaxed font-medium text-sm md:text-base border-t border-slate-200 pt-4 break-keep">
                                            {qnaItem.highlightText ? (
                                                <p>
                                                    <span className="text-indigo-600 font-bold">
                                                        "{qnaItem.highlightText}"
                                                    </span>
                                                    <br /><br />
                                                    {qnaItem.a}
                                                </p>
                                            ) : (
                                                <p>{qnaItem.a}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Footer */}
                <footer className="text-center pb-8 pt-8 md:pt-16 border-t border-stone-200 text-stone-400 font-medium text-xs md:text-sm flex flex-col items-center">
                    <p>대한예수교장로회(합동) 청소년부를 위한 {activeBook.title} 인터랙티브 가이드</p>
                    <p className="mt-2 font-bold tracking-widest text-stone-500">SOLI DEO GLORIA</p>
                </footer>
            </main>
        </div>
    );
}
