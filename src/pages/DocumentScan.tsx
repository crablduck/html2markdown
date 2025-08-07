/**
 * 文档扫描页面
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Checkbox } from '../components/ui/Checkbox';
import { useConversionStore } from '../stores/conversionStore';
import { scanDocuments } from '../services/apiService';
import { formatFileSize, formatDate } from '../utils/formatters';

export default function DocumentScan() {
  const navigate = useNavigate();
  const {
    scanPath,
    documents,
    isScanning,
    scanError,
    setScanPath,
    setDocuments,
    setIsScanning,
    setScanError,
    toggleDocumentSelection,
    selectAllDocuments
  } = useConversionStore();
  
  const [localScanPath, setLocalScanPath] = useState(scanPath);
  
  // 处理扫描
  const handleScan = async () => {
    if (!localScanPath.trim()) {
      setScanError('请输入要扫描的目录路径');
      return;
    }
    
    setIsScanning(true);
    setScanError(null);
    setScanPath(localScanPath.trim());
    
    try {
      const response = await scanDocuments(localScanPath.trim());
      
      if (response.success && response.data) {
        const documentsWithSelection = response.data.documents.map(doc => ({
          ...doc,
          selected: true // 默认选中所有文档
        }));
        setDocuments(documentsWithSelection);
      } else {
        setScanError(response.error || '扫描失败');
      }
    } catch (error) {
      setScanError('扫描过程中发生错误');
    } finally {
      setIsScanning(false);
    }
  };
  
  // 处理全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    selectAllDocuments(checked);
  };
  
  // 获取选中的文档数量
  const selectedCount = documents.filter(doc => doc.selected).length;
  const allSelected = documents.length > 0 && selectedCount === documents.length;
  const someSelected = selectedCount > 0 && selectedCount < documents.length;
  
  // 继续到下一步
  const handleNext = () => {
    if (selectedCount === 0) {
      setScanError('请至少选择一个文档进行转换');
      return;
    }
    navigate('/config');
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          文档扫描
        </h1>
        <p className="text-gray-600">
          扫描指定目录下的HTML和MHTML文档，选择需要转换的文件。
        </p>
      </div>
      
      {/* 扫描配置 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FolderOpen className="w-5 h-5 mr-2" />
            选择扫描目录
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                value={localScanPath}
                onChange={(e) => setLocalScanPath(e.target.value)}
                placeholder="请输入要扫描的目录路径，例如：D:\\documents"
                error={scanError}
              />
            </div>
            <Button
              onClick={handleScan}
              loading={isScanning}
              disabled={!localScanPath.trim()}
            >
              {isScanning ? '扫描中...' : '开始扫描'}
            </Button>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>支持的文件格式：.html, .htm, .mhtml, .mht</p>
            <p>将递归扫描所有子目录中的文档文件</p>
          </div>
        </CardContent>
      </Card>
      
      {/* 扫描结果 */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                扫描结果 ({documents.length} 个文档)
              </CardTitle>
              
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={allSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  label={`全选 (${selectedCount}/${documents.length})`}
                />
                
                <Button
                  onClick={handleNext}
                  disabled={selectedCount === 0}
                >
                  下一步：配置转换选项
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {selectedCount > 0 && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800">
                    已选择 {selectedCount} 个文档进行转换
                  </span>
                </div>
              </div>
            )}
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <Checkbox
                    checked={doc.selected || false}
                    onChange={() => toggleDocumentSelection(doc.id)}
                  />
                  
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {doc.name}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        doc.type === 'mhtml' 
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {doc.type.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <span className="truncate">{doc.relativePath}</span>
                      <span className="mx-2">•</span>
                      <span>{formatFileSize(doc.size)}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(doc.lastModified)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 空状态 */}
      {!isScanning && documents.length === 0 && scanPath && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              未找到文档
            </h3>
            <p className="text-gray-500">
              在指定目录中未找到HTML或MHTML文档，请检查路径是否正确。
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}