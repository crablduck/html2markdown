/**
 * HTML转Markdown转换相关API路由
 */

import express, { type Request, type Response } from 'express';
import fs from 'fs-extra';
import path from 'path';
import { scanDocuments, convertHtmlToMarkdown, getConversionProgress } from '../services/conversionService.js';

const router = express.Router();

/**
 * 扫描指定目录下的HTML/MHTML文档
 * POST /api/conversion/scan
 */
router.post('/scan', async (req: Request, res: Response) => {
  try {
    const { directoryPath } = req.body;
    
    if (!directoryPath) {
      return res.status(400).json({
        success: false,
        error: '目录路径不能为空'
      });
    }

    // 检查目录是否存在
    if (!await fs.pathExists(directoryPath)) {
      return res.status(400).json({
        success: false,
        error: '指定的目录不存在'
      });
    }

    const documents = await scanDocuments(directoryPath);
    
    res.json({
      success: true,
      data: {
        totalCount: documents.length,
        documents
      }
    });
  } catch (error) {
    console.error('扫描文档失败:', error);
    res.status(500).json({
      success: false,
      error: '扫描文档失败'
    });
  }
});

/**
 * 开始批量转换
 * POST /api/conversion/convert
 */
router.post('/convert', async (req: Request, res: Response) => {
  try {
    const { 
      documents, 
      outputPath, 
      options = {} 
    } = req.body;
    
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({
        success: false,
        error: '文档列表不能为空'
      });
    }

    if (!outputPath) {
      return res.status(400).json({
        success: false,
        error: '输出路径不能为空'
      });
    }

    // 开始异步转换
    const conversionId = await convertHtmlToMarkdown(documents, outputPath, options);
    
    res.json({
      success: true,
      data: {
        conversionId,
        message: '转换任务已开始'
      }
    });
  } catch (error) {
    console.error('开始转换失败:', error);
    res.status(500).json({
      success: false,
      error: '开始转换失败'
    });
  }
});

/**
 * 获取转换进度
 * GET /api/conversion/progress/:conversionId
 */
router.get('/progress/:conversionId', async (req: Request, res: Response) => {
  try {
    const { conversionId } = req.params;
    
    const progress = await getConversionProgress(conversionId);
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        error: '转换任务不存在'
      });
    }
    
    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('获取转换进度失败:', error);
    res.status(500).json({
      success: false,
      error: '获取转换进度失败'
    });
  }
});

/**
 * 获取转换历史记录
 * GET /api/conversion/history
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    // TODO: 实现转换历史记录功能
    res.json({
      success: true,
      data: {
        history: []
      }
    });
  } catch (error) {
    console.error('获取转换历史失败:', error);
    res.status(500).json({
      success: false,
      error: '获取转换历史失败'
    });
  }
});

export default router;