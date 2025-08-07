/**
 * 转换相关状态管理
 */

import { create } from 'zustand';

// 文档信息接口
export interface DocumentInfo {
  id: string;
  name: string;
  path: string;
  type: 'html' | 'mhtml';
  size: number;
  lastModified: Date;
  relativePath: string;
  selected?: boolean;
}

// 转换选项接口
export interface ConversionOptions {
  preserveImages: boolean;
  preserveLinks: boolean;
  preserveTables: boolean;
  removeEmptyLines: boolean;
  addFrontMatter: boolean;
}

// 转换进度接口
export interface ConversionProgress {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  totalFiles: number;
  processedFiles: number;
  currentFile?: string;
  errors: Array<{ file: string; error: string }>;
  startTime: Date;
  endTime?: Date;
  outputPath: string;
}

// 转换状态接口
interface ConversionState {
  // 扫描相关状态
  scanPath: string;
  documents: DocumentInfo[];
  isScanning: boolean;
  scanError: string | null;
  
  // 转换配置
  outputPath: string;
  conversionOptions: ConversionOptions;
  
  // 转换进度
  currentConversionId: string | null;
  conversionProgress: ConversionProgress | null;
  isConverting: boolean;
  
  // 转换历史
  conversionHistory: ConversionProgress[];
  
  // Actions
  setScanPath: (path: string) => void;
  setDocuments: (documents: DocumentInfo[]) => void;
  toggleDocumentSelection: (documentId: string) => void;
  selectAllDocuments: (selected: boolean) => void;
  setIsScanning: (isScanning: boolean) => void;
  setScanError: (error: string | null) => void;
  
  setOutputPath: (path: string) => void;
  setConversionOptions: (options: Partial<ConversionOptions>) => void;
  
  setCurrentConversionId: (id: string | null) => void;
  setConversionProgress: (progress: ConversionProgress | null) => void;
  setIsConverting: (isConverting: boolean) => void;
  
  addToHistory: (progress: ConversionProgress) => void;
  clearHistory: () => void;
  
  reset: () => void;
}

// 默认转换选项
const defaultConversionOptions: ConversionOptions = {
  preserveImages: true,
  preserveLinks: true,
  preserveTables: true,
  removeEmptyLines: true,
  addFrontMatter: false
};

export const useConversionStore = create<ConversionState>((set, get) => ({
  // 初始状态
  scanPath: '',
  documents: [],
  isScanning: false,
  scanError: null,
  
  outputPath: '',
  conversionOptions: defaultConversionOptions,
  
  currentConversionId: null,
  conversionProgress: null,
  isConverting: false,
  
  conversionHistory: [],
  
  // Actions
  setScanPath: (path: string) => {
    set({ scanPath: path });
  },
  
  setDocuments: (documents: DocumentInfo[]) => {
    set({ documents });
  },
  
  toggleDocumentSelection: (documentId: string) => {
    const { documents } = get();
    const updatedDocuments = documents.map(doc => 
      doc.id === documentId 
        ? { ...doc, selected: !doc.selected }
        : doc
    );
    set({ documents: updatedDocuments });
  },
  
  selectAllDocuments: (selected: boolean) => {
    const { documents } = get();
    const updatedDocuments = documents.map(doc => ({ ...doc, selected }));
    set({ documents: updatedDocuments });
  },
  
  setIsScanning: (isScanning: boolean) => {
    set({ isScanning });
  },
  
  setScanError: (error: string | null) => {
    set({ scanError: error });
  },
  
  setOutputPath: (path: string) => {
    set({ outputPath: path });
  },
  
  setConversionOptions: (options: Partial<ConversionOptions>) => {
    const { conversionOptions } = get();
    set({ 
      conversionOptions: { ...conversionOptions, ...options }
    });
  },
  
  setCurrentConversionId: (id: string | null) => {
    set({ currentConversionId: id });
  },
  
  setConversionProgress: (progress: ConversionProgress | null) => {
    set({ conversionProgress: progress });
  },
  
  setIsConverting: (isConverting: boolean) => {
    set({ isConverting });
  },
  
  addToHistory: (progress: ConversionProgress) => {
    const { conversionHistory } = get();
    set({ 
      conversionHistory: [progress, ...conversionHistory].slice(0, 10) // 只保留最近10条记录
    });
  },
  
  clearHistory: () => {
    set({ conversionHistory: [] });
  },
  
  reset: () => {
    set({
      scanPath: '',
      documents: [],
      isScanning: false,
      scanError: null,
      outputPath: '',
      conversionOptions: defaultConversionOptions,
      currentConversionId: null,
      conversionProgress: null,
      isConverting: false
    });
  }
}));

// 选择器函数
export const getSelectedDocuments = (state: ConversionState) => 
  state.documents.filter(doc => doc.selected);

export const getConversionProgressPercentage = (progress: ConversionProgress | null) => {
  if (!progress || progress.totalFiles === 0) return 0;
  return Math.round((progress.processedFiles / progress.totalFiles) * 100);
};