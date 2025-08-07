/**
 * 结果管理页面
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Download,
  Eye,
  Trash2,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useConversionStore } from '../stores/conversionStore';
import { getConversionHistory } from '../services/apiService';
import { formatDate, formatDuration, formatFileSize } from '../utils/formatters';

export default function ResultsManagement() {
  const {
    conversionProgress,
    conversionHistory,
    clearHistory
  } = useConversionStore();
  
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 加载转换历史
  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const response = await getConversionHistory();
      if (response.success && response.data) {
        // 这里可以更新历史记录，但目前使用本地存储
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadHistory();
  }, []);
  
  // 获取所有结果（当前 + 历史）
  const allResults = [
    ...(conversionProgress ? [conversionProgress] : []),
    ...conversionHistory
  ].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  
  // 获取状态显示
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle2,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          text: '转换完成'
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          text: '转换失败'
        };
      case 'running':
        return {
          icon: RefreshCw,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          text: '转换中'
        };
      default:
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          text: '等待中'
        };
    }
  };
  
  // 打开输出文件夹
  const handleOpenOutputFolder = (outputPath: string) => {
    // 在实际应用中，这里可能需要调用系统API来打开文件夹
    console.log('打开文件夹:', outputPath);
  };
  
  // 清理历史记录
  const handleClearHistory = () => {
    if (confirm('确定要清除所有历史记录吗？')) {
      clearHistory();
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              结果管理
            </h1>
            <p className="text-gray-600">
              查看转换结果、管理输出文件和转换历史记录。
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={loadHistory}
              variant="outline"
              loading={isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新
            </Button>
            
            {conversionHistory.length > 0 && (
              <Button
                onClick={handleClearHistory}
                variant="outline"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                清除历史
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* 统计概览 */}
      {allResults.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>转换统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {allResults.length}
                </div>
                <div className="text-sm text-blue-800">总转换次数</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {allResults.filter(r => r.status === 'completed').length}
                </div>
                <div className="text-sm text-green-800">成功转换</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {allResults.filter(r => r.status === 'failed').length}
                </div>
                <div className="text-sm text-red-800">转换失败</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {allResults.reduce((sum, r) => sum + r.totalFiles, 0)}
                </div>
                <div className="text-sm text-purple-800">总文件数</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 转换结果列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 结果列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              转换记录 ({allResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allResults.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {allResults.map((result, index) => {
                  const statusDisplay = getStatusDisplay(result.status);
                  const StatusIcon = statusDisplay.icon;
                  const isSelected = selectedResult?.id === result.id;
                  
                  return (
                    <div
                      key={result.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedResult(result)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className={`p-1 rounded-full ${statusDisplay.bgColor} mr-2`}>
                            <StatusIcon className={`w-4 h-4 ${statusDisplay.color}`} />
                          </div>
                          <span className="font-medium text-gray-900">
                            {statusDisplay.text}
                          </span>
                        </div>
                        
                        <span className="text-sm text-gray-500">
                          {formatDate(result.startTime)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>文件数量：</span>
                          <span>{result.processedFiles}/{result.totalFiles}</span>
                        </div>
                        
                        {result.errors.length > 0 && (
                          <div className="flex justify-between text-red-600">
                            <span>错误数量：</span>
                            <span>{result.errors.length}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between">
                          <span>耗时：</span>
                          <span>
                            {formatDuration(result.startTime, result.endTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>暂无转换记录</p>
                <p className="text-sm">完成转换后，结果将显示在这里</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* 详细信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              详细信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedResult ? (
              <div className="space-y-4">
                {/* 基本信息 */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">基本信息</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>转换ID：</span>
                      <span className="font-mono text-xs">{selectedResult.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>开始时间：</span>
                      <span>{formatDate(selectedResult.startTime)}</span>
                    </div>
                    {selectedResult.endTime && (
                      <div className="flex justify-between">
                        <span>结束时间：</span>
                        <span>{formatDate(selectedResult.endTime)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>总耗时：</span>
                      <span>{formatDuration(selectedResult.startTime, selectedResult.endTime)}</span>
                    </div>
                  </div>
                </div>
                
                {/* 输出路径 */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">输出路径</h4>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-2 py-1 bg-gray-100 rounded text-sm">
                      {selectedResult.outputPath}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenOutputFolder(selectedResult.outputPath)}
                    >
                      <FolderOpen className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* 转换进度 */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">转换进度</h4>
                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between mb-1">
                      <span>已处理文件：</span>
                      <span>{selectedResult.processedFiles} / {selectedResult.totalFiles}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(selectedResult.processedFiles / selectedResult.totalFiles) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* 错误信息 */}
                {selectedResult.errors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 text-red-600">
                      错误信息 ({selectedResult.errors.length})
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedResult.errors.map((error: any, index: number) => (
                        <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                          <div className="font-medium text-red-800">{error.file}</div>
                          <div className="text-red-600">{error.error}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 操作按钮 */}
                {selectedResult.status === 'completed' && (
                  <div className="pt-4 border-t">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenOutputFolder(selectedResult.outputPath)}
                        className="flex-1"
                      >
                        <FolderOpen className="w-4 h-4 mr-2" />
                        打开文件夹
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>选择一个转换记录</p>
                <p className="text-sm">查看详细的转换信息</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}