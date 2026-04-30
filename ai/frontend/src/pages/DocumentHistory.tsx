import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDocuments, deleteDocument } from '../services/api';
import { IDocument } from '../types';

const DocumentHistory = () => {
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await getAllDocuments();
      setDocuments(result);
    } catch (err) {
      setError('获取文档列表失败');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (id: string) => {
    navigate(`/document/${id}`);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`确定要删除文档「${title}」吗？`)) {
      return;
    }

    try {
      await deleteDocument(id);
      setDocuments(documents.filter(doc => doc.id !== id));
    } catch (err) {
      alert('删除文档失败');
      console.error(err);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      report: '报告',
      proposal: '提案',
      contract: '合同',
      technical: '技术文档',
      marketing: '营销计划',
      other: '其他',
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: '草稿',
      reviewed: '已审查',
      approved: '已批准',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">历史记录</h1>
        <p className="text-gray-600">查看和管理您的文档历史</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-600">{error}</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500">暂无文档记录</p>
          <p className="text-gray-400 text-sm mt-1">您可以先去生成一份文档</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">标题</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">类型</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">状态</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">创建时间</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 truncate max-w-xs">{doc.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{getTypeLabel(doc.type)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}>
                      {getStatusLabel(doc.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{formatDate(doc.createdAt)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleView(doc.id)}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        查看
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id, doc.title)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DocumentHistory;