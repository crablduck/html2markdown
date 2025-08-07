/**
 * 首页 - 项目概览
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderSearch, 
  Settings, 
  Play, 
  FileText,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useConversionStore } from '../stores/conversionStore';

export default function Home() {
  const { documents, conversionHistory } = useConversionStore();
  
  // 统计信息
  const totalDocuments = documents.length;
  const selectedDocuments = documents.filter(doc => doc.selected).length;
  const totalConversions = conversionHistory.length;
  const successfulConversions = conversionHistory.filter(h => h.status === 'completed').length;
  
  // 快速操作步骤
  const quickSteps = [
    {
      title: '扫描文档',
      description: '选择包含HTML/MHTML文档的目录进行扫描',
      icon: FolderSearch,
      link: '/scan',
      color: 'blue'
    },
    {
      title: '配置转换',
      description: '设置转换选项和输出路径',
      icon: Settings,
      link: '/config',
      color: 'green'
    },
    {
      title: '执行转换',
      description: '开始转换并监控进度',
      icon: Play,
      link: '/convert',
      color: 'purple'
    },
    {
      title: '查看结果',
      description: '管理转换结果和历史记录',
      icon: FileText,
      link: '/results',
      color: 'orange'
    }
  ];
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 欢迎区域 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          HTML转Markdown工具
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          高效批量转换HTML和MHTML文档为Markdown格式，支持自定义转换选项，保持原有文件夹结构，适合知识库建设和文档管理。
        </p>
      </div>
      
      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card>
          <CardContent className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderSearch className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {totalDocuments}
            </div>
            <div className="text-sm text-gray-600">已扫描文档</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="text-center p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {selectedDocuments}
            </div>
            <div className="text-sm text-gray-600">已选择文档</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="text-center p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {totalConversions}
            </div>
            <div className="text-sm text-gray-600">转换次数</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="text-center p-6">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {successfulConversions}
            </div>
            <div className="text-sm text-gray-600">成功转换</div>
          </CardContent>
        </Card>
      </div>
      
      {/* 快速开始 */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="text-center">
            快速开始转换流程
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickSteps.map((step, index) => {
              const Icon = step.icon;
              const colorClasses = {
                blue: 'bg-blue-50 text-blue-600 border-blue-200',
                green: 'bg-green-50 text-green-600 border-green-200',
                purple: 'bg-purple-50 text-purple-600 border-purple-200',
                orange: 'bg-orange-50 text-orange-600 border-orange-200'
              };
              
              return (
                <Link
                  key={index}
                  to={step.link}
                  className="block p-6 border-2 border-dashed rounded-lg transition-all hover:shadow-md hover:scale-105"
                  style={{
                    borderColor: step.color === 'blue' ? '#dbeafe' : 
                                step.color === 'green' ? '#dcfce7' :
                                step.color === 'purple' ? '#f3e8ff' : '#fed7aa'
                  }}
                >
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      step.color === 'blue' ? 'bg-blue-100' :
                      step.color === 'green' ? 'bg-green-100' :
                      step.color === 'purple' ? 'bg-purple-100' : 'bg-orange-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        step.color === 'blue' ? 'text-blue-600' :
                        step.color === 'green' ? 'text-green-600' :
                        step.color === 'purple' ? 'text-purple-600' : 'text-orange-600'
                      }`} />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {index + 1}. {step.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      {step.description}
                    </p>
                    
                    <div className="flex items-center justify-center text-sm font-medium text-blue-600">
                      开始
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* 功能特点 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            功能特点
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderSearch className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                智能扫描
              </h3>
              <p className="text-gray-600">
                递归扫描目录，自动识别HTML和MHTML文档，支持批量选择和预览。
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                灵活配置
              </h3>
              <p className="text-gray-600">
                丰富的转换选项，支持保留图片、链接、表格等元素，满足不同需求。
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                实时监控
              </h3>
              <p className="text-gray-600">
                实时显示转换进度，详细的错误日志，确保转换过程透明可控。
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                结果管理
              </h3>
              <p className="text-gray-600">
                完整的转换历史记录，支持结果查看和文件管理，便于后续处理。
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                质量保证
              </h3>
              <p className="text-gray-600">
                智能清理HTML内容，优化Markdown格式，确保转换质量。
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                高效处理
              </h3>
              <p className="text-gray-600">
                异步批量处理，支持大量文档转换，保持原有目录结构。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}