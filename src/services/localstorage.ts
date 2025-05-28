/**
 * 向 localStorage 的 'board' 项中添加或修改一个看板条目。
 * 'board' 项存储的是一个 JSON 字符串，格式为 { [id: string]: title: string }。
 *
 * @param id 看板的唯一标识符 (数字类型)。
 * @param title 看板的标题。
 */
export function addBoard(id: number, title: string): void {
    const boardKey = 'board';

    // 1. 从 localStorage 获取现有数据
    const storedBoardsJson = localStorage.getItem(boardKey);

    let boards: { [key: string]: string } = {}; // 定义一个对象来存储看板数据

    // 2. 解析数据，如果不存在或解析失败，则初始化为空对象
    if (storedBoardsJson) {
        try {
            const parsed = JSON.parse(storedBoardsJson);
            // 确保解析结果是一个对象，以防 localStorage 中存储了无效数据
            if (typeof parsed === 'object' && parsed !== null) {
                boards = parsed;
            } else {
                console.warn(`localStorage key "${boardKey}" contained non-object data. Initializing as empty object.`);
            }
        } catch (error) {
            console.error(`Error parsing localStorage key "${boardKey}":`, error);
            // 解析错误时，视作空数据，避免程序中断
            boards = {};
        }
    }

    // 3. 添加或修改指定 id 的看板标题
    // 注意：JSON 对象的键通常是字符串，所以将 id 转换为字符串
    boards[id.toString()] = title;

    // 4. 将更新后的数据转换回 JSON 字符串并存储
    try {
        localStorage.setItem(boardKey, JSON.stringify(boards));
        console.log(`Board with ID ${id} and title "${title}" successfully added/updated.`);
    } catch (error) {
        console.error(`Error saving board data to localStorage for ID ${id}:`, error);
    }
}

// --- 使用示例 ---

// 假设 localStorage 最初是空的
// addBoard(1, "我的第一个看板");
// addBoard(2, "项目计划");
// addBoard(3, "待办事项");
// addBoard(1, "更新后的第一个看板"); // 修改 ID 为 1 的看板

// console.log("Current boards in localStorage:", localStorage.getItem('board'));

/*
// 运行以上示例后，localStorage.getItem('board') 可能会输出类似：
// {"1":"更新后的第一个看板","2":"项目计划","3":"待办事项"}
*/

// 如果你想在React组件中使用，可以在useEffect或事件处理器中调用它：
// import React, { useEffect } from 'react';
//
// function MyComponent() {
//   useEffect(() => {
//     // 在组件加载时初始化或修改一些看板
//     addBoard(101, "React项目");
//     addBoard(102, "新的想法");
//   }, []);
//
//   const handleAddAnotherBoard = () => {
//     addBoard(103, "临时笔记");
//   };
//
//   return (
//     <div>
//       <button onClick={handleAddAnotherBoard}>添加临时笔记看板</button>
//       {/* ... 你的其他组件内容 */}
//     </div>
//   );
// }
//
// export default MyComponent;