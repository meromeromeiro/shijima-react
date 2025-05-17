import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { APIURL } from '../utils';

const initialBoards = [
    { id: 1, name: "闲聊", intro: "请期待破岛的完全体，不过真的有人期待么……" },
    { id: 12, name: "串", intro: "这里可以演巨魔，所以其他板块就不行了" },
    { id: 23, name: "打捞", intro: "用来转贴或者什么的，发点有趣的东西吧" },
    { id: 34, name: "动画漫画", intro: "" },
    { id: 45, name: "贴图", intro: "" },
    { id: 46, name: "贴图(R18)", intro: "含有露骨的描写请慎重游览" },
    { id: 47, name: "桃饱", intro: "客官请吃桃" },
    { id: 101, name: "在这理发店", intro: "记得备份" },
    { id: 102, name: "自习室", intro: "万古如长夜(注意备份),也欢迎一起发串的" },
    { id: 104, name: "时尚", intro: "" },
    { id: 105, name: "Paper Reading", intro: "" },
    { id: 106, name: "意识形态分析", intro: "" },
];

function Sidebar({ onBoardSelect, selectedBoardId }) {
    const navigate = useNavigate();
    const [boards] = useState(initialBoards); // In a real app, this might be fetched

    const handleViewBoard = (board) => {
        onBoardSelect(board);
        navigate(`/?bid=${board.id}`);
    };

    return (
        <aside className="fixed top-0 left-0 h-full bg-white text-shijima-text w-[135px] border-r border-black overflow-y-auto p-2 shadow-lg">
            <div className="text-center w-full">
                {/* <div className="my-5 mx-auto"> */}
                    {/* <img src="/mascot.webp" alt="Mascot" className="w-20 pl-5" /> */}
                {/* </div> */}
                <div className="mb-6 mt-5">
                    <a href="https://moonchan.xyz/" className="text-shijima-red-light hover:text-shijima-link-hover no-underline">
                        MoonChan.xyz
                        <br />
                        月岛匿名版
                    </a>
                </div>
                <div className="mb-3">
                    {boards.map((board) => (
                        <div
                            key={board.id}
                            className={`board-name py-1 px-2 cursor-pointer hover:bg-shijima-accent hover:text-white rounded ${selectedBoardId === board.id ? 'bg-shijima-accent text-white font-bold' : 'text-shijima-link'}`}
                            onClick={() => handleViewBoard(board)}
                        >
                            {/* Link component can be used for navigation, but onClick handles state updates */}
                            {board.name}
                        </div>
                    ))}
                </div>
                <div className="box mt-6">
                    <div className="board-name py-1 px-2">
                        <a href="/del.html" className="text-shijima-link hover:text-shijima-link-hover no-underline">自助删帖</a>
                    </div>
                    <div className="board-name py-1 px-2">
                        <a href="https://upload.moonchan.xyz/" className="text-shijima-link hover:text-shijima-link-hover no-underline">图床</a>
                    </div>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;