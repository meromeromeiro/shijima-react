const API_BASE_URL = '/api/v2'; // Adjust if your Vite proxy or API URL is different

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
    // The API for board returns an array of threads directly
    return (data || []).map(parseItemData);
};

export const fetchThreadDetails = async (threadId, page = 1) => {
    const response = await fetch(`${API_BASE_URL}?tid=${threadId}&pn=${page - 1}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // The API for thread returns a single thread object with its 'list' (replies)
    return parseItemData(data);
};

// Placeholder for boards list if it's dynamic, otherwise hardcode in OffCanvasMenu
export const fetchBoards = async () => {
    // This is a mock. Replace with actual API if available.
    return [
        { id: 1, name: "综合线", timelineId: 1, type: 'timeline' },
        { id: 2, name: "创作线", timelineId: 2, type: 'timeline' },
        // ... other timelines
        { id: "婆罗门一", name: "婆罗门一", type: 'forum', slug: '婆罗门一'},
        { id: "漫画", name: "漫画", type: 'forum', slug: '漫画'},
        // ... other forums
    ];
};