import React, { useState, useEffect, useRef } from 'react';
import { submitPost } from "../services/api.ts";
import { useSearchParams } from 'react-router-dom';

// X Icon for closing
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

// Emoticon data from your HTML
const EMOTICONS = [
  { value: "|∀ﾟ", label: "|∀ﾟ" },
  { value: "(´ﾟДﾟ`)", label: "(´ﾟДﾟ`)" },
  { value: "(;´Д`)", label: "(;´Д`)" },
  { value: "(｀･ω･)", label: "(｀･ω･)" },
  { value: "(=ﾟωﾟ)=", label: "(=ﾟωﾟ)=" },
  { value: "| ω・´)", label: "| ω・´)" },
  { value: "|-` )", label: "|-` )" },
  { value: "|д` )", label: "|д` )" },
  { value: "|ー` )", label: "|ー` )" },
  { value: "|∀` )", label: "|∀` )" },
  { value: "(つд⊂)", label: "(つд⊂)" },
  { value: "(ﾟДﾟ≡ﾟДﾟ)", label: "(ﾟДﾟ≡ﾟДﾟ)" },
  { value: "(＾o＾)ﾉ", label: "(＾o＾)ﾉ" },
  { value: "(|||ﾟДﾟ)", label: "(|||ﾟДﾟ)" },
  { value: "( ﾟ∀ﾟ)", label: "( ﾟ∀ﾟ)" },
  { value: "( ´∀`)", label: "( ´∀`)" },
  { value: "(*´∀`)", label: "(*´∀`)" },
  { value: "(*ﾟ∇ﾟ)", label: "(*ﾟ∇ﾟ)" },
  { value: "(*ﾟーﾟ)", label: "(*ﾟーﾟ)" },
  { value: "(　ﾟ 3ﾟ)", label: "(　ﾟ 3ﾟ)" },
  { value: "( ´ー`)", label: "( ´ー`)" },
  { value: "( ・_ゝ・)", label: "( ・_ゝ・)" },
  { value: "( ´_ゝ`)", label: "( ´_ゝ`)" },
  { value: "(*´д`)", label: "(*´д`)" },
  { value: "(・ー・)", label: "(・ー・)" },
  { value: "(・∀・)", label: "(・∀・)" },
  { value: "(ゝ∀･)", label: "(ゝ∀･)" },
  { value: "(〃∀〃)", label: "(〃∀〃)" },
  { value: "(*ﾟ∀ﾟ*)", label: "(*ﾟ∀ﾟ*)" },
  { value: "( ﾟ∀。)", label: "( ﾟ∀。)" },
  { value: "( `д´)", label: "( `д´)" },
  { value: "(`ε´ )", label: "(`ε´ )" },
  { value: "(`ヮ´ )", label: "(`ヮ´ )" },
  { value: "σ`∀´)", label: "σ`∀´)" },
  { value: " ﾟ∀ﾟ)σ", label: " ﾟ∀ﾟ)σ" },
  { value: "ﾟ ∀ﾟ)ノ", label: "ﾟ ∀ﾟ)ノ" },
  { value: "(╬ﾟдﾟ)", label: "(╬ﾟдﾟ)" },
  { value: "(|||ﾟдﾟ)", label: "(|||ﾟдﾟ)" }, // Duplicate of an earlier one, kept for consistency with your list
  { value: "( ﾟдﾟ)", label: "( ﾟдﾟ)" },
  { value: "Σ( ﾟдﾟ)", label: "Σ( ﾟдﾟ)" },
  { value: "( ;ﾟдﾟ)", label: "( ;ﾟдﾟ)" },
  { value: "( ;´д`)", label: "( ;´д`)" },
  { value: "(　д ) ﾟ ﾟ", label: "(　д ) ﾟ ﾟ" },
  { value: "( ☉д⊙)", label: "( ☉д⊙)" },
  { value: "(((　ﾟдﾟ)))", label: "(((　ﾟдﾟ)))" },
  { value: "( ` ・´)", label: "( ` ・´)" },
  { value: "( ´д`)", label: "( ´д`)" },
  { value: "( -д-)", label: "( -д-)" },
  { value: "(>д<)", label: "(>д<)" },
  { value: "･ﾟ( ﾉд`ﾟ)", label: "･ﾟ( ﾉд`ﾟ)" },
  { value: "( TдT)", label: "( TдT)" },
  { value: "(￣∇￣)", label: "(￣∇￣)" },
  { value: "(￣3￣)", label: "(￣3￣)" },
  { value: "(￣ｰ￣)", label: "(￣ｰ￣)" },
  { value: "(￣ . ￣)", label: "(￣ . ￣)" },
  { value: "(￣皿￣)", label: "(￣皿￣)" },
  { value: "(￣艸￣)", label: "(￣艸￣)" },
  { value: "(￣︿￣)", label: "(￣︿￣)" },
  { value: "(￣︶￣)", label: "(￣︶￣)" },
  { value: "ヾ(´ωﾟ｀)", label: "ヾ(´ωﾟ｀)" },
  { value: "(*´ω`*)", label: "(*´ω`*)" },
  { value: "(・ω・)", label: "(・ω・)" },
  { value: "( ´・ω)", label: "( ´・ω)" },
  { value: "(｀・ω)", label: "(｀・ω)" },
  { value: "(´・ω・`)", label: "(´・ω・`)" },
  { value: "(`・ω・´)", label: "(`・ω・´)" },
  { value: "( `_っ´)", label: "( `_っ´)" },
  { value: "( `ー´)", label: "( `ー´)" },
  { value: "( ´_っ`)", label: "( ´_っ`)" },
  { value: "( ´ρ`)", label: "( ´ρ`)" },
  { value: "( ﾟωﾟ)", label: "( ﾟωﾟ)" },
  { value: "(oﾟωﾟo)", label: "(oﾟωﾟo)" },
  { value: "(　^ω^)", label: "(　^ω^)" },
  { value: "(｡◕∀◕｡)", label: "(｡◕∀◕｡)" },
  { value: "/( ◕‿‿◕ )\\", label: "/( ◕‿‿◕ )\\" }, // Note: Backslash needs to be escaped in JS string
  { value: "ヾ(´ε`ヾ)", label: "ヾ(´ε`ヾ)" },
  { value: "(ノﾟ∀ﾟ)ノ", label: "(ノﾟ∀ﾟ)ノ" },
  { value: "(σﾟдﾟ)σ", label: "(σﾟдﾟ)σ" },
  { value: "(σﾟ∀ﾟ)σ", label: "(σﾟ∀ﾟ)σ" },
  { value: "|дﾟ )", label: "|дﾟ )" },
  { value: "┃電柱┃", label: "┃電柱┃" },
  { value: "ﾟ(つд`ﾟ)", label: "ﾟ(つд`ﾟ)" },
  { value: "ﾟÅﾟ )　", label: "ﾟÅﾟ )　" }, // Note: Trailing space included as in your example
  { value: "⊂彡☆))д`)", label: "⊂彡☆))д`)" },
  { value: "⊂彡☆))д´)", label: "⊂彡☆))д´)" },
  { value: "⊂彡☆))∀`)", label: "⊂彡☆))∀`)" },
  { value: "(´∀((☆ミつ", label: "(´∀((☆ミつ" }
];


