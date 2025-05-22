const API_BASE_URL = '/api/v2/'; // Adjust if your Vite proxy or API URL is different

const constructImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path; // Already a full URL
    return `https://image.nmb.best/image/${path}`;
}

const constructThumbUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path; // Already a full URL, though unlikely for thumbs
    return `https://image.nmb.best/thumb/${path}`;
}

// Helper to parse thread/reply data
const parseItemData = (item) => ({
    ...item,
    id: String(item.id), // Ensure ID is a string if used as key directly
    no: String(item.no),
    time: item.ts, // ts is the timestamp string from API
    title: item.t || "无标题",
    name: item.n || "无名氏",
    content: item.txt,
    image: item.p ? constructImageUrl(item.p) : null,
    thumbnail: item.p ? constructThumbUrl(item.p) : null,
    replies: item.list ? item.list.map(parseItemData) : [],
    replyCount: item.num || 0, // num seems to be reply_num for main threads from board
    isSage: item.txt && item.txt.toLowerCase().includes('sage'), // Simple check, might need refinement
    isPo: item.isPo || false, // You might need to determine this based on context or API
});


export const fetchBoardThreads = async (boardId = 1, page = 1) => {
    // API uses 0-indexed pages for pn, UI usually uses 1-indexed.
    const response = await fetch(`${API_BASE_URL}?bid=${boardId}&pn=${page - 1}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return (data || []).map(parseItemData);
};

export const fetchThreadDetails = async (threadId, page = 1) => {
    const response = await fetch(`${API_BASE_URL}?tid=${threadId}&pn=${page - 1}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return parseItemData(data);
};

export const fetchBoards = async () => {
    // This is a mock. Replace with actual API if available.
    return [
        { id: 1, name: "综合线", timelineId: 1, type: 'timeline', description: "不包含部分特殊版块" },
        { id: 2, name: "创作线", timelineId: 2, type: 'timeline', description: "创作相关内容" },
        { id: 3, name: "非创作线", timelineId: 3, type: 'timeline', description: "非创作内容讨论" },
        { id: 4, name: "亚文化线", timelineId: 4, type: 'timeline', description: "亚文化相关内容" },
        { id: 5, name: "综合2线", timelineId: 5, type: 'timeline', description: "综合版2" },
        { id: 6, name: "游戏线", timelineId: 6, type: 'timeline', description: "游戏相关讨论" },
        { id: 7, name: "生活线", timelineId: 7, type: 'timeline', description: "生活日常分享" },
        // ... other timelines
        { name: "亚文化", isCategoryHeader: true, items: [
            { name: "婆罗门一", id: "F_婆罗门一", slug: "婆罗门一", type: 'forum' },
            { name: "漫画", id: "F_漫画", slug: "漫画", type: 'forum' },
            { name: "动画综合", id: "F_动画综合", slug: "动画综合", type: 'forum' },
            { name: "电影/电视", id: "F_影漫", slug: "影漫", type: 'forum' },
            // ... add all others
          ]
        },
        // ... Add other main categories (综合, 创作, 游戏, 生活, 管理)
        // Example for a category that is not a timeline:
        { name: "综合", isCategoryHeader: true, items: [
            { name: "综合版1", id: "F_综合版1", slug: "综合版1", type: 'forum' },
            // ... more items
          ]
        },
        { name: "功能", isCategoryHeader: true, isHeaderOnly: true, items: [
            { name: "用户系统(new)", href: "/Member", specialStyle: "text-red-500" },
            { name: "手机版(new)", href: "/Mobile" },
            { name: "普通版", href: "/Forum" },
            { name: "订阅", href: "/feed" },
          ]
        },
    ];
};

export const submitPost = () => {

}