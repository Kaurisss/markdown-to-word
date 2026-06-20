import React from 'react';
import { FileNewLine, FileUploadLine, DocLine } from '@mingcute/react';
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
        <div className={STYLES.groupContentClass}>
          <button
            onClick={() => onImport('')}
            className={`${STYLES.btnClass} flex-col gap-0.5 h-12 w-12 !px-1`}
          >
            <FileNewLine className="w-5 h-5" />
            <span className="text-xs">新建</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`${STYLES.btnClass} flex-col gap-0.5 h-12 w-12 !px-1`}
          >
            <FileUploadLine className="w-5 h-5" />
            <span className="text-xs">导入</span>
          </button>
          <button
            onClick={onExport}
            disabled={isExporting}
            className={`${STYLES.btnClass} flex-col gap-0.5 h-12 w-12 !px-1 ${isExporting ? 'opacity-50' : ''}`}
          >
            <DocLine className="w-5 h-5" />
            <span className="text-xs">{isExporting ? '导出中' : '导出'}</span>
          </button>
        </div>
        <span className={STYLES.groupLabelClass}>文件操作</span>
      </div>
    </div>
  );
};