function PostForm({
  isVisible,
  onClose,
  currentBoardTitle,
  currentBoardId,
  currentThreadId,
  onPostSuccess,
  formData,
  setFormData,
  imageFile,
  setImageFile,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchParam] = useSearchParams();
  const contentTextAreaRef = useRef(null);
  const [selectedEmotion, setSelectedEmotion] = useState(""); // For controlling the select input

  const formPageTitle = currentThreadId ? `回复 No.${currentThreadId}`
    : currentBoardTitle ? `在版块 ${currentBoardTitle} 发布新串`
      : currentBoardId ? `在版块 ${currentBoardId} 发布新串`
        : "发布新内容";

  useEffect(() => {
    if (isVisible) {
      setError(null);
      setSuccessMessage(null);
      setSelectedEmotion(""); // Reset select on visibility change
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

  const handleEmotionSelect = (e) => {
    const emotionText = e.target.value;
    setSelectedEmotion(emotionText); // Update the select's controlled value

    if (emotionText) { // Only append if a valid emotion is selected (not the placeholder)
      setFormData(prev => {
        let newContent = prev.content;
        if (newContent && !newContent.endsWith(' ') && !newContent.endsWith('\n')) {
          newContent += ' '; // Add a space before appending
        }
        newContent += emotionText;
        return { ...prev, content: newContent };
      });

      // Focus the textarea
      if (contentTextAreaRef.current) {
        contentTextAreaRef.current.focus();
        const len = contentTextAreaRef.current.value.length;
        contentTextAreaRef.current.setSelectionRange(len, len);
      }
      // Reset the select to the placeholder AFTER appending
      // This allows the user to select the same emotion again if they wish
      // The timeout helps ensure the state update for formData has a chance to propagate
      // before the select's value is visually reset, though direct reset is usually fine.
      setTimeout(() => setSelectedEmotion(""), 0);
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

    try {
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
        setSelectedEmotion(""); // Reset select on success
        if (document.getElementById('post-image')) {
            document.getElementById('post-image').value = '';
        }
        setTimeout(() => {
          onClose();
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

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 top-0 left-0 w-full h-full bg-white z-[70] flex flex-col p-0">
      <div className="h-14 flex-shrink-0 bg-gray-100 border-b border-gray-200 flex items-center justify-between px-3">
        <h2 className="text-base font-medium text-gray-700 truncate">
          {formPageTitle}
        </h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-200"
          aria-label="关闭"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-4">
        <div className="bg-white w-full max-w-2xl mx-auto">
          {error && <p className="mb-3 p-3 text-sm text-red-700 bg-red-100 rounded-md shadow">{error}</p>}
          {successMessage && <p className="mb-3 p-3 text-sm text-green-700 bg-green-100 rounded-md shadow">{successMessage}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="post-name" className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                <input type="text" id="post-name" name="name" value={formData.name} onChange={handleInputChange} placeholder="无名氏" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>
            <div>
              <label htmlFor="post-title" className="block text-sm font-medium text-gray-700 mb-1">标题</label>
              <input type="text" id="post-title" name="title" value={formData.title} onChange={handleInputChange} placeholder="无标题" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            
            {/* Emotion Select Dropdown */}
            <div className="mb-2">
              <label htmlFor="emotion-select" className="block text-sm font-medium text-gray-700 mb-1">表情</label>
              <select
                id="emotion-select"
                value={selectedEmotion} // Controlled component
                onChange={handleEmotionSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
              >
                <option value="" disabled>选择表情...</option> {/* Placeholder */}
                {EMOTICONS.map((emo) => (
                  <option key={emo.value} value={emo.value}>
                    {emo.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col" style={{ minHeight: '150px' }}>
              <label htmlFor="post-content" className="block text-sm font-medium text-gray-700 mb-1">内容 <span className="text-red-500">*</span></label>
              <textarea
                ref={contentTextAreaRef}
                id="post-content" name="content"
                value={formData.content} onChange={handleInputChange}
                rows="6"
                required
                className="w-full flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-y"
              ></textarea>
            </div>
            <div>
              <label htmlFor="post-image" className="block text-sm font-medium text-gray-700 mb-1">图片 (选填)</label>
              <input type="file" id="post-image" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              {imageFile && (
                <p className="mt-1 text-xs text-gray-500">
                  已选择: 
                  <img 
                    className='mt-1 h-48 w-auto object-contain border border-gray-200' 
                    src={URL.createObjectURL(imageFile)}
                    alt={imageFile.name} 
                    onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                  />
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200 mt-4">
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