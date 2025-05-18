import React, { useState, useEffect } from 'react';

// 模拟 API 调用
const mockSubmitPost = async (formData) => {
  console.log("Submitting post:", formData);
  await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟网络延迟
  // 实际应用中，这里会调用你的后端 API
  // 例如：
  // const response = await fetch('/api/v2/post?...', { method: 'POST', body: JSON.stringify(formData) });
  // if (!response.ok) throw new Error('Failed to post');
  // return await response.json();
  return { success: true, message: "发布成功！", data: { ...formData, no: Math.floor(Math.random() * 100000) } };
};


function PostForm({ isVisible, onClose, currentBoardId, currentThreadId, onPostSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); // "sage" or other options might go here
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const formTitle = currentThreadId ? `回复 No.${currentThreadId}` : (currentBoardId ? `在版块 ${currentBoardId} 发布新串` : "发布新串");

  // 当表单可见性变化或回复目标变化时，重置表单
  useEffect(() => {
    if (isVisible) {
      setName('');
      setEmail('');
      setTitle('');
      setContent('');
      setImageFile(null);
      setError(null);
      setSuccessMessage(null);
    }
  }, [isVisible, currentBoardId, currentThreadId]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) {
      setError("内容和图片至少需要一项。");
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const formData = {
      n: name || "无名氏", // name
      // email/sage functionality needs to be decided how to map to API
      t: title, // title
      txt: content, // content
      // p: imageFile, // image needs proper handling (upload then path)
      // r: currentThreadId, // reply to (if replying)
      // num: currentBoardId // board id (if new thread)
    };

    // 在实际应用中，你需要处理图片上传。
    // 这里只是将信息放入 formData 对象。
    // 如果是回复，API 需要 `r` (reply to thread ID)
    // 如果是新串，API 可能需要 `bid` (board ID)
    if (currentThreadId) {
        formData.r = currentThreadId;
    } else if (currentBoardId) {
        // formData.bid = currentBoardId; // 或者 API 通过 URL 参数区分
    }


    try {
      // 实际的 API 调用
      // const result = await postThread(formData, currentBoardId); // 假设 postThread 是你的 API 服务函数
      const result = await mockSubmitPost(formData); // 使用模拟函数

      if (result.success) {
        setSuccessMessage(result.message || "发布成功！");
        if (onPostSuccess) {
          onPostSuccess(result.data); // 将新帖/回复数据传递回去
        }
        setTimeout(() => { // 成功后一段时间关闭表单
            onClose();
            setSuccessMessage(null);
        }, 2000);
      } else {
        setError(result.message || "发布失败，请重试。");
      }
    } catch (err) {
      setError(err.message || "发生错误，请重试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{formTitle}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="关闭"
          >
            ×
          </button>
        </div>

        {error && <p className="mb-3 p-2 text-sm text-red-700 bg-red-100 rounded">{error}</p>}
        {successMessage && <p className="mb-3 p-2 text-sm text-green-700 bg-green-100 rounded">{successMessage}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="post-name" className="block text-sm font-medium text-gray-700 mb-1">
                名称
              </label>
              <input
                type="text"
                id="post-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="无名氏"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="post-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email (选填, sage等)
              </label>
              <input
                type="text"
                id="post-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sage"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="post-title" className="block text-sm font-medium text-gray-700 mb-1">
              标题 (选填)
            </label>
            <input
              type="text"
              id="post-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="post-content" className="block text-sm font-medium text-gray-700 mb-1">
              内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="5"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            ></textarea>
          </div>
          <div>
            <label htmlFor="post-image" className="block text-sm font-medium text-gray-700 mb-1">
              图片 (选填)
            </label>
            <input
              type="file"
              id="post-image"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {imageFile && <p className="mt-1 text-xs text-gray-500">已选择: {imageFile.name}</p>}
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!content.trim() && !imageFile)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? '提交中...' : '发布'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostForm;