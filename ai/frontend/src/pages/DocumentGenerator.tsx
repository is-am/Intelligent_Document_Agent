import { useState } from 'react';
import { generateDocument as apiGenerateDocument } from '../services/api';
import { DocumentType, LanguageStyle, GenerateRequest, IDocument } from '../types';

const documentTypes: { value: DocumentType; label: string }[] = [
  { value: 'report', label: '报告' },
  { value: 'proposal', label: '提案' },
  { value: 'contract', label: '合同' },
  { value: 'technical', label: '技术文档' },
  { value: 'marketing', label: '营销计划' },
  { value: 'other', label: '其他' },
];

const languageStyles: { value: LanguageStyle; label: string }[] = [
  { value: 'formal', label: '正式' },
  { value: 'concise', label: '简洁' },
  { value: 'detailed', label: '详细' },
  { value: 'casual', label: '随意' },
];

const DocumentGenerator = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<DocumentType>('other');
  const [languageStyle, setLanguageStyle] = useState<LanguageStyle>('formal');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<IDocument | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('请填写标题和内容要点');
      return;
    }

    setError('');
    setIsGenerating(true);
    setGeneratedDocument(null);

    try {
      const request: GenerateRequest = {
        title,
        content,
        type,
        languageStyle,
      };
      const result = await apiGenerateDocument(request);
      setGeneratedDocument(result);
    } catch (err) {
      setError('文档生成失败，请稍后重试');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (generatedDocument) {
      await navigator.clipboard.writeText(generatedDocument.content);
      alert('内容已复制到剪贴板');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">文档生成</h1>
        <p className="text-gray-600">输入标题和内容要点，AI 将为您生成专业文档</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">文档标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="请输入文档标题"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">内容要点</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
            placeholder="请输入文档的主要内容要点，用换行分隔"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">文档类型</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as DocumentType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            >
              {documentTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">语言风格</label>
            <select
              value={languageStyle}
              onChange={(e) => setLanguageStyle(e.target.value as LanguageStyle)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            >
              {languageStyles.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isGenerating}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>生成中...</span>
            </>
          ) : (
            <span>生成文档</span>
          )}
        </button>
      </form>

      {generatedDocument && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">生成结果</h2>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>复制内容</span>
            </button>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{generatedDocument.title}</h3>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <pre className="whitespace-pre-wrap text-gray-700 font-sans text-sm max-h-[500px] overflow-y-auto scrollbar-thin">
              {generatedDocument.content}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentGenerator;