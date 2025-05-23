// Represents a single thread or a reply within a thread
interface Thread {
    t?: string;         // title (无标题), optional as per json:",omitempty"
    n?: string;         // name (无名氏), optional as per json:",omitempty"
    ts?: string;         // timestamp (e.g., "2022-10-16(日)23:14:27")
    id: string;         // user identity (e.g., "Admin", "F7nfJr2")
    no: number;         // number (post number, e.g., 52752005) - uint in Go, number in TS
    p?: string;         // picture src (e.g., "2025-01-15/678787a6e4cb4.jpg"), optional
    txt: string;        // content (HTML string)
    r?: number;         // reply to (parent thread's 'no'), hidden from JSON, but useful for client logic if fetched
    // del?: number;    // is deleted? (int8 in Go), hidden from JSON, usually not needed on client if API filters deleted
    // c?: string;      // country, hidden from JSON
    // ip?: string;     // ip address, hidden from JSON
    num?: number;       // reply_num from board (for main threads), or other numeric count, optional
    list?: Thread[];    // replies (array of Thread objects), optional

    // Client-side enhancements (optional, can be added during data parsing)
    isSage?: boolean;   // Derived from 'txt' content or a specific API field if available
    isPo?: boolean;     // Derived by comparing 'id' with the main thread's 'id'
    image?: string | null; // Full URL for the main image (derived from 'p')
    thumbnail?: string | null; // Full URL for the thumbnail (derived from 'p')
    replyCount?: number; // Often 'num' is used for this for main threads from board view
}

// Example usage:
// const exampleThread: Thread = {
//   t: "无标题",
//   n: "无名氏",
//   ts: "2022-10-16(日)23:14:27",
//   id: "Admin",
//   no: 52752005,
//   p: "2025-01-15/678787a6e4cb4.jpg",
//   txt: "欢迎来到X岛...",
//   num: 531, // Example reply count
//   list: [
//     {
//       ts: "2022-10-25(二)10:09:11",
//       id: "Admin",
//       no: 52946889,
//       txt: "常用串串号...",
//       // Other fields for a reply...
//     }
//   ]
// };

const API_BASE_URL = '/api/v2/'; // Adjust if your Vite proxy or API URL is different
const NULL_IMAGE_URL = 'https://moonchan.xyz/favicon.ico'

const constructImageUrl = (path: string) => {
    if (!path) return NULL_IMAGE_URL;
    if (path.startsWith('http')) return path; // Already a full URL
    return `https://image.nmb.best/image/${path}`;
}

const constructThumbUrl = (path: string) => {
    if (!path) return NULL_IMAGE_URL;
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


// page is 1 based
export const fetchBoardThreads = async (boardId = 1, page = 1) => {
    // API uses 0-indexed pages for pn, UI usually uses 1-indexed.
    const response = await fetch(`${API_BASE_URL}?bid=${boardId}&pn=${page - 1}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return (data || []).map(parseItemData);
};

// page is 1 based
export const fetchThreadDetails = async (threadId, page = 1) => {
    const response = await fetch(`${API_BASE_URL}?tid=${threadId}&pn=${page - 1}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return parseItemData(data);
};

export const getBoardStructure = async () => {
    // This is a mock. Replace with actual API if available.
    return [
        {
            id: 1,
            name: "闲聊",
            intro: "请期待破岛的完全体，不过真的有人期待么……",
        }, {
            id: 12,
            name: "串",
            intro: "这里可以演巨魔，所以其他板块就不行了",
        }, {
            id: 23,
            name: "打捞",
            intro: "用来转贴或者什么的，发点有趣的东西吧",
        }, {
            id: 34,
            name: "动画漫画"
        }, {
            id: 45,
            name: "贴图"
        }, {
            id: 46,
            name: "贴图(R18)",
            intro: "含有露骨的描写请慎重游览",
        }, {
            id: 47,
            name: "桃饱",
            intro: "客官请吃桃",
        }, {
            id: 101,
            name: "在这理发店",
            intro: "记得备份",
        }, {
            id: 102,
            name: "自习室",
            intro: "万古如长夜(注意备份),也欢迎一起发串的",
        }, {
            id: 104,
            name: "时尚",
            //                    intro : "别发轮子新闻",
        }, {
            id: 105,
            name: "Paper Reading",
        }, {
            id: 106,
            name: "意识形态分析",
        },

    ];
};

export const submitPost = async (data: Thread, bid: string, tid: string) => {
    const response = await fetch(`${API_BASE_URL}?bid=${bid}&tid=${tid}`, {
        method: "POST",
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
}

export const getCookie = async () => {
    const response = await fetch(`${API_BASE_URL}cookie`, {
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
}