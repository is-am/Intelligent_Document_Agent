import axios from 'axios';
import { IDocument, GenerateRequest, ReviewRequest, FormatRequest } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const generateDocument = async (data: GenerateRequest): Promise<IDocument> => {
  const response = await api.post('/documents/generate', data);
  return response.data.document;
};

export const reviewDocument = async (data: ReviewRequest): Promise<any> => {
  const response = await api.post('/documents/review', data);
  return response.data.reviewReport;
};

export const formatDocument = async (data: FormatRequest): Promise<string> => {
  const response = await api.post('/documents/format', data);
  return response.data.content;
};

export const getAllDocuments = async (): Promise<IDocument[]> => {
  const response = await api.get('/documents');
  return response.data.documents;
};

export const getDocumentById = async (id: string): Promise<IDocument> => {
  const response = await api.get(`/documents/${id}`);
  return response.data.document;
};

export const updateDocument = async (id: string, data: Partial<IDocument>): Promise<IDocument> => {
  const response = await api.put(`/documents/${id}`, data);
  return response.data.document;
};

export const deleteDocument = async (id: string): Promise<void> => {
  await api.delete(`/documents/${id}`);
};