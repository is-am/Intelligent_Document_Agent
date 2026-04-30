import { useState } from 'react';
import { reviewDocument as apiReviewDocument } from '../services/api';
import { IReviewReport } from '../types';

const DocumentReviewer = () => {
  const [content, setContent] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewReport, setReviewReport] = useState<IReviewReport | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'original' | 'optimized'>('original');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('请输入要审查的文档内容');
      return;
    }

    setError('');
    setIsReviewing(true);
    setReviewReport(null);

    try {
      const result = await apiReviewDocument({ content });
      setReviewReport(result);
    } catch (err) {
      setError('文档审查失败，请稍后重试');
      console.error(err);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    alert('内容已复制到剪贴板');
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">文档审查</h1>
        <p className="text-gray-600">输入文档内容，AI 将进行语法、拼写、逻辑和情感分析</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">文档内容</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
            placeholder="请输入要审查的文档内容"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isReviewing}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isReviewing ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>审查中...</span>
            </>
          ) : (
            <span>审查文档</span>
          )}
        </button>
      </form>

      {reviewReport && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">审查报告</h2>
              <div className="flex items-center space-x-2">
                <span className="text-white/80">整体评分</span>
                <span className={`text-3xl font-bold ${getRatingColor(reviewReport.overallRating)} bg-white px-4 py-1 rounded-lg`}>
                  {reviewReport.overallRating}/10
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => setActiveTab('original')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'original'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  原始内容
                </button>
                <button
                  onClick={() => setActiveTab('optimized')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'optimized'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  优化后内容
                </button>
                <button
                  onClick={() => handleCopy(activeTab === 'original' ? content : reviewReport.optimizedContent)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>复制</span>
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <pre className="whitespace-pre-wrap text-gray-700 font-sans text-sm max-h-[300px] overflow-y-auto scrollbar-thin">
                  {activeTab === 'original' ? content : reviewReport.optimizedContent}
                </pre>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {reviewReport.grammarIssues.length > 0 && (
                <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                  <h3 className="font-semibold text-yellow-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    语法问题 ({reviewReport.grammarIssues.length})
                  </h3>
                  <ul className="space-y-2">
                    {reviewReport.grammarIssues.map((issue, index) => (
                      <li key={index} className="text-sm text-yellow-700">
                        <span className="font-medium">位置: {issue.position}</span>
                        <p>问题: {issue.issue}</p>
                        <p className="text-yellow-600">建议: {issue.suggestion}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {reviewReport.spellingIssues.length > 0 && (
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h3 className="font-semibold text-red-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    拼写错误 ({reviewReport.spellingIssues.length})
                  </h3>
                  <ul className="space-y-2">
                    {reviewReport.spellingIssues.map((issue, index) => (
                      <li key={index} className="text-sm text-red-700">
                        <span className="font-medium">位置: {issue.position}</span>
                        <p>错误: <span className="font-bold">{issue.word}</span></p>
                        <p className="text-red-600">建议: {issue.suggestion}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {reviewReport.logicIssues.length > 0 && (
                <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                  <h3 className="font-semibold text-orange-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    逻辑问题 ({reviewReport.logicIssues.length})
                  </h3>
                  <ul className="space-y-2">
                    {reviewReport.logicIssues.map((issue, index) => (
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
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  情感分析
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-600">情感标签</span>
                    <span className="font-medium text-blue-800">{getSentimentLabel(reviewReport.sentimentAnalysis.label)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-600">情感分数</span>
                    <span className="font-medium text-blue-800">{reviewReport.sentimentAnalysis.score.toFixed(2)}</span>
                  </div>
                  {reviewReport.sentimentAnalysis.suggestions.length > 0 && (
                    <div>
                      <span className="text-sm text-blue-600 block mb-1">改进建议:</span>
                      <ul className="space-y-1">
                        {reviewReport.sentimentAnalysis.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm text-blue-700">- {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {reviewReport.suggestions.length > 0 && (
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  总体改进建议
                </h3>
                <ul className="space-y-2">
                  {reviewReport.suggestions.map((suggestion, index) => (
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

export default DocumentReviewer;