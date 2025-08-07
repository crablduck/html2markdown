/**
 * HTML转Markdown转换服务
 */

import fs from 'fs-extra';
import path from 'path';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import mhtml2html from 'mhtml2html';
import { v4 as uuidv4 } from 'uuid';

// 文档类型接口
export interface DocumentInfo {
  id: string;
  name: string;
  path: string;
  type: 'html' | 'mhtml';
  size: number;
  lastModified: Date;
  relativePath: string;
}

// 转换选项接口
export interface ConversionOptions {
  preserveImages?: boolean;
  preserveLinks?: boolean;
  preserveTables?: boolean;
  removeEmptyLines?: boolean;
  addFrontMatter?: boolean;
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

// 存储转换进度的Map
const conversionProgressMap = new Map<string, ConversionProgress>();

/**
 * 扫描指定目录下的HTML/MHTML文档
 */
export async function scanDocuments(directoryPath: string): Promise<DocumentInfo[]> {
  const documents: DocumentInfo[] = [];
  
  async function scanDirectory(currentPath: string, basePath: string) {
    const items = await fs.readdir(currentPath);
    
    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      const stat = await fs.stat(itemPath);
      
      if (stat.isDirectory()) {
        // 递归扫描子目录
        await scanDirectory(itemPath, basePath);
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase();
        
        // 检查是否为HTML或MHTML文件
        if (ext === '.html' || ext === '.htm' || ext === '.mhtml' || ext === '.mht') {
          const relativePath = path.relative(basePath, itemPath);
          
          documents.push({
            id: uuidv4(),
            name: item,
            path: itemPath,
            type: (ext === '.mhtml' || ext === '.mht') ? 'mhtml' : 'html',
            size: stat.size,
            lastModified: stat.mtime,
            relativePath
          });
        }
      }
    }
  }
  
  await scanDirectory(directoryPath, directoryPath);
  return documents;
}

/**
 * 开始批量转换HTML/MHTML到Markdown
 */
export async function convertHtmlToMarkdown(
  documents: DocumentInfo[],
  outputPath: string,
  options: ConversionOptions = {}
): Promise<string> {
  const conversionId = uuidv4();
  
  // 初始化转换进度
  const progress: ConversionProgress = {
    id: conversionId,
    status: 'pending',
    totalFiles: documents.length,
    processedFiles: 0,
    errors: [],
    startTime: new Date(),
    outputPath
  };
  
  conversionProgressMap.set(conversionId, progress);
  
  // 异步执行转换
  processConversion(conversionId, documents, outputPath, options).catch(error => {
    console.error('转换过程中发生错误:', error);
    const currentProgress = conversionProgressMap.get(conversionId);
    if (currentProgress) {
      currentProgress.status = 'failed';
      currentProgress.endTime = new Date();
    }
  });
  
  return conversionId;
}

/**
 * 处理转换过程
 */
