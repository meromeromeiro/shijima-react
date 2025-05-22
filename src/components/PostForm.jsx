import React, { useState, useEffect } from 'react';
import { submitPost } from "../services/api.js"

// PostForm 现在接收 formData 和 setFormData 作为 props 来实现内容保留
function PostForm({
  isVisible,
  onClose,
  currentBoardId, // ID of the board if posting new thread
  currentThreadId, // ID of the thread if replying
  onPostSuccess,
  formData, // { name, email, title, content }
  setFormData, // Function to update formData in App.jsx
  imageFile,
  setImageFile
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const formTitle = currentThreadId ? `回复 No.${currentThreadId}` : (currentBoardId ? `在版块 ${currentBoardId} 发布新串` : "发布新串");

  // 清理错误和成功消息当表单重新打开时
  useEffect(() => {
    if (isVisible) {
      setError(null);
      setSuccessMessage(null);
    }
  }, [isVisible]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    } else {
      setImageFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.content.trim() && !imageFile) {
      setError("内容和图片至少需要一项。");
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const apiPayload = {
      n: formData.name || "无名氏",
      e: formData.email, // Assuming 'e' for email/sage
      t: formData.title,
      txt: formData.content,
      // image handling needs actual upload logic
    };

    if (currentThreadId) {
      apiPayload.r = currentThreadId; // Reply to
    } else if (currentBoardId) {
      // apiPayload.bid = currentBoardId; // Or handled by API endpoint if posting to a specific board
    }

    try {
      // const result = await actualSubmitFunction(apiPayload, imageFile, currentBoardId, currentThreadId);
      const result = await submitPost(apiPayload); // Using mock

      if (result.success) {
        setSuccessMessage(result.message || "发布成功！");
        if (onPostSuccess) {
          onPostSuccess(result.data);
        }
        // 清空表单内容（除了可能需要保留的 name/email）
        setFormData(prev => ({ name: prev.name, email: prev.email, title: '', content: '' }));
        setImageFile(null);
        setTimeout(() => {
            onClose(); // 关闭表单
            setSuccessMessage(null); // 清除成功消息
        }, 1500);
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
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl" aria-label="关闭">×</button>
        </div>

        {error && <p className="mb-3 p-2 text-sm text-red-700 bg-red-100 rounded">{error}</p>}
        {successMessage && <p className="mb-3 p-2 text-sm text-green-700 bg-green-100 rounded">{successMessage}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="post-name" className="block text-sm font-medium text-gray-700 mb-1">名称</label>
              <input type="text" id="post-name" name="name" value={formData.name} onChange={handleInputChange} placeholder="无名氏" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
            </div>
            <div>
              <label htmlFor="post-email" className="block text-sm font-medium text-gray-700 mb-1">Email (选填, sage等)</label>
              <input type="text" id="post-email" name="email" value={formData.email} onChange={handleInputChange} placeholder="sage" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
            </div>
          </div>
          <div>
            <label htmlFor="post-title" className="block text-sm font-medium text-gray-700 mb-1">标题 (选填)</label>
            <input type="text" id="post-title" name="title" value={formData.title} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
          </div>
          <div>
            <label htmlFor="post-content" className="block text-sm font-medium text-gray-700 mb-1">内容 <span className="text-red-500">*</span></label>
            <textarea id="post-content" name="content" value={formData.content} onChange={handleInputChange} rows="5" required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
          </div>
          <div>
            <label htmlFor="post-image" className="block text-sm font-medium text-gray-700 mb-1">图片 (选填)</label>
            <input type="file" id="post-image" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
            {imageFile && <p className="mt-1 text-xs text-gray-500">已选择: {imageFile.name}</p>}
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">取消</button>
            <button type="submit" disabled={isSubmitting || (!formData.content.trim() && !imageFile)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
              {isSubmitting ? '提交中...' : '发布'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default PostForm;