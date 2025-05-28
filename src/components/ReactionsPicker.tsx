import React, { useState, useEffect, useCallback, useRef } from 'react';

// 常用颜文字和 ASCII 颜文字数据
const commonEmoticons = [
    '👍', '❤️', '😂', '🎉', '👏', '🔥', '🙏', '💯', '🤩',
    '❓', '👀', '😂', '🤔', '😅', '💢', '😴', '🤤', '🐖',
    '💩','✘','✔','🔺','♪','🎵',
];
const asciiKaomoji = [
    // 现有颜文字列表
    "|∀ﾟ", "(´ﾟДﾟ`)", "(;´Д`)",
    "(｀･ω･)", "(=ﾟωﾟ)=", "| ω・´)",
    "|-` )", "|д` )", "|ー` )",
    "|∀` )", "(つд⊂)", "(ﾟДﾟ≡ﾟДﾟ)",
    "(＾o＾)ﾉ", "(|||ﾟДﾟ)", "( ﾟ∀ﾟ)",
    "( ´∀`)", "(*´∀`)", "(*ﾟ∇ﾟ)",
    "(*ﾟーﾟ)", "(　ﾟ 3ﾟ)", "( ´ー`)",
    "( ・_ゝ・)", "( ´_ゝ`)", "(*´д`)",
    "(・ー・)", "(・∀・)", "(ゝ∀･)",
    "(〃∀〃)", "(*ﾟ∀ﾟ*)", "( ﾟ∀。)",
    "( `д´)", "(`ε´ )", "(`ヮ´ )",
    "σ`∀´)", " ﾟ∀ﾟ)σ", "ﾟ ∀ﾟ)ノ",
    "(╬ﾟдﾟ)", "( ﾟдﾟ)",
    "Σ( ﾟдﾟ)", "( ;ﾟдﾟ)", "( ;´д`)",
    "(　д ) ﾟ ﾟ", "( ☉д⊙)", "(((　ﾟдﾟ)))",
    "( ` ・´)", "( ´д`)", "( -д-)",
    "(>д<)", "･ﾟ( ﾉд`ﾟ)", "( TдT)",
    "(￣∇￣)", "(￣3￣)", "(￣ｰ￣)",
    "(￣ . ￣)", "(￣皿￣)", "(￣艸￣)",
    "(￣︿￣)", "(￣︶￣)", "ヾ(´ωﾟ｀)",
    "(*´ω`*)", "(・ω・)", "( ´・ω)",
    "(｀・ω)", "(´・ω・`)", "(`・ω・´)",
    "( `_っ´)", "( `ー´)", "( ´_っ`)",
    "( ´ρ`)", "( ﾟωﾟ)", "(oﾟωﾟo)",
    "(　^ω^)", "(｡◕∀◕｡)", "/( ◕‿‿◕ )\\",
    "ヾ(´ε`ヾ)", "(ノﾟ∀ﾟ)ノ", "(σﾟдﾟ)σ",
    "(σﾟ∀ﾟ)σ", "|дﾟ )", "┃電柱┃",
    "ﾟ(つд`ﾟ)", "ﾟÅﾟ )　", "⊂彡☆))д`)",
    "⊂彡☆))д´)", "⊂彡☆))∀`)", "(´∀((☆ミつ",

    '(づ｡◕‿‿◕｡)づ',
    '(╯°□°）╯︵ ┻━┻',
    '¯\\_(ツ)_/¯',
    'ヾ(≧▽≦*)o',
    '(っ◕‿◕)っ',
    '(⌒_⌒;)',
    'o(￣ヘ￣o＃)',
    '٩(๑❛ᴗ❛๑)۶',
    'ლ(′ー`ლ)',
];

