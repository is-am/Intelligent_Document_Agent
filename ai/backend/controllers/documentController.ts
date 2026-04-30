import { Request, Response } from 'express';
import Document, { IDocument } from '../models/Document';
import { generateDocument, reviewDocument, formatDocument } from '../services/openaiService';

export const generate = async (req: Request, res: Response) => {
  try {
    const { title, content, type, languageStyle } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: '标题和内容不能为空' });
    }

    const generatedContent = await generateDocument(title, content, type || 'other', languageStyle || 'formal');

    const document = new Document({
      title,
      content: generatedContent,
      type: type || 'other',
      languageStyle: languageStyle || 'formal',
      status: 'draft'
    });

    await document.save();

    res.status(200).json({
      success: true,
      document: {
        id: document._id,
        title: document.title,
        content: document.content,
        type: document.type,
        languageStyle: document.languageStyle,
        status: document.status,
        createdAt: document.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: '文档生成失败', details: (error as Error).message });
  }
};

export const review = async (req: Request, res: Response) => {
  try {
    const { documentId, content } = req.body;

    if (!content) {
      return res.status(400).json({ error: '文档内容不能为空' });
    }

    const reviewResult = await reviewDocument(content);

    if (documentId) {
      await Document.findByIdAndUpdate(documentId, {
        content,
        reviewReport: reviewResult,
        status: 'reviewed',
        updatedAt: new Date()
      });
    }

    res.status(200).json({
      success: true,
      reviewReport: reviewResult
    });
  } catch (error) {
    res.status(500).json({ error: '文档审查失败', details: (error as Error).message });
  }
};

export const format = async (req: Request, res: Response) => {
  try {
    const { content, format } = req.body;

    if (!content) {
      return res.status(400).json({ error: '文档内容不能为空' });
    }

    const formattedContent = await formatDocument(content, format || 'markdown');

    res.status(200).json({
      success: true,
      content: formattedContent
    });
  } catch (error) {
    res.status(500).json({ error: '文档格式化失败', details: (error as Error).message });
  }
};

export const getAllDocuments = async (req: Request, res: Response) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      documents: documents.map(doc => ({
        id: doc._id,
        title: doc.title,
        type: doc.type,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: '获取文档列表失败', details: (error as Error).message });
  }
};

export const getDocumentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ error: '文档不存在' });
    }

    res.status(200).json({
      success: true,
      document: {
        id: document._id,
        title: document.title,
        content: document.content,
        type: document.type,
        languageStyle: document.languageStyle,
        status: document.status,
        reviewReport: document.reviewReport,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: '获取文档失败', details: (error as Error).message });
  }
};

export const updateDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, type, languageStyle, status } = req.body;

    const document = await Document.findByIdAndUpdate(
      id,
      {
        title,
        content,
        type,
        languageStyle,
        status,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ error: '文档不存在' });
    }

    res.status(200).json({
      success: true,
      document: {
        id: document._id,
        title: document.title,
        content: document.content,
        type: document.type,
        languageStyle: document.languageStyle,
        status: document.status,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: '更新文档失败', details: (error as Error).message });
  }
};

export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const document = await Document.findByIdAndDelete(id);

    if (!document) {
      return res.status(404).json({ error: '文档不存在' });
    }

    res.status(200).json({
      success: true,
      message: '文档已删除'
    });
  } catch (error) {
    res.status(500).json({ error: '删除文档失败', details: (error as Error).message });
  }
};