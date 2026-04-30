import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const generateDocument = async (
  title: string,
  content: string,
  type: string,
  languageStyle: string
): Promise<string> => {
  const stylePrompt = {
    formal: '正式、专业的语言风格',
    concise: '简洁明了的语言风格',
    detailed: '详细、全面的语言风格',
    casual: '轻松、随意的语言风格'
  };

  const typePrompt = {
    report: '正式报告',
    proposal: '商业提案',
    contract: '合同文件',
    technical: '技术文档',
    marketing: '营销计划',
    other: '文档'
  };

  const prompt = `
    请帮我生成一份${typePrompt[type as keyof typeof typePrompt]}，标题为「${title}」。

    参考内容要点：
    ${content}

    请使用${stylePrompt[languageStyle as keyof typeof stylePrompt]}，生成一份结构清晰、内容完整的文档。
    文档应包含适当的章节标题、引言、主体内容和结论。
  `;

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 3000
  });

  return response.choices[0].message.content || '';
};

export const reviewDocument = async (content: string): Promise<any> => {
  const prompt = `
    请对以下文档进行全面审查，包括：
    1. 语法错误检测
    2. 拼写错误检测
    3. 逻辑一致性分析
    4. 情感分析
    5. 语言风格评估

    文档内容：
    ${content}

    请以JSON格式输出审查结果，包含以下字段：
    - grammarIssues: 语法问题数组，每个元素包含position(位置描述)、issue(问题描述)、suggestion(修改建议)
    - spellingIssues: 拼写问题数组，每个元素包含position(位置)、word(错误单词)、suggestion(正确建议)
    - logicIssues: 逻辑问题数组，每个元素包含position(位置)、issue(问题描述)、suggestion(修改建议)
    - sentimentAnalysis: 对象，包含score(情感分数-1到1)、label(情感标签)、suggestions(改进建议数组)
    - overallRating: 整体评分(1-10)
    - suggestions: 总体改进建议数组
    - optimizedContent: 优化后的文档内容
  `;

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 4000
  });

  try {
    return JSON.parse(response.choices[0].message.content || '{}');
  } catch {
    return {
      grammarIssues: [],
      spellingIssues: [],
      logicIssues: [],
      sentimentAnalysis: { score: 0, label: 'neutral', suggestions: [] },
      overallRating: 7,
      suggestions: [],
      optimizedContent: content
    };
  }
};

export const formatDocument = async (content: string, format: string): Promise<string> => {
  const formatPrompt = {
    markdown: 'Markdown格式',
    html: 'HTML格式',
    plain: '纯文本格式'
  };

  const prompt = `
    请将以下文档转换为${formatPrompt[format as keyof typeof formatPrompt]}：

    文档内容：
    ${content}

    请确保格式正确，结构清晰。
  `;

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 3000
  });

  return response.choices[0].message.content || '';
};