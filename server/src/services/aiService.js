import { env } from '../config/env.js';
import { listProductLibrary, findLibraryMatch } from './productLibraryService.js';

function safeParseJson(content) {
  const cleaned = String(content || '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function normalizeMatch(payload, fallback = {}) {
  return {
    product: payload?.product || fallback.product || '未识别商品',
    amount: Number(payload?.amount ?? fallback.amount ?? 0),
    cost: Number(payload?.cost ?? fallback.cost ?? 0)
  };
}

export async function matchProductByAI(text) {
  const library = await listProductLibrary();
  const fallback = findLibraryMatch(text, library) || {
    product: '未识别商品',
    amount: 0,
    cost: 0
  };

  if (env.AI_PROVIDER !== 'openai' || !env.OPENAI_API_KEY) {
    return {
      ...fallback,
      source: 'library-fallback'
    };
  }

  const promptLibrary = library
    .slice(0, 50)
    .map(
      (item) =>
        `关键词:${item.keyword}; 标准商品:${item.product_name}; 默认金额:${item.default_amount}; 成本:${item.cost_price}`
    )
    .join('\n');

  const response = await fetch(`${env.OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL,
      temperature: 0.1,
      messages: [
        {
          role: 'system',
          content:
            '你是 ERP 商品识别引擎。你必须只输出 JSON，不允许输出 Markdown、解释文字或多余内容。输出格式固定为 {"product":"标准商品名","amount":价格,"cost":成本价}。如果无法完全判断，结合商品库和常识给出最合理结果，数值必须为数字。'
        },
        {
          role: 'user',
          content: `商品库参考如下：\n${promptLibrary || '暂无商品库数据'}\n\n用户输入：${text}`
        }
      ]
    })
  });

  if (!response.ok) {
    return {
      ...fallback,
      source: 'library-fallback'
    };
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  const parsed = safeParseJson(content);

  if (!parsed) {
    return {
      ...fallback,
      source: 'library-fallback'
    };
  }

  return {
    ...normalizeMatch(parsed, fallback),
    source: 'openai'
  };
}
