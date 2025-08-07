/**
 * API服务模块
 */

import type { DocumentInfo, ConversionOptions, ConversionProgress } from '../stores/conversionStore';

const API_BASE_URL = '/api';

// API响应接口
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// 扫描文档响应接口
interface ScanDocumentsResponse {
  totalCount: number;
  documents: DocumentInfo[];
}

// 开始转换响应接口
interface StartConversionResponse {
  conversionId: string;
  message: string;
}

/**
 * 发送HTTP请求的通用函数
 */
async function request<T>(
  url: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API请求失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '网络请求失败'
    };
  }
}

/**
 * 扫描指定目录下的HTML/MHTML文档
 */
export async function scanDocuments(directoryPath: string): Promise<ApiResponse<ScanDocumentsResponse>> {
  return request<ScanDocumentsResponse>('/conversion/scan', {
    method: 'POST',
    body: JSON.stringify({ directoryPath })
  });
}

/**
 * 开始批量转换
 */
export async function startConversion(
  documents: DocumentInfo[],
  outputPath: string,
  options: ConversionOptions
): Promise<ApiResponse<StartConversionResponse>> {
  return request<StartConversionResponse>('/conversion/convert', {
    method: 'POST',
    body: JSON.stringify({
      documents,
      outputPath,
      options
    })
  });
}

/**
 * 获取转换进度
 */
export async function getConversionProgress(conversionId: string): Promise<ApiResponse<ConversionProgress>> {
  return request<ConversionProgress>(`/conversion/progress/${conversionId}`);
}

/**
 * 获取转换历史记录
 */
export async function getConversionHistory(): Promise<ApiResponse<{ history: ConversionProgress[] }>> {
  return request<{ history: ConversionProgress[] }>('/conversion/history');
}

/**
 * 检查服务器健康状态
 */
export async function checkHealth(): Promise<ApiResponse<{ message: string }>> {
  return request<{ message: string }>('/health');
}