import React from 'react';
import { STYLES } from '../constants';

interface FileTabProps {
  onImport: (content: string) => void;
  onExport: () => void;
  isExporting: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export const FileTab: React.FC<FileTabProps> = ({ onImport, onExport, isExporting, fileInputRef }) => {
  return (
    <div className="flex items-center h-full animate-slide-in-left">
      <div className={STYLES.groupClass}>
        <button
          onClick={() => onImport('')}
          className={`${STYLES.btnClass} flex-col gap-0.5 h-12 w-12 !px-1`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span className="text-[10px] scale-90">新建</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`${STYLES.btnClass} flex-col gap-0.5 h-12 w-12 !px-1`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          <span className="text-[10px] scale-90">导入</span>
        </button>
        <button
          onClick={onExport}
          disabled={isExporting}
          className={`${STYLES.btnClass} flex-col gap-0.5 h-12 w-12 !px-1 ${isExporting ? 'opacity-50' : ''}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
          <span className="text-[10px] scale-90">{isExporting ? '导出中' : '导出'}</span>
        </button>
      </div>
    </div>
  );
};
