import React from 'react';
import { motion } from 'framer-motion';
import { FileNewLine, FileUploadLine, DocLine } from '@mingcute/react';
import { STYLES } from '../constants';
import { fadeSlideX, motionTransition } from '../../ui/motion';

interface FileTabProps {
  onImport: (content: string) => void;
  onExport: () => void;
  isExporting: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export const FileTab: React.FC<FileTabProps> = ({ onImport, onExport, isExporting, fileInputRef }) => {
  return (
    <motion.div className="flex items-center h-full" variants={fadeSlideX} initial="initial" animate="enter" exit="exit" transition={motionTransition}>
      <div className={STYLES.groupClass}>
        <div className={STYLES.groupContentClass}>
          <button
            onClick={() => onImport('')}
            className={`${STYLES.btnClass} flex-col h-14 w-14 !px-1 justify-center`}
          >
            <FileNewLine className="w-6 h-6 mb-1" />
            <span className="text-[11px] leading-none">新建</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`${STYLES.btnClass} flex-col h-14 w-14 !px-1 justify-center`}
          >
            <FileUploadLine className="w-6 h-6 mb-1" />
            <span className="text-[11px] leading-none">导入</span>
          </button>
          <button
            onClick={onExport}
            disabled={isExporting}
            className={`${STYLES.btnClass} flex-col h-14 w-14 !px-1 justify-center ${isExporting ? 'opacity-50' : ''}`}
          >
            <DocLine className="w-6 h-6 mb-1" />
            <span className="text-[11px] leading-none">{isExporting ? '导出中' : '导出'}</span>
          </button>
        </div>
        <span className={STYLES.groupLabelClass}>文件操作</span>
      </div>
    </motion.div>
  );
};
