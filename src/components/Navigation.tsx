/**
 * 导航组件
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { 
  FolderSearch, 
  Settings, 
  Play, 
  FileText,
  Home
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const navItems: NavItem[] = [
  {
    path: '/',
    label: '首页',
    icon: Home,
    description: '项目概览'
  },
  {
    path: '/scan',
    label: '文档扫描',
    icon: FolderSearch,
    description: '扫描HTML文档'
  },
  {
    path: '/config',
    label: '转换配置',
    icon: Settings,
    description: '设置转换选项'
  },
  {
    path: '/convert',
    label: '转换执行',
    icon: Play,
    description: '执行转换任务'
  },
  {
    path: '/results',
    label: '结果管理',
    icon: FileText,
    description: '查看转换结果'
  }
];

export default function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                HTML转Markdown工具
              </h1>
            </div>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={clsx(
                      'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    )}
                    title={item.description}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* 移动端导航 */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                )}
              >
                <div className="flex items-center">
                  <Icon className="w-5 h-5 mr-3" />
                  <div>
                    <div>{item.label}</div>
                    <div className="text-sm text-gray-500">{item.description}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}