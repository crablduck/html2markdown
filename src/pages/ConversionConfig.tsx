/**
 * 转换配置页面
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, FolderOpen, ArrowLeft, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Checkbox } from '../components/ui/Checkbox';
import { useConversionStore, getSelectedDocuments } from '../stores/conversionStore';

export default function ConversionConfig() {
  const navigate = useNavigate();
  const {
    outputPath,
    conversionOptions,
    setOutputPath,
    setConversionOptions,
    documents
  } = useConversionStore();
  
  const [localOutputPath, setLocalOutputPath] = useState(outputPath);
  const [error, setError] = useState<string | null>(null);
  
  const selectedDocuments = getSelectedDocuments({ documents } as any);
  
  // 处理配置保存
  const handleSaveConfig = () => {
    if (!localOutputPath.trim()) {
      setError('请输入输出目录路径');
      return;
    }
    
    setOutputPath(localOutputPath.trim());
    setError(null);
  };
  
  // 继续到下一步
  const handleNext = () => {
    if (!outputPath) {
      setError('请先保存配置');
      return;
    }
    navigate('/convert');
  };
  
  // 返回上一步
  const handleBack = () => {
    navigate('/scan');
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          转换配置
        </h1>
        <p className="text-gray-600">
          配置HTML转Markdown的转换选项和输出设置。
        </p>
      </div>
      
      {/* 选中文档概览 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>转换概览</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {selectedDocuments.length}
              </div>
              <div className="text-sm text-blue-800">选中文档</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {selectedDocuments.filter(doc => doc.type === 'html').length}
              </div>
              <div className="text-sm text-green-800">HTML文档</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {selectedDocuments.filter(doc => doc.type === 'mhtml').length}
              </div>
              <div className="text-sm text-purple-800">MHTML文档</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 输出配置 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FolderOpen className="w-5 h-5 mr-2" />
            输出配置
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  label="输出目录路径"
                  value={localOutputPath}
                  onChange={(e) => setLocalOutputPath(e.target.value)}
                  placeholder="请输入Markdown文件的输出目录，例如：D:\\output"
                  error={error}
                  helperText="转换后的Markdown文件将保存到此目录，保持原有的文件夹结构"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleSaveConfig}
                  variant="outline"
                >
                  保存配置
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 转换选项 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            转换选项
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">内容保留</h4>
              
              <Checkbox
                checked={conversionOptions.preserveImages}
                onChange={(e) => setConversionOptions({ preserveImages: e.target.checked })}
                label="保留图片"
                description="保留HTML中的图片标签和引用"
              />
              
              <Checkbox
                checked={conversionOptions.preserveLinks}
                onChange={(e) => setConversionOptions({ preserveLinks: e.target.checked })}
                label="保留链接"
                description="保留HTML中的超链接"
              />
              
              <Checkbox
                checked={conversionOptions.preserveTables}
                onChange={(e) => setConversionOptions({ preserveTables: e.target.checked })}
                label="保留表格"
                description="保留HTML中的表格结构"
              />
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">格式优化</h4>
              
              <Checkbox
                checked={conversionOptions.removeEmptyLines}
                onChange={(e) => setConversionOptions({ removeEmptyLines: e.target.checked })}
                label="移除多余空行"
                description="清理转换后的多余空行，使格式更整洁"
              />
              
              <Checkbox
                checked={conversionOptions.addFrontMatter}
                onChange={(e) => setConversionOptions({ addFrontMatter: e.target.checked })}
                label="添加前置信息"
                description="在Markdown文件开头添加元数据信息"
              />
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">配置预览</h5>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• 输出目录：{outputPath || '未设置'}</p>
              <p>• 保留图片：{conversionOptions.preserveImages ? '是' : '否'}</p>
              <p>• 保留链接：{conversionOptions.preserveLinks ? '是' : '否'}</p>
              <p>• 保留表格：{conversionOptions.preserveTables ? '是' : '否'}</p>
              <p>• 移除空行：{conversionOptions.removeEmptyLines ? '是' : '否'}</p>
              <p>• 前置信息：{conversionOptions.addFrontMatter ? '是' : '否'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 导航按钮 */}
      <div className="flex justify-between">
        <Button
          onClick={handleBack}
          variant="outline"
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回文档扫描
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!outputPath}
          className="flex items-center"
        >
          开始转换
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}