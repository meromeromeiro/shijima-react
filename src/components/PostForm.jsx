import React, { useState, useEffect } from 'react';
import { submitPost } from "../services/api.ts"; // 假设这个在 App.jsx 或调用处处理
import { useSearchParams } from 'react-router-dom';

// X Icon for closing
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

function PostForm({
  isVisible,
  onClose, // 这个 onClose 现在由 PostForm 内部的 X 按钮调用
  currentBoardId,
  currentThreadId,
  onPostSuccess,
  formData,
  setFormData,
  imageFile,
  setImageFile,
  // submitPostFunction, // 传递实际的提交函数
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchParam] = useSearchParams();

  // 使用从 props 传入的 currentBoardId 和 currentThreadId
  const formPageTitle = currentThreadId
    ? `回复 No.${currentThreadId}`
    : (currentBoardId ? `在版块 ${currentBoardId} 发布新串` : "发布新内容");

  // Clear messages when visibility changes or target changes
  useEffect(() => {
    if (isVisible) {
      setError(null);
      setSuccessMessage(null);
    }
  }, [isVisible, currentBoardId, currentThreadId]);

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

    // const apiPayload = {
    //   n: formData.name || "无名氏",
    //   e: formData.email,
    //   t: formData.title,
    //   txt: formData.content,
    // };


    try {
      // 调用从 App.jsx 传递过来的实际提交函数
      // const result = await submitPostFunction(apiPayload, imageFile, currentBoardId, currentThreadId);
      // 为了演示，我们先假设 submitPost 是全局可用的或者通过某种方式注入
      // 在实际应用中，最好通过 props 传入 submitPost 函数
      // const { submitPost } = await import("../services/api.js"); // 动态导入或确保已在父组件导入并传递
      const result = await submitPost({
        n: formData.name,
        t: formData.title,
        txt: formData.content,
        p: imageFile,
      }, searchParam.get("bid"), searchParam.get("tid"));

      if (result && (result.status === 200 || result.status === 201 || result.success)) {
        setSuccessMessage(result.message || "发布成功！");
        if (onPostSuccess) {
          onPostSuccess(result.data);
        }
        setFormData(prev => ({ name: prev.name, email: prev.email, title: '', content: '' }));
        setImageFile(null);
        setTimeout(() => {
          onClose(); // 调用 App.jsx 传来的 onClose 来关闭表单
          setSuccessMessage(null);
        }, 1500);
      } else {
        setError(result?.message || result?.error || "发布失败，请重试。");
      }
    } catch (err) {
      console.error("Post submission error:", err);
      setError(err.message || "发生网络错误或未知错误，请重试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null; // 如果不可见，则不渲染任何内容

  return (
    // 全屏覆盖样式
    // fixed inset-0: 覆盖整个视口
    // top-0 left-0 w-full h-full: 确保从视口左上角开始，并占满宽高
    // bg-white: 背景色
    // z-[70]: 高 z-index，确保在其他内容之上 (假设 Navbar z-50)
    // flex flex-col: 允许内部元素使用 flex 布局，垂直排列
    // p-0: 移除默认内边距，因为我们将为头部和内容区域单独设置
    <div className="fixed inset-0 top-0 left-0 w-full h-full bg-white z-[70] flex flex-col p-0">
      {/* 1. 自定义头部区域 */}
      <div className="h-14 flex-shrink-0 bg-gray-100 border-b border-gray-200 flex items-center justify-between px-3">
        <h2 className="text-base font-medium text-gray-700 truncate">
          {formPageTitle}
        </h2>
        <button
          onClick={onClose} // 点击 X 调用 App 传来的 onClose
          className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-200"
          aria-label="关闭"
        >
          <CloseIcon />
        </button>
      </div>

      {/* 2. 表单内容区域 */}
      {/* flex-grow: 使此区域占据剩余的垂直空间 */}
      {/* overflow-y-auto: 当内容超出时，允许垂直滚动 */}
      {/* p-4: 为内容区域添加内边距 */}
      <div className="flex-grow overflow-y-auto p-4">
        {/* Optional: Constrain form width on larger screens for better readability */}
        <div className="bg-white w-full max-w-2xl mx-auto">
          {error && <p className="mb-3 p-3 text-sm text-red-700 bg-red-100 rounded-md shadow">{error}</p>}
          {successMessage && <p className="mb-3 p-3 text-sm text-green-700 bg-green-100 rounded-md shadow">{successMessage}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="post-name" className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                <input type="text" id="post-name" name="name" value={formData.name} onChange={handleInputChange} placeholder="无名氏" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              {/* <div>
                <label htmlFor="post-email" className="block text-sm font-medium text-gray-700 mb-1">Email (选填, sage等)</label>
                <input type="text" id="post-email" name="email" value={formData.email} onChange={handleInputChange} placeholder="sage" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                </div> */}
            </div>
            <div>
              <label htmlFor="post-title" className="block text-sm font-medium text-gray-700 mb-1">标题</label>
              <input type="text" id="post-title" name="title" value={formData.title} onChange={handleInputChange} placeholder="无标题" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            {/* Make textarea take more vertical space */}
            <div className="flex flex-col" style={{ minHeight: '150px' }}>
              <label htmlFor="post-content" className="block text-sm font-medium text-gray-700 mb-1">内容 <span className="text-red-500">*</span></label>
              <textarea
                id="post-content" name="content"
                value={formData.content} onChange={handleInputChange}
                rows="6" // Initial rows, flex-grow helps with height
                required
                className="w-full flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-y"
              ></textarea>
            </div>
            <div>
              <label htmlFor="post-image" className="block text-sm font-medium text-gray-700 mb-1">图片 (选填)</label>
              <input type="file" id="post-image" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              {imageFile && <p className="mt-1 text-xs text-gray-500">已选择: <img className='h-48 w-auto' src={imageFile} alt={imageFile} /></p>}
            </div>
            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200 mt-4">
              {/* Cancel button now also calls onClose (same as X button) */}
              <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">取消</button>
              <button type="submit" disabled={isSubmitting || (!formData.content.trim() && !imageFile)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                {isSubmitting ? '提交中...' : '发布'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
export default PostForm;