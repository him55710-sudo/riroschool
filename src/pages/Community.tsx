import { useState } from 'react';
import { ArrowLeft, MessageSquare, Heart, Send, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizContext } from '../context/QuizContext';
import { MOCK_USERS } from '../data/mockData';

// 커뮤니티는 빈 피드에서 시작합니다.
const INITIAL_POSTS: {
    id: string;
    authorId: number;
    authorName: string;
    content: string;
    timestamp: string;
    likes: number;
    comments: {
        id: string;
        authorName: string;
        content: string;
        timestamp: string;
    }[];
}[] = [];

export default function Community() {
    const navigate = useNavigate();
    const { selectedUserId } = useQuizContext();
    const currentUser = MOCK_USERS.find(u => u.id === selectedUserId);

    const [posts, setPosts] = useState(INITIAL_POSTS);
    const [newPostContent, setNewPostContent] = useState('');
    const [commentInput, setCommentInput] = useState<{ [key: string]: string }>({});
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

    if (!selectedUserId) {
        return (
            <div className="flex flex-col min-h-screen bg-slate-50 p-6 items-center justify-center">
                <p className="text-slate-500 mb-4">로그인이 필요합니다.</p>
                <button onClick={() => navigate('/')} className="px-5 py-3 bg-indigo-500 text-white rounded-xl shadow-sm">홈으로</button>
            </div>
        );
    }

    const handleCreatePost = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;

        const newPost = {
            id: Date.now().toString(),
            authorId: selectedUserId,
            authorName: currentUser?.name || '익명',
            content: newPostContent,
            timestamp: '방금 전',
            likes: 0,
            comments: []
        };

        setPosts([newPost, ...posts]);
        setNewPostContent('');
    };

    const handleAddComment = (postId: string, e: React.FormEvent) => {
        e.preventDefault();
        const content = commentInput[postId];
        if (!content?.trim()) return;

        setPosts(prev => prev.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    comments: [...post.comments, {
                        id: Date.now().toString(),
                        authorName: currentUser?.name || '익명',
                        content,
                        timestamp: '방금 전'
                    }]
                };
            }
            return post;
        }));

        setCommentInput(prev => ({ ...prev, [postId]: '' }));
    };

    const toggleLike = (postId: string) => {
        setLikedPosts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(postId)) {
                newSet.delete(postId);
            } else {
                newSet.add(postId);
            }
            return newSet;
        });

        setPosts(prev => prev.map(post => {
            if (post.id === postId) {
                const isDisliking = likedPosts.has(postId);
                return { ...post, likes: post.likes + (isDisliking ? -1 : 1) };
            }
            return post;
        }));
    };

    return (
        <div className="flex flex-col min-h-[100dvh] bg-[#F5F7FA] text-slate-800 relative">
            {/* Header */}
            <header className="flex items-center justify-between p-6 sticky top-0 bg-[#F5F7FA]/90 backdrop-blur-md z-20 border-b border-indigo-900/5">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="p-2 bg-white text-slate-600 shadow-sm border border-slate-200 rounded-full active:scale-95">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                        고등부 나눔 게시판
                    </h1>
                </div>
                <button className="p-2 text-slate-400 hover:text-indigo-500 transition-colors">
                    <Search className="w-5 h-5" />
                </button>
            </header>

            <main className="flex-1 overflow-y-auto pb-10">
                {/* 글쓰기 영역 */}
                <div className="p-6 pb-2 min-h-0">
                    <form onSubmit={handleCreatePost} className="bg-white p-4 rounded-3xl shadow-sm border border-indigo-50 flex flex-col gap-3">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {currentUser?.name.charAt(currentUser.name.length - 1)}
                            </div>
                            <span className="font-bold text-sm text-slate-700">{currentUser?.name}</span>
                        </div>
                        <input
                            type="text"
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder="큐티 후기나 학교 생활을 자유롭게 나눠보세요!"
                            className="bg-slate-50 border-none outline-none p-3 rounded-2xl w-full text-sm resize-none focus:ring-2 ring-indigo-100"
                        />
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={!newPostContent.trim()}
                                className="px-5 py-2 bg-indigo-500 text-white text-sm font-bold rounded-xl active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
                            >
                                올리기
                            </button>
                        </div>
                    </form>
                </div>

                {/* 피드 게시물 목록 */}
                <div className="p-6 pt-4 flex flex-col gap-6">
                    <AnimatePresence>
                        {posts.map((post) => (
                            <motion.div
                                key={post.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-3xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100/50"
                            >
                                {/* 작성자 정보 */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-inner ${post.authorId === 999 ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-slate-300'}`}>
                                            {post.authorName.charAt(post.authorName.length - 1)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-[15px] flex items-center gap-1">
                                                {post.authorName}
                                                {post.authorId === 999 && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md">선생님</span>}
                                            </div>
                                            <div className="text-[11px] text-slate-400 font-medium">{post.timestamp}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* 본문 */}
                                <p className="text-[15px] leading-relaxed text-slate-700 font-medium mb-4 whitespace-pre-wrap">
                                    {post.content}
                                </p>

                                {/* 좋아요 및 댓글 수 통계 */}
                                <div className="flex items-center gap-4 py-3 border-y border-slate-50 mb-3 text-sm text-slate-500 font-medium">
                                    <button
                                        onClick={() => toggleLike(post.id)}
                                        className={`flex items-center gap-1.5 transition-colors ${likedPosts.has(post.id) ? 'text-rose-500' : 'hover:text-rose-500'}`}
                                    >
                                        <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-rose-500' : ''}`} />
                                        좋아요 {post.likes}
                                    </button>
                                    <div className="flex items-center gap-1.5">
                                        <MessageSquare className="w-4 h-4" />
                                        댓글 {post.comments.length}
                                    </div>
                                </div>

                                {/* 댓글 목록 */}
                                {post.comments.length > 0 && (
                                    <div className="flex flex-col gap-3 mb-4 bg-slate-50/50 p-3 rounded-2xl">
                                        {post.comments.map(comment => (
                                            <div key={comment.id} className="text-sm">
                                                <span className="font-bold text-slate-800 mr-2">{comment.authorName}</span>
                                                <span className="text-slate-600">{comment.content}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* 댓글 달기 인풋 */}
                                <form onSubmit={(e) => handleAddComment(post.id, e)} className="flex items-center gap-2 relative mt-4">
                                    <input
                                        type="text"
                                        value={commentInput[post.id] || ''}
                                        onChange={(e) => setCommentInput(prev => ({ ...prev, [post.id]: e.target.value }))}
                                        placeholder="댓글 달기..."
                                        className="w-full bg-slate-50 text-sm py-2.5 px-4 rounded-full border-none outline-none focus:ring-2 ring-indigo-100 pr-12"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!commentInput[post.id]?.trim()}
                                        className="absolute right-1 top-1 p-1.5 bg-indigo-500 text-white rounded-full disabled:opacity-0 transition-opacity"
                                    >
                                        <Send className="w-4 h-4 ml-0.5" />
                                    </button>
                                </form>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