async function processConversion(
  conversionId: string,
  documents: DocumentInfo[],
  outputPath: string,
  options: ConversionOptions
) {
  const progress = conversionProgressMap.get(conversionId);
  if (!progress) return;
  
  progress.status = 'running';
  
  // 确保输出目录存在
  await fs.ensureDir(outputPath);
  
  // 配置Turndown服务
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    strongDelimiter: '**'
  });
  
  // 根据选项配置转换规则
  if (!options.preserveImages) {
    turndownService.remove('img');
  }
  
  if (!options.preserveLinks) {
    turndownService.addRule('removeLinks', {
      filter: 'a',
      replacement: (content) => content
    });
  }
  
  if (!options.preserveTables) {
    turndownService.remove('table');
  }
  
  for (const doc of documents) {
    try {
      progress.currentFile = doc.name;
      
      let htmlContent: string;
      
      if (doc.type === 'mhtml') {
        // 处理MHTML文件
        const mhtmlContent = await fs.readFile(doc.path, 'utf-8');
        htmlContent = mhtml2html.convert(mhtmlContent);
      } else {
        // 处理HTML文件
        htmlContent = await fs.readFile(doc.path, 'utf-8');
      }
      
      // 使用JSDOM解析HTML
      const dom = new JSDOM(htmlContent);
      const document = dom.window.document;
      
      // 清理HTML内容
      cleanHtmlContent(document);
      
      // 转换为Markdown
      let markdown = turndownService.turndown(document.body.innerHTML);
      
      // 后处理Markdown内容
      markdown = postProcessMarkdown(markdown, options);
      
      // 添加前置信息（如果需要）
      if (options.addFrontMatter) {
        const frontMatter = generateFrontMatter(doc);
        markdown = frontMatter + '\n\n' + markdown;
      }
      
      // 生成输出文件路径
      const outputFilePath = generateOutputPath(doc, outputPath);
      await fs.ensureDir(path.dirname(outputFilePath));
      
      // 写入Markdown文件
      await fs.writeFile(outputFilePath, markdown, 'utf-8');
      
      progress.processedFiles++;
      
    } catch (error) {
      console.error(`转换文件 ${doc.name} 失败:`, error);
      progress.errors.push({
        file: doc.name,
        error: error instanceof Error ? error.message : '未知错误'
      });
      progress.processedFiles++;
    }
  }
  
  progress.status = 'completed';
  progress.endTime = new Date();
}

/**
 * 清理HTML内容
 */
function cleanHtmlContent(document: Document) {
  // 移除脚本和样式标签
  const scripts = document.querySelectorAll('script, style');
  scripts.forEach(element => element.remove());
  
  // 移除注释
  const walker = document.createTreeWalker(
    document.body,
    8, // NodeFilter.SHOW_COMMENT
    null
  );
  
  const comments: Node[] = [];
  let node;
  while (node = walker.nextNode()) {
    comments.push(node);
  }
  
  comments.forEach(comment => {
    if (comment.parentNode) {
      comment.parentNode.removeChild(comment);
    }
  });
  
  // 移除空的段落和div
  const emptyElements = document.querySelectorAll('p:empty, div:empty');
  emptyElements.forEach(element => element.remove());
}

/**
 * 后处理Markdown内容
 */
function postProcessMarkdown(markdown: string, options: ConversionOptions): string {
  let processed = markdown;
  
  if (options.removeEmptyLines) {
    // 移除多余的空行
    processed = processed.replace(/\n\s*\n\s*\n/g, '\n\n');
  }
  
  // 清理多余的空格
  processed = processed.replace(/[ \t]+$/gm, '');
  
  // 确保文件以换行符结尾
  if (!processed.endsWith('\n')) {
    processed += '\n';
  }
  
  return processed;
}

/**
 * 生成前置信息
 */
function generateFrontMatter(doc: DocumentInfo): string {
  const frontMatter = [
    '---',
    `title: "${doc.name.replace(/\.[^.]+$/, '')}"`,
    `source: "${doc.relativePath}"`,
    `created: ${doc.lastModified.toISOString()}`,
    `converted: ${new Date().toISOString()}`,
    '---'
  ];
  
  return frontMatter.join('\n');
}

/**
 * 生成输出文件路径
 */
function generateOutputPath(doc: DocumentInfo, outputBasePath: string): string {
  const relativePath = doc.relativePath;
  const pathWithoutExt = relativePath.replace(/\.[^.]+$/, '');
  const markdownPath = pathWithoutExt + '.md';
  
  return path.join(outputBasePath, markdownPath);
}

/**
 * 获取转换进度
 */
export async function getConversionProgress(conversionId: string): Promise<ConversionProgress | null> {
  return conversionProgressMap.get(conversionId) || null;
}

/**
 * 清理过期的转换记录
 */
export function cleanupOldConversions() {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  for (const [id, progress] of conversionProgressMap.entries()) {
    if (progress.startTime < oneHourAgo) {
      conversionProgressMap.delete(id);
    }
  }
}