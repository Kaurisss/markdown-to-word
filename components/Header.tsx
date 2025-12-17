import React, { useRef } from 'react';
import { HeaderProps, ViewMode } from '../types';
import logoSrc from '../assets/logo.png';

const Header: React.FC<HeaderProps> = ({ isExporting, onExport, onImport, viewMode, onViewModeChange }) => {
  
  const isEditorFull = viewMode === 'editor';
  const isPreviewFull = viewMode === 'preview';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        onImport(text);
      }
    };
    reader.readAsText(file);
    
    // Reset input to allow selecting the same file again
    e.target.value = '';
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 z-20">
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".md,.txt,.markdown" 
        className="hidden" 
      />

      {/* Left Section: Logo & Editor Toggle */}
      <div className="flex items-center w-5/12 sm:w-1/2">
        {/* Logo */}
        <div className="flex items-center space-x-3 mr-6">
            <div className="flex-shrink-0">
                <img src={logoSrc} alt="简阅转档" className="w-8 h-8" />
            </div>
            <h1 className="text-gray-800 font-semibold text-lg tracking-tight truncate hidden md:block">
            简阅转档
            </h1>
        </div>

        <div className="h-5 w-px bg-gray-200 mr-4 hidden sm:block"></div>

        {/* Editor Fullscreen Toggle (Pen Icon) */}
        <button 
           onClick={() => onViewModeChange(isEditorFull ? 'split' : 'editor')}
           className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
             ${isEditorFull 
               ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200' 
               : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
           `}
           title={isEditorFull ? "退出专注模式" : "专注写作"}
         >
           {isEditorFull ? (
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="18" rx="2" ry="2"></rect>
                <line x1="12" y1="3" x2="12" y2="21"></line>
             </svg>
           ) : (
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
             </svg>
           )}
           <span className="hidden sm:inline">{isEditorFull ? '退出专注' : '专注写作'}</span>
         </button>
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center justify-end w-7/12 sm:w-1/2 space-x-3">
        
        {/* Export Hint */}
        <span className="text-xs text-gray-500 hidden xl:inline-block mr-2">
            当前仅支持导出默认主题
        </span>

        {/* Import Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
          title="导入 Markdown 文件"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <span className="hidden lg:inline">导入</span>
        </button>

        {/* Preview Fullscreen Toggle */}
        <button 
           onClick={() => onViewModeChange(isPreviewFull ? 'split' : 'preview')}
           className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
             ${isPreviewFull 
               ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200' 
               : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
           `}
           title={isPreviewFull ? "退出预览全屏" : "预览全屏"}
         >
           {isPreviewFull ? (
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="18" rx="2" ry="2"></rect>
                <line x1="12" y1="3" x2="12" y2="21"></line>
             </svg>
           ) : (
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
             </svg>
           )}
           <span className="hidden sm:inline">{isPreviewFull ? '退出全屏' : '全屏预览'}</span>
         </button>

        <div className="h-5 w-px bg-gray-200 hidden sm:block"></div>

        {/* Export Button */}
        <button
          onClick={onExport}
          disabled={isExporting}
          className={`
            flex items-center space-x-2 px-4 py-1.5 rounded text-sm font-medium transition-colors shadow-sm flex-shrink-0
            ${isExporting 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
              : 'bg-brand-600 hover:bg-brand-700 text-white border border-transparent'}
          `}
          title="保存为 Word 文档 (当前仅支持默认主题)"
        >
          {isExporting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>生成中...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              <span>保存文件</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;