// src/components/Mention.tsx
import React, { useState, useEffect } from 'react';
import { useBoardStorage } from './useBoardStorage';

// 定义组件接收的 props 类型
interface MentionProps {
    bot: string;
    tid: string; // 尽管 endpoint 中 tid 后面有 '?'，但根据描述，它是作为参数接收的，并参与路径构建
    query: string;
}


const Mention: React.FC<MentionProps> = ({ bot, tid, query }) => {
    const [, addBoard,] = useBoardStorage();

    const [data, setData] = useState<any | null>(null)


    useEffect(() => {
        const fetchData = async () => {
            setData(null); // 清除上次的数据

            const encodedQuery = encodeURIComponent(query);
            // 构建完整的 endpoint URL
            const url = `/api/v2/bot/${bot}/${tid}?q=${encodedQuery}`;

            // 真实应用的 fetch 示例
            const controller = new AbortController();
            const signal = controller.signal;

            try {
                const response = await fetch(url, { signal });
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
                }
                const result = await response.json();
                setData(result);
            } catch (err: any) {
                if (err.name === 'AbortError') {
                    console.log('Fetch aborted');
                } else {
                    // setError(err.message || 'An unknown error occurred');
                    setData(null);
                }
            }

            return () => {
                controller.abort(); // 清理函数，在组件卸载或依赖项改变时取消未完成的请求
            };
        };

        fetchData();
    }, [bot, tid, query]); // 依赖项数组，当这些 props 改变时重新运行 useEffect

    if (data === null) return null;

    if (data['@type'] === 'text' && data.text) return (
        <div className="rounded-xl bg-gray-200 hover:bg-gray-300 duration-300 text-black border-2 border-gray-200 p-2 w-[fit-content]" >
            {data.text}
        </div>
    );

    if (data['@type'] === 'board' && data.bid) return (
        <button
            className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
            onClick={() => { addBoard(data.bid, data.name ? data.name : data.bid); location.reload() }}
        >
            添加板块: {data.name ? data.name : data.bid}
        </button>
    );

    return null;
};

export default Mention;