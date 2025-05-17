import React, { useState, useEffect } from 'react';
import { APIURL } from '../utils'; // Assuming APIURL is defined in utils

function PostForm({
    selectedBoard, // Object: { id, name, intro }
    currentThreadId,
    userId,
    userAuth,
    onPostSuccess, // Callback to refresh threads
}) {
    const [title, setTitle] = useState('');
    const [name, setName] = useState('');
    const [txt, setTxt] = useState('');
    const [pic, setPic] = useState('');
    const [isDisabled, setIsDisabled] = useState(false);
    const [showPostContainer, setShowPostContainer] = useState(false);

    useEffect(() => {
        setShowPostContainer(!!selectedBoard);
        // Reset form when board changes or threadId changes (if replying in thread view)
        setTitle('');
        setName('');
        setTxt('');
        setPic('');
    }, [selectedBoard, currentThreadId]);


    const handlePostThread = async () => {
        if ((txt.trim() === "" && pic.trim() === "") || !selectedBoard) {
            return;
        }
        setIsDisabled(true);

        const postData = {
            m: "post",
            tid: currentThreadId || 0, // If currentThreadId is present, it's a reply
            bid: selectedBoard.id,
            n: name, // Corresponds to 'name' in Vue (user's name for post)
            t: title, // Corresponds to 'title' in Vue (post title)
            id: userId,
            auth: userAuth,
            txt: txt,
            p: pic,
            page: 0, // This might need adjustment based on how your backend handles reply pages
        };

        try {
            // The original Vue code uses /api/ for posting, not APIURL
            const response = await fetch("/api/", { //  IMPORTANT: Check this URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded', // Original uses this
                },
                // JSON.stringify for x-www-form-urlencoded is unusual.
                // Typically, it would be new URLSearchParams(postData).toString()
                // Sticking to original for now:
                body: JSON.stringify(postData)
            });
            const data = await response.json();

            if (data && data.length > 0) { // Assuming success means getting new thread/reply list
                setTxt('');
                setPic('');
                setTitle('');
                setName('');
                if (onPostSuccess) {
                    onPostSuccess(data); // Pass the new data back
                }
            } else if (data && data.tid && data.bid) { // Alternative success for single post confirmation
                 setTxt('');
                 setPic('');
                 setTitle('');
                 setName('');
                 if (onPostSuccess) {
                    onPostSuccess(); // Trigger refresh
                 }
            }
             else {
                // Handle error response from server, e.g., show a message
                console.error("Post failed:", data);
                alert("发言失败，请检查内容或稍后再试。");
            }
        } catch (error) {
            console.error("Error posting thread:", error);
            alert("发言时发生网络错误。");
        } finally {
            setIsDisabled(false);
        }
    };

    if (!showPostContainer || !selectedBoard) {
        return null;
    }

    return (
        <div className="poster-container mb-4 p-4 border border-gray-300 rounded bg-white shadow">
            <div id="title" className="text-xl font-bold text-shijima-title mb-2">
                {currentThreadId ? `回复 No.${currentThreadId}` : selectedBoard.name}
            </div>
            <div className="mx-auto w-auto">
                <table className="w-full">
                    <tbody>
                        <tr>
                            <td className="form-name text-right pr-2 py-1 w-1/6 text-shijima-text">标题：</td>
                            <td className="py-1">
                                <input
                                    name="title"
                                    size="28"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    maxLength="100"
                                    type="text"
                                    className="w-full p-1 border border-gray-400 rounded focus:border-shijima-blue-accent focus:ring-1 focus:ring-shijima-blue-accent outline-none"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="form-name text-right pr-2 py-1 text-shijima-text">名称：</td>
                            <td className="py-1 flex items-center">
                                <input
                                    name="name"
                                    size="28"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    maxLength="100"
                                    type="text"
                                    className="w-full p-1 border border-gray-400 rounded focus:border-shijima-blue-accent focus:ring-1 focus:ring-shijima-blue-accent outline-none"
                                />
                                <input
                                    value="送出"
                                    type="submit"
                                    onClick={handlePostThread}
                                    disabled={isDisabled}
                                    className="ml-2 px-4 py-1 bg-shijima-accent text-white rounded cursor-pointer hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="form-name text-right pr-2 py-1 align-top text-shijima-text">正文：</td>
                            <td className="py-1">
                                <textarea
                                    rows="4"
                                    cols="30"
                                    value={txt}
                                    onChange={(e) => setTxt(e.target.value)}
                                    maxLength="10000"
                                    onKeyDown={(e) => {
                                        if (e.ctrlKey && e.key === 'Enter') {
                                            handlePostThread();
                                        }
                                    }}
                                    className="w-full p-1 border border-gray-400 rounded focus:border-shijima-blue-accent focus:ring-1 focus:ring-shijima-blue-accent outline-none"
                                ></textarea>
                            </td>
                        </tr>
                        <tr>
                            <td className="form-name text-right pr-2 py-1 text-shijima-text">图片：</td>
                            <td className="py-1">
                                <input
                                    name="pic"
                                    size="28"
                                    value={pic}
                                    onChange={(e) => setPic(e.target.value)}
                                    maxLength="4096"
                                    type="text"
                                    placeholder="图片链接"
                                    className="w-full p-1 border border-gray-400 rounded focus:border-shijima-blue-accent focus:ring-1 focus:ring-shijima-blue-accent outline-none"
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            {/* Hidden inputs for bid, tid, id, auth are handled in postData */}
            <div className="mt-2 text-sm text-gray-600">
                {selectedBoard.intro}
            </div>
        </div>
    );
}

export default PostForm;