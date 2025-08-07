/**
 * 转换执行页面
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  FileText
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Progress } from '../components/ui/Progress';
import { useConversionStore, getSelectedDocuments, getConversionProgressPercentage } from '../stores/conversionStore';
import { startConversion, getConversionProgress } from '../services/apiService';
import { formatDuration, formatRelativeTime } from '../utils/formatters';

export default function ConversionExecution() {
  const navigate = useNavigate();
  const {
    documents,
    outputPath,
    conversionOptions,
    currentConversionId,
    conversionProgress,
    isConverting,
    setCurrentConversionId,
    setConversionProgress,
    setIsConverting,
    addToHistory
  } = useConversionStore();
  
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  const selectedDocuments = getSelectedDocuments({ documents } as any);
  const progressPercentage = getConversionProgressPercentage(conversionProgress);
  
  // 轮询转换进度
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (currentConversionId && isConverting) {
      intervalId = setInterval(async () => {
        try {
          const response = await getConversionProgress(currentConversionId);
          
          if (response.success && response.data) {
            setConversionProgress(response.data);
            
            // 添加日志
            if (response.data.currentFile) {
              const logMessage = `正在转换: ${response.data.currentFile}`;
              setLogs(prev => {
                if (prev[prev.length - 1] !== logMessage) {
                  return [...prev.slice(-19), logMessage]; // 保留最近20条日志
                }
                return prev;
              });
            }
            
            // 检查是否完成
            if (response.data.status === 'completed' || response.data.status === 'failed') {
              setIsConverting(false);
              addToHistory(response.data);
              
              if (response.data.status === 'completed') {
                setLogs(prev => [...prev, '转换完成！']);
              } else {
                setLogs(prev => [...prev, '转换失败！']);
              }
            }
          }
        } catch (error) {
          console.error('获取转换进度失败:', error);
        }
      }, 1000); // 每秒更新一次
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [currentConversionId, isConverting]);
  
  // 开始转换
  const handleStartConversion = async () => {
    if (selectedDocuments.length === 0) {
      setError('没有选中的文档');
      return;
    }
    
    if (!outputPath) {
      setError('未设置输出路径');
      return;
    }
    
    setError(null);
    setLogs(['开始转换...']);
    setIsConverting(true);
    
    try {
      const response = await startConversion(selectedDocuments, outputPath, conversionOptions);
      
      if (response.success && response.data) {
        setCurrentConversionId(response.data.conversionId);
        setLogs(prev => [...prev, response.data.message]);
      } else {
        setError(response.error || '启动转换失败');
        setIsConverting(false);
      }
    } catch (error) {
      setError('启动转换过程中发生错误');
      setIsConverting(false);
    }
  };
  
  // 返回上一步
  const handleBack = () => {
    navigate('/config');
  };
  
  // 查看结果
  const handleViewResults = () => {
    navigate('/results');
  };
  
  // 获取状态图标和颜色
  const getStatusDisplay = () => {
    if (!conversionProgress) {
      return {
        icon: Play,
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        text: '准备开始'
      };
    }
    
    switch (conversionProgress.status) {
      case 'running':
        return {
          icon: Play,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          text: '转换中'
        };
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
      default:
        return {
          icon: Pause,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          text: '等待中'
        };
    }
  };
  
  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          转换执行
        </h1>
        <p className="text-gray-600">
          执行HTML转Markdown转换任务，实时查看转换进度。
        </p>
      </div>
      
      {/* 转换状态 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`p-2 rounded-full ${statusDisplay.bgColor} mr-3`}>
                <StatusIcon className={`w-5 h-5 ${statusDisplay.color}`} />
              </div>
              转换状态：{statusDisplay.text}
            </div>
            
            {!isConverting && !conversionProgress && (
              <Button
                onClick={handleStartConversion}
                disabled={selectedDocuments.length === 0 || !outputPath}
              >
                开始转换
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {selectedDocuments.length}
              </div>
              <div className="text-sm text-blue-800">总文档数</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {conversionProgress?.processedFiles || 0}
              </div>
              <div className="text-sm text-green-800">已处理</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {conversionProgress?.errors.length || 0}
              </div>
              <div className="text-sm text-red-800">错误数</div>
            </div>
          </div>
          
          {/* 进度条 */}
          {conversionProgress && (
            <div className="mb-6">
              <Progress
                value={progressPercentage}
                color={conversionProgress.status === 'failed' ? 'red' : 'blue'}
                showLabel
                label="转换进度"
              />
              
              <div className="mt-2 flex justify-between text-sm text-gray-600">
                <span>
                  {conversionProgress.processedFiles} / {conversionProgress.totalFiles} 文件
                </span>
                <span>
                  {conversionProgress.startTime && (
                    formatDuration(conversionProgress.startTime, conversionProgress.endTime)
                  )}
                </span>
              </div>
              
              {conversionProgress.currentFile && (
                <div className="mt-2 text-sm text-gray-600">
                  当前文件：{conversionProgress.currentFile}
                </div>
              )}
            </div>
          )}
          
          {/* 配置信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">输出配置</h4>
              <p className="text-gray-600">输出路径：{outputPath}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">转换选项</h4>
              <div className="text-gray-600 space-y-1">
                <p>保留图片：{conversionOptions.preserveImages ? '是' : '否'}</p>
                <p>保留链接：{conversionOptions.preserveLinks ? '是' : '否'}</p>
                <p>保留表格：{conversionOptions.preserveTables ? '是' : '否'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 转换日志 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            转换日志
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
                </div>
              ))
            ) : (
              <div className="text-gray-500">等待开始转换...</div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* 错误列表 */}
      {conversionProgress && conversionProgress.errors.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              转换错误 ({conversionProgress.errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {conversionProgress.errors.map((error, index) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="font-medium text-red-800">{error.file}</div>
                  <div className="text-sm text-red-600">{error.error}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 导航按钮 */}
      <div className="flex justify-between">
        <Button
          onClick={handleBack}
          variant="outline"
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回配置
        </Button>
        
        {conversionProgress && (conversionProgress.status === 'completed' || conversionProgress.status === 'failed') && (
          <Button
            onClick={handleViewResults}
            className="flex items-center"
          >
            查看结果
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}