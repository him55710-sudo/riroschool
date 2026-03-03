export interface SummaryData {
    id: string;
    title: string;
    heroSubtitle: string;
    heroTitleLine1: string;
    heroTitleLine2: string;
    heroTitleGradient: string;
    heroDesc: string;
    cards: {
        emoji: string;
        frontTitle: string;
        backTitle: string;
        backDesc: string;
    }[];
    coreMessageSubtitle: string;
    coreMessageTitleLine1: string;
    coreMessageTitleLine2: string;
    coreMessageDesc: string;
    equation: {
        leftEmoji: string;
        leftTitle: string;
        leftDesc: string;
        rightEmoji: string;
        rightTitle: string;
        rightDesc: string;
        resultEmoji: string;
        resultTitle: string;
        resultDesc: string;
    };
    chapters: {
        id: string;
        tabTitle: string;
        title: string;
        titleColor: string;
        desc: string;
        pointTitle: string;
        pointTitleColor: string;
        pointDesc: string;
        pointBgColor: string;
        pointBorderColor: string;
    }[];
    theologySubtitle: string;
    theologyTitle: string;
    theologyDesc: string;
    qna: {
        q: string;
        a: string;
        highlightText?: string;
        highlightColor?: string;
    }[];
}

export const BOOK_SUMMARIES: SummaryData[] = [
    {
        id: 'titus',
        title: '디도서',
        heroSubtitle: '고등학생을 위한 성경 언박싱 🎁',
        heroTitleLine1: '바른 믿음, ',
        heroTitleLine2: '빛나는 삶.',
        heroTitleGradient: 'from-blue-600 to-orange-500',
        heroDesc: "사도 바울이 거친 섬마을에 남겨진 청년 사역자 '디도'에게 보낸 리얼 목회 매뉴얼.\n학교와 학원 사이, 세상 속에서 크리스천으로 어떻게 살아야 할지 헷갈린다면 스크롤을 내려봐!",
        cards: [
            {
                emoji: '✍️',
                frontTitle: '누가 누구에게?',
                backTitle: '바울 ➡️ 디도',
                backDesc: "위대한 사도 바울이 자신이 매우 아끼는 이방인(헬라인) 출신 제자이자 동역자인 '디도'에게 보낸 편지야."
            },
            {
                emoji: '🏝️',
                frontTitle: '배경 장소는?',
                backTitle: '크레타 (그레데)',
                backDesc: '당시 "크레타인은 뻥쟁이에 게으름뱅이"라는 속담이 있을 정도로 도덕적으로 타락하고 험난했던 사역지였어.'
            },
            {
                emoji: '🎯',
                frontTitle: '기록 목적은?',
                backTitle: '교회 바로 세우기',
                backDesc: '엉망인 크레타 교회를 바로잡고, 바른 리더를 세우며, 이단들을 막아내기 위한 실전 행동 지침서!'
            }
        ],
        coreMessageSubtitle: 'CORE MESSAGE',
        coreMessageTitleLine1: '신앙의 완벽한 결합 ',
        coreMessageTitleLine2: '교리 ➕ 삶',
        coreMessageDesc: '디도서의 핵심은 "바른 교훈(진리)은 반드시 선한 행실(삶)로 이어져야 한다"는 것이야. 머리로만 아는 지식이 아니라, 바른 믿음에 일상 속 착한 행실이 더해질 때 비로소 세상에 "살아있는 복음"으로 증명된단다.',
        equation: {
            leftEmoji: '📖', leftTitle: '바른 교리', leftDesc: '흔들림 없는 진리',
            rightEmoji: '🏃‍♂️', rightTitle: '선한 행실', rightDesc: '세상 속 착한 행동',
            resultEmoji: '✨', resultTitle: '살아있는 복음', resultDesc: '세상을 변화시키는 능력',
        },
        chapters: [
            {
                id: 'titus_ch1', tabTitle: '1장: 리더의 자격',
                title: '👑 1장: 참된 리더의 자격 & 거짓 교사 경고',
                titleColor: 'text-blue-800',
                desc: '교회를 이끌 리더는 어떤 사람이어야 할까? 단순히 인기 많은 사람이 아니야. 삶이 깨끗하고 가정을 잘 돌보며, 진리의 말씀을 굳게 잡는 사람이어야 해. 반대로 거짓말하는 이단 교사들은 단호하게 꾸짖어야 한다고 명령해.',
                pointTitle: '🔥 고딩 적용 포인트',
                pointTitleColor: 'text-blue-900',
                pointBgColor: 'bg-blue-50',
                pointBorderColor: 'border-blue-100',
                pointDesc: '어떤 리더를 따를 것인가? "저 사람 진짜 예수님 믿는 사람 맞네"라는 소리가 나오는 사람을 멘토로 삼자. 또 유튜브에 떠도는 이상한 신앙 콘텐츠에는 단호하게 "NO" 할 수 있는 분별력이 필요해.'
            },
            {
                id: 'titus_ch2', tabTitle: '2장: 세대별 꿀팁',
                title: '👨‍👩‍👧‍👦 2장: 건강한 교회를 위한 라이프스타일',
                titleColor: 'text-orange-600',
                desc: '바울은 나이 든 사람, 젊은 사람 등 각 그룹에 맞춤 조언을 줘. 핵심은 "하나님의 은혜를 입은 자답게 세상의 정욕을 버리고 세상에서 신중하고 의롭게 살라"는 것. 이것이 복음을 아름답게 빛내는 길이야.',
                pointTitle: '🔥 고딩 적용 포인트',
                pointTitleColor: 'text-orange-900',
                pointBgColor: 'bg-orange-50',
                pointBorderColor: 'border-orange-100',
                pointDesc: '바울은 우리 청소년들에게 "신중해라(Self-controlled)"라고 권면해. 유튜브 도파민, 자극적인 문화에 휩쓸리지 않고 자신의 시간과 마음을 통제하는 절제력이 구별된 진짜 폼나는 모습이야.'
            },
            {
                id: 'titus_ch3', tabTitle: '3장: 세상 속 크리스천',
                title: '🌍 3장: 무개념 세상에서 개념있게 살기',
                titleColor: 'text-green-700',
                desc: '우리는 교회 안에만 사는 게 아니야. 세상 속에서 권위(학교, 국가)에 순종하고 남을 헐뜯지 않으며 관용을 베풀어야 해. 소모적인 말싸움을 일으키는 행동은 피하는 게 진짜 지혜야.',
                pointTitle: '🔥 고딩 적용 포인트',
                pointTitleColor: 'text-green-900',
                pointBgColor: 'bg-green-50',
                pointBorderColor: 'border-green-100',
                pointDesc: '우리는 왜 착하게 살아야 할까? "하나님의 그 크신 자비와 사랑이 나타나서 우리를 구원하셨기 때문"이야. 내가 받은 십자가의 은혜가 너무 크니까 기쁨으로 착하게 사는 거지!'
            }
        ],
        theologySubtitle: 'THEOLOGY',
        theologyTitle: '합동 POINT (개혁주의)',
        theologyDesc: '대한예수교장로회(합동) 교단의 핵심인 개혁주의 신학 관점에서 디도서를 해석합니다.',
        qna: [
            {
                q: "Q1. 착하게 살아야 구원받는 건가요? (행위구원 vs 오직은혜)",
                highlightText: "우리가 행한 바 의로운 행위로 말미암지 아니하고 오직 그의 긍휼하심을 따라...",
                highlightColor: "text-orange-500",
                a: "절대 아닙니다! 디도서 3장 5절은 우리의 선행이 구원의 조건이 아님을 못 박습니다. 개혁주의 신학의 핵심인 '오직 은혜(Sola Gratia)'로 구원받은 결과, 감사의 열매로 선행이 따라오는 것입니다."
            },
            {
                q: "Q2. 개혁주의에서 말하는 '성화'란 뭔가요?",
                highlightText: "세상 정욕을 버리고 신중함과 의로움과 경건함으로 이 세상에 살고",
                highlightColor: "text-blue-500",
                a: "구원받은 하나님의 자녀가 일상 속 죄와 싸우며 예수님을 닮아가는 과정을 '성화'라고 합니다. 디도서 2:12 말씀이 바로 성화의 삶입니다. 진짜 바른 교리는 반드시 거룩한 삶의 훈련을 동반합니다."
            },
            {
                q: "Q3. 장로와 감독 같은 직분 제도는 왜 중요한가요?",
                highlightText: "",
                a: "우리 교단은 '장로교'입니다. 특정 교황 한 명이 지배하는 것이 아니라, 회중이 선출하고 말씀에 굳게 선 장로들의 회의를 통해 다스리는 성경적 제도입니다. 바울이 디도에게 장로를 세우라고 명령한 것이 장로교 정치의 기초입니다."
            }
        ]
    },
    {
        id: 'hebrews',
        title: '히브리서',
        heroSubtitle: '예수님이 킹왕짱! 👑',
        heroTitleLine1: '더 나은 분, ',
        heroTitleLine2: '오직 예수.',
        heroTitleGradient: 'from-purple-600 to-indigo-500',
        heroDesc: "유대교로 다시 돌아가려는 성도들에게 '예수님이 왜 이 세상 모든 것보다 위대하신지' 논증한 끝판왕 편지.\n믿음 때문에 핍박받고 흔들릴 때, 시선을 예수님께 고정시켜주는 확실한 내비게이션!",
        cards: [
            {
                emoji: '✍️',
                frontTitle: '누가 썼을까?',
                backTitle: '아무도 모름 (하나님만)',
                backDesc: "바울, 아볼로, 바나바 등 여러 추측이 있지만 저자의 이름이 적혀 있지 않아. 하지만 분명한 건 성령의 감동으로 기록된 오류 없는 말씀이라는 것!"
            },
            {
                emoji: '🏃‍♂️',
                frontTitle: '수신자는 누구?',
                backTitle: '흔들리는 유대인 십대들',
                backDesc: "로마 제국의 심한 핍박 때문에, 차라리 옛날처럼 율법을 지키는 '유대교'로 되돌아가려고 고민하는 유대인 크리스천들에게 썼어."
            },
            {
                emoji: '🎯',
                frontTitle: '기록 목적은?',
                backTitle: '예수님이 최고다!',
                backDesc: "천사, 모세, 여호수아, 대제사장 등 구약의 어떤 위대한 인물이나 의식보다 '예수 그리스도'가 훨씬 우월하시니 끝까지 믿음을 지켜라!"
            }
        ],
        coreMessageSubtitle: 'CORE MESSAGE',
        coreMessageTitleLine1: '절대 변하지 않는 진리 ',
        coreMessageTitleLine2: '오직 예수 ➕ 끝까지 인내',
        coreMessageDesc: '히브리서의 핵심은 "과거의 그림자(구약 제사)에 머물지 말고 실체이신 창조주 예수님을 바라보라"야. 핍박 속에서도 믿음의 선진들처럼 포기하지 않고 끝까지 믿음의 경주를 완주하는 것이 진짜 구원받은 백성의 모습이란다.',
        equation: {
            leftEmoji: '👑', leftTitle: '우월하신 예수', leftDesc: '구약의 성취자',
            rightEmoji: '💪', rightTitle: '믿음의 인내', rightDesc: '포기하지 않는 삶',
            resultEmoji: '🏆', resultTitle: '영광의 면류관', resultDesc: '영원한 하나님 나라',
        },
        chapters: [
            {
                id: 'heb_ch1', tabTitle: '1-6장: 예수님이 최고야',
                title: '👑 1~6장: 천사보다 모세보다 뛰어나신 예수님',
                titleColor: 'text-purple-800',
                desc: '천사들은 그저 심부름꾼일 뿐이고, 위대한 리더 모세는 그저 집의 맡은 일꾼이었어. 하지만 예수님은 그 집 자체를 지으신 아들이시고 창조주 하나님이셔! 그러니 예수님이 주신 구원을 꽉 잡아야 해.',
                pointTitle: '🔥 고딩 적용 포인트',
                pointTitleColor: 'text-purple-900',
                pointBgColor: 'bg-purple-50',
                pointBorderColor: 'border-purple-100',
                pointDesc: '내가 가장 멋지다고 생각하는 우상이나 게임, 돈, 명예보다 예수님이 비교할 수 없을 만큼 가치 있는 분이라는 걸 머리가 아닌 가슴으로 인정하기! 세상의 하찮은 것에 십자가를 팔아먹지 말자.'
            },
            {
                id: 'heb_ch2', tabTitle: '7-10장: 완벽한 대제사장',
                title: '🎚️ 7~10장: 단번에 영원히 끝내신 완벽한 제사',
                titleColor: 'text-indigo-600',
                desc: '구약의 제사장들은 죄인이었고 죽어서 매번 바뀌어야만 했어. 제물인 양과 소도 계속 피 흘려야 했지. 하지만 죄가 없으신 영원한 대제사장 예수님이 십자가에서 직접 자신을 제물로 드림으로 "단번에 영원히(Once for All)" 우리의 죄 문제를 완벽하게 끝내셨어!',
                pointTitle: '🔥 고딩 적용 포인트',
                pointTitleColor: 'text-indigo-900',
                pointBgColor: 'bg-indigo-50',
                pointBorderColor: 'border-indigo-100',
                pointDesc: '우리는 내 죄 때문에 죄책감에 시달리며 "하나님이 나 같은 애도 용서하실까?" 걱정할 필요가 없어! 완벽한 예수님의 보혈 스티커가 내 이마에 딱 붙어있으니 당당하게 은혜의 보좌(예배 도구, 기도) 앞으로 나아가자.'
            },
            {
                id: 'heb_ch3', tabTitle: '11-13장: 믿음장 명예의 전당',
                title: '🏃‍♂️ 11~13장: 믿음의 찐 선배들처럼 달리기',
                titleColor: 'text-rose-700',
                desc: '히브리서 11장은 성경의 "믿음의 명예의 전당"이야. 아벨, 에녹, 노아, 아브라함, 모세... 이 선배들은 세상이 감당 못 할 핍박 속에서도 하나님이 주실 상을 바라보며 기쁘게 고난을 견뎠어.',
                pointTitle: '🔥 고딩 적용 포인트',
                pointTitleColor: 'text-rose-900',
                pointBgColor: 'bg-rose-50',
                pointBorderColor: 'border-rose-100',
                pointDesc: '시험 기간에 주일 예배 가는 게 손해 같고, 학교에서 기독교인이라고 놀림당할 때 쫄지 마! 믿음의 선배들이 이룬 그 길 끝에는 영원한 MVP 트로피가 기다리고 있어. 믿음의 창시자이신 예수님만 뚫어지게 바라보자(Fix our eyes on Jesus).'
            }
        ],
        theologySubtitle: 'THEOLOGY',
        theologyTitle: '합동 POINT (개혁주의)',
        theologyDesc: '예수 그리스도의 유일성과 영원한 보증에 대한 우리의 믿음.',
        qna: [
            {
                q: "Q1. 예수님이 왜 굳이 사람이 되셔야만 했나요?",
                highlightText: "자녀들은 혈과 육에 속하였으매 그도 또한 같은 모양으로 혈과 육을 함께 지니심은...",
                highlightColor: "text-purple-500",
                a: "우리를 대신해서 피를 흘리어 죽으셔야 했기 때문입니다(속죄충족액). 개혁주의는 그리스도의 신성과 인성의 연합을 중시합니다. 완벽한 사람이어야 우리의 죄를 대신 짊어질 수 있고, 완벽한 하나님이어야 그 죽음의 가치가 무한대가 됩니다."
            },
            {
                q: "Q2. 구약의 율법이 다 폐지된 건가요?",
                highlightText: "더 좋은 언약, 새 언약",
                highlightColor: "text-indigo-500",
                a: "도덕법(십계명)은 폐지되지 않았습니다! 하지만 양을 잡고 제사를 드리는 '의식법'은 실체이신 예수님이 십자가에서 모두 다 이루셨기 때문에(성취) 더 이상 우리가 지킬 필요가 없어진 것입니다. 새 언약의 완성입니다."
            },
            {
                q: "Q3. 성도의 견인(Perseverance of the Saints)이 무엇인가요?",
                a: "한 번 진짜 예수님을 믿고 거듭난 성도는 어떠한 핍박이나 시험에도 불구하고 '절대로 구원을 잃어버리지 않고' 끝장까지 하나님께서 보호하시고 인도하신다는 합동 교단의 핵심 교리(칼빈주의 5대 교리)입니다. 믿음의 경주를 끝까지 완주할 힘은 하나님께 있습니다!"
            }
        ]
    },
    {
        id: 'james',
        title: '야고보서',
        heroSubtitle: '입으로만 믿는다고? 증명해봐! 팩트폭격 👊',
        heroTitleLine1: '행함이 없는 믿음은, ',
        heroTitleLine2: '죽은 것이다.',
        heroTitleGradient: 'from-emerald-600 to-teal-500',
        heroDesc: "초대교회의 기둥, 예수님의 친동생 야고보가 입으로만 '아멘'하고 삶은 엉망인 성도들을 향해 날리는 강력한 영적 팩트폭격기.\n우리의 신앙이 가짜가 아닌 진짜임을 어떻게 증명할 수 있을까?",
        cards: [
            {
                emoji: '✍️',
                frontTitle: '누가 썼을까?',
                backTitle: '예수님의 친동생 야고보',
                backDesc: "처음엔 형 예수님을 미쳤다고 조롱했지만, 부활하신 예수님을 뵙고 나서 초대 예루살렘 교회의 강력한 리더이자 순교자가 된 인물이야."
            },
            {
                emoji: '🗣️',
                frontTitle: '누구에게 썼나?',
                backTitle: '흩어진 열두 지파',
                backDesc: "핍박을 피해 로마 제국 전역으로 흩어져서 가난하게 살아가면서, 말로만 믿음을 떠들 뿐 삶의 변화가 없는 유대인 크리스천들."
            },
            {
                emoji: '🎯',
                frontTitle: '기록 목적은?',
                backTitle: '가짜 믿음 박살내기',
                backDesc: "입벌구(입만 벌리면 거짓말) 신앙에서 탈피하여, 고난을 인내하고 실천하는 '살아있는 참된 신앙'을 가르치기 위해!"
            }
        ],
        coreMessageSubtitle: 'CORE MESSAGE',
        coreMessageTitleLine1: '진짜 믿음의 증거 ',
        coreMessageTitleLine2: '행함으로 ➕ 증명하라',
        coreMessageDesc: '야고보서는 바울의 "믿음 오직 은혜"와 충돌하는 책이 절대 아니야! 오히려 바울이 말한 "진짜 구원받은 믿음"이라면 상식적으로 "착한 행동과 말의 통제"라는 열매가 자연스럽게 열려야 한다는 걸 역설적으로 강조하는 실천적 행동 지침서야.',
        equation: {
            leftEmoji: '🔥', leftTitle: '참된 믿음', leftDesc: '마음의 변화',
            rightEmoji: '🤲', rightTitle: '실제적 섬김', rightDesc: '말과 행동의 조절',
            resultEmoji: '🍎', resultTitle: '구원의 열매', resultDesc: '증명된 진짜 신앙',
        },
        chapters: [
            {
                id: 'jam_ch1', tabTitle: '1장: 시험과 극복',
                title: '🔥 1장: 고난의 시험을 레벌업의 기회로!',
                titleColor: 'text-emerald-800',
                desc: '시험(고난)을 만나면 오히려 온전히 기쁘게 여겨. 왜? 그 시험이 인내를 만들고 우리를 영적으로 튼튼한 어른으로 빚어주거든. 하지만 내 안의 욕심(정욕) 때문에 죄를 짓는 건 하나님의 시험이 아니라 내 탓이야.',
                pointTitle: '🔥 고딩 적용 포인트',
                pointTitleColor: 'text-emerald-900',
                pointBgColor: 'bg-emerald-50',
                pointBorderColor: 'border-emerald-100',
                pointDesc: '고등학교 올라와서 공부 압박과 친구 관계 스트레스가 심하지? 이걸 "나 왜 이렇게 재수 없지?" 하지 말고, 하나님께 지혜를 달라고 구하면서 단단해지는 레벨업 기간으로 삼자!'
            },
            {
                id: 'jam_ch2', tabTitle: '2장: 행함과 편애 금지',
                title: '⚖️ 2장: 금수저 차별 금지령 & 행함 있는 믿음',
                titleColor: 'text-teal-600',
                desc: '교회에 명품 옷 입고 부자인 사람 들어오면 맨 앞자리 VIP석 주고, 가난한 사람 오면 바닥에 앉으라고 차별하지 마! 그리고 가난한 사람을 보고 말로만 "잘 가라, 배부르게 먹어라"하면 무슨 소용이야? 실제 밥을 줘야 진짜 사랑이지. 영혼 없는 몸이 죽은 것처럼 행함 없는 믿음은 가짜야.',
                pointTitle: '🔥 고딩 적용 포인트',
                pointTitleColor: 'text-teal-900',
                pointBgColor: 'bg-teal-50',
                pointBorderColor: 'border-teal-100',
                pointDesc: '학교에서 잘생기고 공부 잘하고 인기 많은 애들한테만 친절하고, 조용하거나 소외된 친구들은 무시하는 거? 그거 아주 심각한 죄라고 야고보는 경고해! 왕따 당하는 친구 옆에서 진짜 친구가 되어주는 "행동"이 필요해.'
            },
            {
                id: 'jam_ch3', tabTitle: '3-5장: 입조심 작전',
                title: '🤐 3~5장: 세 치 혀 통제와 겸손한 삶',
                titleColor: 'text-cyan-700',
                desc: '작은 불씨 하나가 온 산을 태우듯이, 내 혀(말) 하나가 인생을 망칠 수 있어. 더불어 "내일 뭐해서 돈 벌어야지!" 하며 자기 맘대로 미래를 장담하지 마. 우리는 안개 같은 존재니까 오직 "주의 뜻이면 살리라"라고 하나님을 의지해야 해.',
                pointTitle: '🔥 고딩 적용 포인트',
                pointTitleColor: 'text-cyan-900',
                pointBgColor: 'bg-cyan-50',
                pointBorderColor: 'border-cyan-100',
                pointDesc: '카톡방 뒷담화, 디스코드에서 상대방 부모님 욕하는 패드립, 욕설 섞인 말들... 주일날 찬양했던 바로 그 입술로 친구를 저주하는 건 이중인격이야. 말 한마디를 내뱉기 전 3초만 하나님 생각을 해보자.'
            }
        ],
        theologySubtitle: 'THEOLOGY',
        theologyTitle: '합동 POINT (개혁주의)',
        theologyDesc: '바울의 이신칭의와 야고보의 행함 조화에 대한 칼빈주의적 답변.',
        qna: [
            {
                q: "Q1. 바울은 '믿음'으로 행위 없이 구원받는다 하고, 야고보는 '행함'으로 의롭다 하니 성경에 오류가 있는 것 아닐까요?",
                highlightText: "영혼 없는 몸이 죽은 것 같이 행함이 없는 믿음은 죽은 것이니라",
                highlightColor: "text-emerald-500",
                a: "오류가 아닙니다! 바울은 구원의 '조건(원인)'을 말하고 있고, 야고보는 구원받은 신앙의 진짜 '증명(결과)'을 말하고 있습니다. 개혁주의는 두 가지가 찰떡처럼 완벽한 조화를 이룬다고 믿습니다. 오직 믿음으로 구원받지만, 그 구원받는 믿음은 결코 '홀로' 있지 않고 반드시 '행함'을 데리고 다닙니다."
            },
            {
                q: "Q2. 율법을 단 하나만 어겨도 다 범한 것이라는데 너무 억울하지 않나요?",
                a: "이것이 바로 우리 인간이 전적으로 타락(Total Depravity)했고 스스로 무능력하다는 증거입니다. 99개를 잘 지켜도 1개의 팩트폭격 죄성에 찔려 지옥에 갈 수밖에 없는 존재가 바로 우리입니다. 그렇기에 우리에게는 완벽히 율법을 다 지켜내신 예수 그리스도의 은혜가 더욱더 절실히 필요한 것입니다!"
            }
        ]
    },
    {
        id: '1peter',
        title: '베드로전서',
        heroSubtitle: '나그네로 살아가는 용기 🛤️',
        heroTitleLine1: '불시험 속에서도 ',
        heroTitleLine2: '빛나는 소망.',
        heroTitleGradient: 'from-amber-500 to-red-500',
        heroDesc: "세상을 뒤집어놓던 불 같은 사도 베드로가 곧 다가올 끔찍한 로마의 핍박(네로 황제)을 예견하며 성도들에게 쓴 생존 격려 편지.\n'우리는 이 세상의 주인이 아니라 잠깐 머무는 본향을 향한 나그네다!'",
        cards: [
            {
                emoji: '✍️',
                frontTitle: '누가 썼을까?',
                backTitle: '수제자 베드로',
                backDesc: "갈릴리 평범한 어부에서, 세 번 예수님을 모른다고 부인했던 배신자에서, 초대 교회의 강력한 반석이자 목자가 된 바로 그 베드로."
            },
            {
                emoji: '🌍',
                frontTitle: '수신자는 누구?',
                backTitle: '소아시아의 나그네들',
                backDesc: "박해를 피해 지금의 터키 지방 여러 곳에 흩어져서, 사회적 왕따와 조롱을 견디며 살아가던 이방인 크리스천들에게 썼어."
            },
            {
                emoji: '🎯',
                frontTitle: '기록 목적은?',
                backTitle: '불시험 극복 격려',
                backDesc: "극심한 고난 속에서도 흔들리지 않는 산 소망을 품고, 거룩하게 살며 당당히 세상의 눈치를 보지 마라!"
            }
        ],
        coreMessageSubtitle: 'CORE MESSAGE',
        coreMessageTitleLine1: '십자가 고난 뒤 영광 ',
        coreMessageTitleLine2: '산 소망 ➕ 거룩한 삶',
        coreMessageDesc: '우리의 진정한 집은 이 땅(학교, 대학, 직장)이 아니라 영원한 천국에 있어. 마치 예수님이 십자가 고난 뒤에 부활의 영광을 누리신 것처럼, 지금 교회를 다니며 받는 무시나 조롱은 훗날 엄청난 칭찬과 상급으로 돌아올 "불시험"이자 테스트과정임을 명심해야 해.',
        equation: {
            leftEmoji: '🔥', leftTitle: '세상의 고난', leftDesc: '나그네로서의 차별',
            rightEmoji: '⚓', rightTitle: '산 소망', rightDesc: '천국을 향한 흔들림 없는 닻',
            resultEmoji: '💎', resultTitle: '단련된 정금', resultDesc: '예수님 다시 오실 때의 칭찬',
        },
        chapters: [
            {
                id: '1pet_ch1', tabTitle: '1-2장: 내가 누군지 알아?',
                title: '💎 1~2장: 택하신 족속, 왕 같은 제사장!',
                titleColor: 'text-amber-700',
                desc: '우리는 세상에 썩어질 금이나 은이 아니라, 흠 없는 어린양 같은 예수님의 보혈로 구원받은 엄청나게 V.I.P 스러운 존재들이야. 너희는 그저 그런 애들이 아니라 하나님의 소유가 된 "왕 같은 제사장"이라는 확실한 정체성을 가져.',
                pointTitle: '🔥 고딩 적용 포인트',
                pointTitleColor: 'text-amber-900',
                pointBgColor: 'bg-amber-50',
                pointBorderColor: 'border-amber-100',
                pointDesc: '학교에서 나만 기독교인이라 밥 먹을 때 기도하기 눈치 보일 때, "내가 누군데! 나는 왕의 자녀야!"라는 영적 자부심(국뽕 말고 주뽕!)을 가슴에 깊이 새기자.'
            },
            {
                id: '1pet_ch2', tabTitle: '3-4장: 까짓거 고난 덤벼',
                title: '🔥 3~4장: 이상한 일 당하는 걸 두려워 마라',
                titleColor: 'text-red-600',
                desc: '오히려 너희가 착한 일을 하다가 고난을 받으면 그게 진짜 하나님의 뜻이야. 세상 사람들이 너희를 욕하다가도, 결국 너희의 선한 삶을 보고 하나님께 영광을 돌리게 될 테니까 두려워 파싹 얼어붙지 마!',
                pointTitle: '🔥 고딩 적용 포인트',
                pointTitleColor: 'text-red-900',
                pointBgColor: 'bg-red-50',
                pointBorderColor: 'border-red-100',
                pointDesc: '예수님 믿는다고 체육시간이나 휴일 약속을 포기하고 교회 갔을 때, 친구들이 "너 왜 그렇게 사냐?" 하면, 짜증내지 말고 "나에겐 부활의 소망이 있거든😎"라고 여유롭게 웃어넘길 수 있는 멘탈을 챙겨보자.'
            }
        ],
        theologySubtitle: 'THEOLOGY',
        theologyTitle: '합동 POINT (개혁주의)',
        theologyDesc: '예정론과 삼위일체 하나님의 구원 사역.',
        qna: [
            {
                q: "Q1. 하나님이 나를 구원하시기로 미리 정하셨다는 '선택'이 진짜 성경에 있나요?",
                highlightText: "하나님 아버지의 미리 아심을 따라 성령이 거룩하게 하심으로 순종함과...",
                highlightColor: "text-amber-500",
                a: "네! 베드로전서 1장 2절에 완벽하게 나와 있습니다. 구원은 우연히 내가 똑똑해서 예수님을 믿은 것이 아니라, ①성부 하나님의 예정하심(미리 아심), ②성령 하나님의 거룩하게 하심, ③성자 예수님의 피뿌림(구속)이라는 삼위일체 하나님의 완벽한 팀워크로 이루어진 절대적인 합동 개혁주의 교리입니다."
            }
        ]
    },
    {
        id: '2peter',
        title: '베드로후서',
        heroSubtitle: '가짜가 판치는 세상, 마지막 경고 🚨',
        heroTitleLine1: '거짓을 이기는 ',
        heroTitleLine2: '확실한 지식.',
        heroTitleGradient: 'from-slate-700 to-sky-600',
        heroDesc: "순교를 직감한 노(老) 사도 베드로가 최후로 남긴 유언장.\n'예수님 다시 안 오셔! 맘대로 살아!'라고 꼬드기는 무서운 이단 교사들을 조심하고, 성경 말씀을 확실하게 알라는 마지막 피 토하는 외침!",
        cards: [
            {
                emoji: '✍️',
                frontTitle: '누가 썼을까?',
                backTitle: '사도 베드로 (유언)',
                backDesc: "인생의 마지막 순간, 로마 네로 황제에게 순교당하기 직전(십자가를 거꾸로 짐) 제자들에게 마지막 당부를 남긴 편지야."
            },
            {
                emoji: '⚔️',
                frontTitle: '무슨 일이 있었나?',
                backTitle: '내부의 적 (이단 교사)',
                backDesc: "외부의 핍박보다 무서운 건 내부의 썩음이지. '재림(예수님 오심)이 어디 있냐? 육체론 맘대로 놀고 죄지어도 구원받아!'라고 헛소리하는 이단들이 교회 안에 침투했어."
            },
            {
                emoji: '🎯',
                frontTitle: '기록 목적은?',
                backTitle: '영적 성장 & 재림 확신',
                backDesc: "바른 진리(하나님의 말씀)를 통해 예수님을 아는 지식에서 자라가고, 도둑같이 임하실 주의 날을 거룩하게 준비하기 위해!"
            }
        ],
        coreMessageSubtitle: 'CORE MESSAGE',
        coreMessageTitleLine1: '진리를 아는 지식 ',
        coreMessageTitleLine2: '바른 말씀 ➕ 재림 소망',
        coreMessageDesc: '베드로후서의 핵심은 "영적 지식의 성장"이야. 성경 말씀을 바르게 알아야 이단들에게 속지 않아. 예수님의 재림이 늦어지는 건 하나님이 안 계셔서가 아니라, 단 한 명의 사람이라도 더 회개하게 하시려고 끝까지 참고 기다려주시는 하나님의 사랑 때문이야.',
        equation: {
            leftEmoji: '🧬', leftTitle: '신성한 성품', leftDesc: '믿음에서 사랑까지',
            rightEmoji: '🕰️', rightTitle: '주의 날 대망', rightDesc: '거룩한 행실로 그날을 기다림',
            resultEmoji: '🛡️', resultTitle: '강력한 이단 방어', resultDesc: '절대 넘어지지 않음',
        },
        chapters: [
            {
                id: '2pet_ch1', tabTitle: '1장: 신성한 성품(영적 레벨업)',
                title: '🧬 1장: 8단계 영적 스킬트리 마스터하기',
                titleColor: 'text-sky-700',
                desc: '믿음에 덕, 지식, 절제, 인내, 경건, 형제우애, 그리고 마지막 정점인 "사랑"을 공급하며 영적 스킬 레벨업을 하라. 이것이 우리가 넘어지지 않고 예수님 나라에 넉넉히 들어가는 열쇠야. 성경은 선지자의 뇌피셜(혼잣말)이 아니라 성령이 주신 가장 확실한 예언의 말씀이야.',
                pointTitle: '🔥 고딩 적용 포인트',
                pointTitleColor: 'text-sky-900',
                pointBgColor: 'bg-sky-50',
                pointBorderColor: 'border-sky-100',
                pointDesc: '게임 캐릭터 레벨만 올릴 게 아니라 내 영혼의 레벨이 오르고 있는지 체크해봐! 작년보다 더 절제하고, 친구를 더 사랑할 수 있게 크는 것이 핵심이야. 그러려면 이단 사이비(신천지 등) 영상 끄고 진짜 큐티 말씀을 읽어야 해.'
            },
            {
                id: '2pet_ch2', tabTitle: '2-3장: 주의 날의 약속',
                title: '🔥 2~3장: 이단들의 최후와 지구 리셋',
                titleColor: 'text-slate-700',
                desc: '자유를 준다고 속이면서 결국 파멸로 끌고 가는 이단 교사들은 어마어마한 심판을 받을 거야. 사람들이 "예수님 언제 오냐?" 비웃어도, 주님 앞에는 하루가 천 년 같대. 그날이 오면 하늘과 땅이 뜨거운 불에 타서 체질이 녹아내릴 거고, 우리는 새 하늘과 새 땅을 보게 될 거야.',
                pointTitle: '🔥 고딩 적용 포인트',
                pointTitleColor: 'text-slate-900',
                pointBgColor: 'bg-slate-50',
                pointBorderColor: 'border-slate-100',
                pointDesc: '종말을 두려워하거나 반대로 좀비물 영화처럼 장난스럽게 여기지 말자. "그날이 도둑같이 급하게 올 텐데, 난 어떻게 준비되어 있지?" 핸드폰만 하다가 예수님 마주치지 말고, 거룩한 청소년으로 당당히 하이파이브 할 준비를 하자.'
            }
        ],
        theologySubtitle: 'THEOLOGY',
        theologyTitle: '합동 POINT (개혁주의)',
        theologyDesc: '성경의 절대적인 영감설(무오성)과 최후 심판(종말론).',
        qna: [
            {
                q: "Q1. 성경은 그냥 옛날 똑똑한 사람들이 쓴 역사책 아닌가요?",
                highlightText: "예언은 언제든지 사람의 뜻으로 낸 것이 아니요 오직 성령의 감동하심을 받은 사람들이 하나님께 받아 말한 것임이라",
                highlightColor: "text-sky-500",
                a: "절대 아닙니다! 이것을 개혁주의에서 가장 중요하게 여기는 '성경의 유기적 영감설'이라고 합니다. 오류 없는 성령님이 저자들의 성향에 맞게 간섭하셔서 단 하나의 오차도 없이 기록하신 진리의 말씀이라는 뜻입니다. J*S 나 신*지 교주들의 말은 여기에 비빌 수 없습니다."
            },
            {
                q: "Q2. 예수님이 다시 오신다고 하신 지 2000년이 넘었는데 지각하시는 거 아닌가요?",
                a: "하나님의 시간표(카이로스)와 우리의 시계(크로노스)는 아예 다릅니다. 하나님 편에서는 지각이 아니라, 당신의 남은 택한 백성 중 단 한 사람이라도 다 회개하고 십자가 밑으로 돌아오도록 상상 초월의 인내로 기다려주시는 은혜의 시간 연장입니다."
            }
        ]
    }
];