// React ReactionsPicker 组件
function ReactionsPicker({ tid, apiBaseUrl = '/api/v2' }) {
    const [showPicker, setShowPicker] = useState(false);
    const [reactionsData, setReactionsData] = useState({ reactions: {}, my_reaction: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // 用于追踪组件是否挂载，防止在卸载后更新状态
    const isMounted = useRef(false);
    // 用于追踪由用户交互触发的当前活跃的 AbortController
    const activeUserActionControllerRef = useRef<AbortController | null>(null);

    // 提取的 API Fetch 函数，现在可以接收一个 AbortSignal
    const fetchReactions = useCallback(async (signal?: AbortSignal) => {
        // 在发起请求前，如果组件已经卸载，则直接返回
        if (!isMounted.current) return;

        setLoading(true); // 立即设置加载状态
        setError(""); // 清空错误信息

        try {
            const response = await fetch(`${apiBaseUrl}/reaction/${tid}`, { signal });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // 只有当组件仍然挂载时才更新状态
            if (isMounted.current) {
                setReactionsData({
                    reactions: data.reactions || {},
                    my_reaction: data.my_reaction || '',
                });
            }
        } catch (err: any) { // 捕获 AbortError 或其他错误
            if (err.name === 'AbortError') {
                console.log('Fetch reactions aborted.');
                // 如果是 AbortError，表示请求被取消，不视为错误，也不更新状态
                return;
            }
            console.error("Error fetching reactions:", err);
            // 只有当组件仍然挂载时才更新错误状态
            if (isMounted.current) {
                setError("无法加载反应");
            }
        } finally {
            // 无论成功、失败还是取消，最后都应设置 loading 为 false
            // 但仅当组件仍然挂载时才更新状态
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, [tid, apiBaseUrl]); // 依赖项不变

    // 组件挂载时获取初始 Reactions，并在卸载时清理请求
    useEffect(() => {
        isMounted.current = true; // 组件挂载时设置 isMounted 为 true

        const initialFetchController = new AbortController();
        // 调用 fetchReactions，并传递信号
        fetchReactions(initialFetchController.signal);

        // Cleanup function for unmount
        return () => {
            isMounted.current = false; // 组件卸载时设置 isMounted 为 false
            initialFetchController.abort(); // 中止初始请求

            // 如果有用户触发的请求正在进行，也中止它
            if (activeUserActionControllerRef.current) {
                activeUserActionControllerRef.current.abort();
                activeUserActionControllerRef.current = null;
            }
        };
    }, [fetchReactions]); // 依赖 fetchReactions

    // 处理颜文字选择或点击已有颜文字按钮
    const handleSetReaction = useCallback(async (reaction: string) => {
        // 在新请求开始前，取消任何之前由用户触发的请求，以处理竞态条件
        if (activeUserActionControllerRef.current) {
            activeUserActionControllerRef.current.abort();
            activeUserActionControllerRef.current = null;
        }

        const controller = new AbortController();
        activeUserActionControllerRef.current = controller; // 存储当前控制器
        const signal = controller.signal;

        setShowPicker(false); // 关闭颜文字选择器

        // 立即设置加载状态和清空错误信息
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${apiBaseUrl}/reaction/${tid}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: reaction,
                signal: controller.signal, // 传递信号
            });

            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorJson = await response.json();
                    if (errorJson && errorJson.error) {
                        errorMessage = errorJson.error;
                    }
                } catch {
                    // ignore if json parsing fails
                }
                throw new Error(errorMessage); // 抛出错误以被 catch 捕获
            }

            // 成功后重新获取 Reactions 以更新 UI
            // 传递相同的 signal，确保后续的 fetch 也可被取消
            await fetchReactions(signal);

        } catch (err: any) {
            if (err.name === 'AbortError') {
                console.log('Set reaction or subsequent fetch aborted.');
                // 如果是 AbortError，不更新状态
                return;
            }
            console.error("Error setting reaction:", err);
            // 只有当组件仍然挂载时才更新错误状态
            if (isMounted.current) {
                setError(`设置反应失败: ${err.message}`);
            }
        } finally {
            // 如果当前的控制器是存储的控制器，则清除引用
            if (activeUserActionControllerRef.current === controller) {
                activeUserActionControllerRef.current = null;
            }
            // 无论成功、失败还是取消，最后都应设置 loading 为 false
            // 但仅当组件仍然挂载时才更新状态
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, [tid, apiBaseUrl, fetchReactions]); // 依赖 fetchReactions

    // --- 新增：处理浏览器后退按钮关闭 Picker 的逻辑 ---
    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            // 如果 Picker 正在显示，并且当前历史状态不再是 Picker 的特殊状态
            // 这意味着用户点击了浏览器的后退按钮，从 Picker 状态回到了之前的状态
            if (showPicker && (!event.state || !event.state.isReactionPickerOpen)) {
                setShowPicker(false); // 关闭 Picker
            }
        };

        if (showPicker) {
            // 当 Picker 打开时，向浏览器历史推入一个新状态。
            // 这样，当用户点击后退按钮时，会先“回到”这个状态，触发 popstate 事件。
            // 我们传递一个标志 { isReactionPickerOpen: true } 来识别这个状态。
            window.history.pushState({ isReactionPickerOpen: true }, '', window.location.href);
            window.addEventListener('popstate', handlePopState);
        }

        // Cleanup function for this effect
        return () => {
            window.removeEventListener('popstate', handlePopState);

            // 如果 Picker 被正常关闭（例如点击了 X 或背景），而不是通过后退按钮关闭，
            // 那么我们之前推入的那个历史状态可能仍然在堆栈顶部。
            // 此时，我们需要手动执行一次 history.back() 来清理这个历史条目，
            // 确保下一次真正的后退操作能回到 Picker 之前的页面。
            // 我们通过检查当前 history.state 是否是我们的 Picker 标志来判断。
            if (window.history.state && window.history.state.isReactionPickerOpen) {
                window.history.back();
            }
        };
    }, [showPicker]); // 依赖 showPicker，当 Picker 的显示状态改变时触发此 useEffect

    // 点击加号按钮
    const handlePlusClick = () => {
        setShowPicker(true);
    };

    // 点击颜文字选择器中的颜文字
    const handleEmojiSelect = (emoji) => {
        handleSetReaction(emoji);
    };

    // 点击已存在的颜文字按钮
    const handleExistingReactionClick = (emoji) => {
        if (reactionsData.my_reaction === emoji) {
            // 如果点击的是自己的 reaction，则取消
            handleSetReaction(''); // 发送空字符串表示取消
        } else {
            // 否则设置为新的 reaction
            handleSetReaction(emoji);
        }
    };

    return (
        <div className="pt-1 pb-1 w-full flex items-center p-1 rounded-lg text-sm">
            {/* 加号按钮 */}
            <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-1 rounded-full w-5 h-5 flex items-center justify-center text-md font-bold cursor-pointer transition-colors duration-200 shadow-sm mr-1"
                onClick={handlePlusClick}
                aria-label="添加反应"
                disabled={loading}
            >
                +
            </button>

            {/* 颜文字选择器 (Modal) */}
            {showPicker && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" // 使用 bg-black bg-opacity-10 确保背景半透明
                    onClick={() => setShowPicker(false)} // 点击背景关闭
                >
                    <div
                        className="bg-white p-3 rounded-lg shadow-lg max-w-sm w-full relative max-h-[90vh] overflow-y-auto" // 限制 Modal 的最大高度为视口高度的90%，并允许内部滚动
                        onClick={(e) => e.stopPropagation()} // 阻止事件冒泡到背景，避免点击 modal 内部关闭
                    >
                        <h3 className="text-base font-semibold mb-2">选择一个反应</h3>
                        <div className="mb-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">常用表情</h4>
                            <div className="grid grid-cols-5 gap-1 p-1 border border-gray-200 rounded">
                                {commonEmoticons.map((emoji) => (
                                    <button
                                        key={emoji}
                                        className="p-1 bg-gray-100 hover:bg-gray-200 rounded text-center text-xl cursor-pointer transition-colors duration-200"
                                        onClick={() => handleEmojiSelect(emoji)}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">ASCII 颜文字</h4>
                            <div className="grid grid-cols-4 gap-1 p-1 border border-gray-200 rounded text-xs overflow-y-auto"> {/* max-h-60 保持滚动 */}
                                {asciiKaomoji.map((kaomoji) => (
                                    <button
                                        key={kaomoji}
                                        className="p-1 bg-gray-100 hover:bg-gray-200 rounded text-left cursor-pointer transition-colors duration-200 text-sm overflow-hidden whitespace-nowrap text-ellipsis"
                                        onClick={() => handleEmojiSelect(kaomoji)}
                                        title={kaomoji} // 鼠标悬停显示完整颜文字
                                    >
                                        {kaomoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button
                            className="absolute top-1 right-1 text-gray-500 hover:text-gray-800 text-lg font-bold"
                            onClick={() => setShowPicker(false)}
                            aria-label="关闭"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* 右侧已设置的颜文字列表 */}
            <div className="flex-grow flex items-center space-x-1 overflow-x-auto py-0.5 hide-scrollbar">
                {loading && <span className="text-gray-500 text-xs ml-1">加载中...</span>}
                {error && <span className="text-red-500 text-xs ml-1">{error}</span>}

                {!loading && !error && Object.entries(reactionsData.reactions).length === 0 && (
                    <span className="text-gray-400 text-xs ml-1" onClick={handlePlusClick}>点击+号添加reaction</span>
                )}

                {!loading && !error && Object.entries(reactionsData.reactions)
                    // .sort(([, countA], [, countB]) => countB - countA) // 按计数降序排序
                    .map(([emoji, count]) => (
                        <button
                            key={emoji}
                            className={`px-2 py-0.5 rounded-full flex items-center space-x-0.5 text-xs cursor-pointer transition-colors duration-200 flex-shrink-0 ${reactionsData.my_reaction === emoji
                                    ? 'bg-blue-500 text-white hover:bg-blue-600' // 我的 reaction
                                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200' // 其他 reaction
                                }`}
                            onClick={() => handleExistingReactionClick(emoji)}
                            disabled={loading}
                        >
                            <span>{emoji}</span>
                            <span className="ml-0.5 font-semibold">{count as number}</span>
                        </button>
                    ))}
            </div>
        </div>
    );
}

export default ReactionsPicker;