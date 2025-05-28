import { useState, useEffect, useCallback } from 'react';

interface BoardsData {
    [id: string]: string; // Key is string (from id.toString()), value is title
}

const BOARD_STORAGE_KEY = 'board';

/**
 * 从 localStorage 读取 'board' 数据。
 * 处理 JSON 解析错误。
 * @returns {BoardsData} 解析后的看板数据对象，或空对象。
 */
function readBoardFromStorage(): BoardsData {
    try {
        const item = localStorage.getItem(BOARD_STORAGE_KEY);
        // 如果 localStorage 中没有该项，则返回空对象
        // 如果有，尝试解析。确保解析结果是对象类型。
        const parsed = item ? JSON.parse(item) : {};
        if (typeof parsed === 'object' && parsed !== null) {
            return parsed;
        }
        console.warn(`localStorage key "${BOARD_STORAGE_KEY}" contained non-object data. Initializing as empty object.`);
        return {};
    } catch (error) {
        console.error(`Error parsing localStorage key "${BOARD_STORAGE_KEY}":`, error);
        return {}; // 解析失败时返回空对象
    }
}

/**
 * React Hook，用于管理和监听 localStorage 中 'board' 项的变化。
 * 'board' 项存储的是一个 JSON 字符串，格式为 { [id: string]: title: string }。
 *
 * @returns {[BoardsData, (id: number, title: string) => void, (id: number) => void]}
 *          返回一个数组：
 *          - 当前的看板数据对象。
 *          - `addBoard` 函数：用于添加或修改看板条目。
 *          - `removeBoard` 函数：用于删除看板条目。
 */
export function useBoardStorage(): [BoardsData, (id: number, title: string) => void, (id: number) => void] {
    // 1. 初始状态：从 localStorage 读取
    const [boards, setBoards] = useState<BoardsData>(readBoardFromStorage());

    // 2. 监听 localStorage 的 'storage' 事件（用于跨标签页同步）
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            // 确保是 BOARD_STORAGE_KEY 发生了变化
            if (event.key === BOARD_STORAGE_KEY) {
                // 当其他标签页修改了数据时，重新读取并更新本标签页的状态
                setBoards(readBoardFromStorage());
                console.log(`Board data updated from other tab/window.`);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // 清理函数：组件卸载时移除事件监听器
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []); // 依赖项为空数组，表示只在组件挂载和卸载时执行

    // 3. `addBoard` 函数：用于添加或修改看板，并同步更新状态
    const addBoard = useCallback((id: number, title: string): void => {
        // 为了防止 stale closure，总是从 localStorage 读取最新数据再修改
        // 这对于多标签页场景的并发修改很重要
        const currentBoards = readBoardFromStorage();
        const newBoards = { ...currentBoards, [id.toString()]: title };

        try {
            localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(newBoards));
            setBoards(newBoards); // 更新 React 状态，确保当前标签页 UI 立即更新
            console.log(`Board with ID ${id} and title "${title}" successfully added/updated.`);
        } catch (error) {
            console.error(`Error saving board data to localStorage for ID ${id}:`, error);
        }
    }, []); // addBoard 函数不需要依赖，因为它内部通过 readBoardFromStorage 获取最新值

    // 4. `removeBoard` 函数：用于删除看板，并同步更新状态
    const removeBoard = useCallback((id: number): void => {
        const currentBoards = readBoardFromStorage();
        const newBoards = { ...currentBoards };
        delete newBoards[id.toString()]; // 删除指定 ID 的项

        try {
            localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(newBoards));
            setBoards(newBoards); // 更新 React 状态
            console.log(`Board with ID ${id} successfully removed.`);
        } catch (error) {
            console.error(`Error removing board data from localStorage for ID ${id}:`, error);
        }
    }, []);

    // 返回当前 boards 数据和操作函数
    return [boards, addBoard, removeBoard];
}

// --- 使用示例 ---
/*
// 在一个 React 组件中：

import React, { useEffect } from 'react';
import { useBoardStorage } from './useBoardStorage'; // 假设你的 Hook 文件名为 useBoardStorage.ts

function BoardManagementComponent() {
    // 使用 Hook，获取看板数据和操作函数
    const [boards, addBoard, removeBoard] = useBoardStorage();

    useEffect(() => {
        // 组件首次渲染时，添加一些示例数据
        addBoard(1, "我的第一个项目");
        addBoard(2, "待办事项列表");
        console.log("Initial boards after adding:", boards);
    }, []); // 空数组表示只在挂载时执行一次

    const handleUpdateBoard = () => {
        addBoard(1, "已完成的项目"); // 更新 ID 为 1 的看板
    };

    const handleAddAnotherBoard = () => {
        const newId = Date.now(); // 简单生成一个唯一 ID
        addBoard(newId, `新看板 ${newId}`);
    };

    const handleRemoveBoard2 = () => {
        removeBoard(2);
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
            <h2>我的看板</h2>
            <p>当前 localStorage 中的 Board 数据:</p>
            <pre>{JSON.stringify(boards, null, 2)}</pre>

            <button onClick={handleUpdateBoard} style={{ margin: '5px' }}>
                更新 "我的第一个项目"
            </button>
            <button onClick={handleAddAnotherBoard} style={{ margin: '5px' }}>
                添加新看板
            </button>
            <button onClick={handleRemoveBoard2} style={{ margin: '5px' }}>
                删除 ID 为 2 的看板
            </button>

            <h3>所有看板列表:</h3>
            <ul>
                {Object.entries(boards).map(([id, title]) => (
                    <li key={id}>
                        ID: {id}, Title: {title}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default BoardManagementComponent;
*/