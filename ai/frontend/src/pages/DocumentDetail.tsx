import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocumentById, updateDocument, reviewDocument } from '../services/api';
import { IDocument, DocumentStatus, IReviewReport } from '../types';

const DocumentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<IDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDocument();
    }
  }, [id]);

  const fetchDocument = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await getDocumentById(id!);
      setDocument(result);
      setEditedContent(result.content);
    } catch (err) {
      setError('获取文档失败');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!document || editedContent.trim() === '') {
      return;
    }

    try {
      const updated = await updateDocument(id!, { ...document, content: editedContent });
      setDocument(updated);
      setIsEditing(false);
    } catch (err) {
      alert('保存失败');
      console.error(err);
    }
  };

  const handleReview = async () => {
    if (!document) return;

    setIsReviewing(true);
    try {
      const reviewResult = await reviewDocument({ documentId: id!, content: document.content });
      const updated = await getDocumentById(id!);
      setDocument(updated);
    } catch (err) {
      alert('审查失败');
      console.error(err);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleStatusChange = async (status: DocumentStatus) => {
    if (!document) return;

    try {
      const updated = await updateDocument(id!, { ...document, status });
      setDocument(updated);
    } catch (err) {
      alert('更新状态失败');
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

  const getLanguageStyleLabel = (style: string) => {
    const labels: Record<string, string> = {
      formal: '正式',
      concise: '简洁',
      detailed: '详细',
      casual: '随意',
    };
    return labels[style] || style;
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

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-600';
    if (rating >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSentimentLabel = (label: string) => {
    const labels: Record<string, string> = {
      positive: '积极',
      neutral: '中性',
      negative: '消极',
    };
    return labels[label] || label;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-600">{error || '文档不存在'}</p>
          <button
            onClick={() => navigate('/history')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('/history')}
            className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 mb-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>返回</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{document.title}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>{isEditing ? '取消' : '编辑'}</span>
          </button>
          {!isEditing && (
            <button
              onClick={handleReview}
              disabled={isReviewing}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {isReviewing ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>审查中</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>审查文档</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm text-gray-500 mb-1">文档类型</div>
          <div className="font-medium text-gray-800">{getTypeLabel(document.type)}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm text-gray-500 mb-1">语言风格</div>
          <div className="font-medium text-gray-800">{getLanguageStyleLabel(document.languageStyle)}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm text-gray-500 mb-1">状态</div>
          <div className="flex items-center justify-between">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status)}`}>
              {getStatusLabel(document.status)}
            </span>
            <select
              value={document.status}
              onChange={(e) => handleStatusChange(e.target.value as DocumentStatus)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">草稿</option>
              <option value="reviewed">已审查</option>
              <option value="approved">已批准</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm text-gray-500 mb-1">创建时间</div>
          <div className="font-medium text-gray-800">{formatDate(document.createdAt)}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm text-gray-500 mb-1">更新时间</div>
          <div className="font-medium text-gray-800">{formatDate(document.updatedAt)}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">文档内容</h2>
        {isEditing ? (
          <div>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={15}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setEditedContent(document.content);
                  setIsEditing(false);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <pre className="whitespace-pre-wrap text-gray-700 font-sans text-sm max-h-[500px] overflow-y-auto scrollbar-thin">
              {document.content}
            </pre>
          </div>
        )}
      </div>

      {document.reviewReport && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">审查报告</h2>
              <div className="flex items-center space-x-2">
                <span className="text-white/80">整体评分</span>
                <span className={`text-3xl font-bold ${getRatingColor(document.reviewReport.overallRating)} bg-white px-4 py-1 rounded-lg`}>
                  {document.reviewReport.overallRating}/10
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {document.reviewReport.grammarIssues.length > 0 && (
                <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                  <h3 className="font-semibold text-yellow-800 mb-3">语法问题 ({document.reviewReport.grammarIssues.length})</h3>
                  <ul className="space-y-2">
                    {document.reviewReport.grammarIssues.map((issue, index) => (
                      <li key={index} className="text-sm text-yellow-700">
                        <span className="font-medium">位置: {issue.position}</span>
                        <p>问题: {issue.issue}</p>
                        <p className="text-yellow-600">建议: {issue.suggestion}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {document.reviewReport.spellingIssues.length > 0 && (
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h3 className="font-semibold text-red-800 mb-3">拼写错误 ({document.reviewReport.spellingIssues.length})</h3>
                  <ul className="space-y-2">
                    {document.reviewReport.spellingIssues.map((issue, index) => (
                      <li key={index} className="text-sm text-red-700">
                        <span className="font-medium">位置: {issue.position}</span>
                        <p>错误: <span className="font-bold">{issue.word}</span></p>
                        <p className="text-red-600">建议: {issue.suggestion}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {document.reviewReport.logicIssues.length > 0 && (
                <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                  <h3 className="font-semibold text-orange-800 mb-3">逻辑问题 ({document.reviewReport.logicIssues.length})</h3>
                  <ul className="space-y-2">
                    {document.reviewReport.logicIssues.map((issue, index) => (
                      <li key={index} className="text-sm text-orange-700">
                        <span className="font-medium">位置: {issue.position}</span>
                        <p>问题: {issue.issue}</p>
                        <p className="text-orange-600">建议: {issue.suggestion}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h3 className="font-semibold text-blue-800 mb-3">情感分析</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-600">情感标签</span>
                    <span className="font-medium text-blue-800">{getSentimentLabel(document.reviewReport.sentimentAnalysis.label)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-600">情感分数</span>
                    <span className="font-medium text-blue-800">{document.reviewReport.sentimentAnalysis.score.toFixed(2)}</span>
                  </div>
                  {document.reviewReport.sentimentAnalysis.suggestions.length > 0 && (
                    <div>
                      <span className="text-sm text-blue-600 block mb-1">改进建议:</span>
                      <ul className="space-y-1">
                        {document.reviewReport.sentimentAnalysis.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm text-blue-700">- {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">优化后内容</h3>
              <pre className="whitespace-pre-wrap text-gray-700 font-sans text-sm max-h-[300px] overflow-y-auto scrollbar-thin bg-gray-50 p-4 rounded">
                {document.reviewReport.optimizedContent}
              </pre>
            </div>

            {document.reviewReport.suggestions.length > 0 && (
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <h3 className="font-semibold text-green-800 mb-3">总体改进建议</h3>
                <ul className="space-y-2">
                  {document.reviewReport.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-green-700 flex items-start">
                      <span className="font-bold mr-2">{index + 1}.</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentDetail;