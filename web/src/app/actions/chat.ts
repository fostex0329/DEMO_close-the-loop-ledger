'use server';

import { query } from '@/lib/db';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
});

// --- RAG Schema Definition ---
const RAG_RESPONSE_SCHEMA = {
  name: "rag_response",
  strict: true,
  schema: {
    type: "object",
    properties: {
      answer: { type: "string" },
      citations: {
        type: "array",
        minItems: 1, // Enforce at least one citation if AI is called
        maxItems: 3,
        items: {
          type: "object",
          properties: {
            doc_id: { type: "string" },
            filename: { type: "string" },
            page: { type: ["integer", "null"] }, // Allow null for non-paged docs
            excerpt: { type: "string" }
          },
          required: ["doc_id", "filename", "page", "excerpt"],
          additionalProperties: false
        }
      }
    },
    required: ["answer", "citations"],
    additionalProperties: false
  }
};

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Citation {
  doc_id: string;
  filename: string;
  page: number | null;
  excerpt: string;
}

export interface ChatResponse {
  answer: string;
  sources: Citation[]; // Renamed internally to match schema 'citations' but keeping generic name for UI
  error?: string;
}

// Helper to determine model
const DEFAULT_MODEL = "gpt-4o-mini";
const FALLBACK_MODEL = "gpt-4o";

export async function chatDetail(messages: ChatMessage[]): Promise<ChatResponse> {
  const lastMessage = messages[messages.length - 1];
  const userQuery = lastMessage.content;

  if (!process.env.OPENAI_API_KEY && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
    return {
      answer: "API Key is missing. Please set OPENAI_API_KEY in .env file.",
      sources: []
    };
  }

  // --- DEMO MODE: Return Fixed Response ---
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      console.log("Using DEMO MODE for Chat");
      
      // Return different answers based on keywords to simulate intelligence
      if (userQuery.includes("支払") && userQuery.includes("条件")) {
          return {
              answer: "本案件の支払条件は「月末締め翌月末払い（Net 30相当）」です。契約書に基づき、請求書発行から翌月末日までの入金が必要です。なお、遅延時の損害金は年率14.6%と定められています。",
              sources: [{
                  doc_id: "DOC-202512-C-0002-JP",
                  filename: "DOC-202512-C-0002-JP.pdf",
                  page: 1,
                  excerpt: "第2条（支払条件）1. 請求締め日：毎月末日 2. 請求書発行日：締め日から5営業日以内 3. 支払期日：請求書発行日の翌月末日（Net 30相当）"
              }]
          };
      } else if (userQuery.includes("検収")) {
          return {
              answer: "検収条件は「納品日から10営業日以内」となっています。期間内に異議がない場合は、自動的に検収完了とみなされます。",
              sources: [{
                  doc_id: "DOC-202512-C-0002-JP",
                  filename: "DOC-202512-C-0002-JP.pdf",
                  page: 1,
                  excerpt: "第3条（検収）検収期間：納品日から10営業日以内。みなし検収：期間内に異議がない場合は検収完了とする。"
              }]
          };
      } else if (userQuery.includes("督促")) {
          return {
              answer: "督促フローは以下の通りです：支払期日から1営業日後に一次督促（メール）、7日後に二次督促（電話/書面）、14日後に経営者エスカレーション（取引停止判断）となります。",
              sources: [{
                  doc_id: "DOC-202512-POL-0002-JP",
                  filename: "DOC-202512-POL-0002-JP.pdf",
                  page: 1,
                  excerpt: "2. 督促フロー【RAG重要項目】・支払期日＋1営業日：一次督促（メール）・支払期日＋7日：二次督促（電話/書面）・支払期日＋14日：経営者エスカレーション（停止判断）"
              }]
          };
      }
      
      // Default fallback for demo
      return {
          answer: "これはデモ版（Mock Mode）です。契約書や発注書の内容に基づいて回答します。例えば「支払条件は？」「検収期間は？」「督促フローは？」と聞いてみてください。",
          sources: [{
              doc_id: "DOC-202512-POL-0002-JP",
              filename: "DOC-202512-POL-0002-JP.pdf",
              page: 1,
              excerpt: "社内ルール：請求・入金管理 適用範囲：全案件"
          }]
      };
  }

  try {
    // 1. Retrieval - Improved for Japanese/English bilingual support
    // Japanese text has no spaces, so we need different tokenization
    const isJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(userQuery);
    
    let sql = `SELECT doc_id, filename, content FROM main_gold.gold_documents WHERE 1=1 `;
    const params: any[] = [];
    
    if (isJapanese) {
        // For Japanese: Split by common particles (の, を, は, が, に, で, と, も, や, か, て) and punctuation
        // This creates meaningful search terms from natural language queries
        const jpKeywords = userQuery
            .replace(/[？！。、「」『』（）・\s]/g, ' ')  // Punctuation → space
            .replace(/[のをはがにでともやかてより]/g, ' ')  // Common particles → space
            .split(/\s+/)
            .filter(w => w.length >= 2);  // Keep tokens 2+ chars
        
        if (jpKeywords.length > 0) {
            sql += "AND (";
            const conditions = jpKeywords.map(() => `content ILIKE ?`);
            // Also add the full query as a fallback match
            conditions.push(`content ILIKE ?`);
            sql += conditions.join(" OR ");
            sql += ")";
            jpKeywords.forEach(k => params.push(`%${k}%`));
            params.push(`%${userQuery.replace(/[？！。、\s]/g, '')}%`);  // Full query stripped
        } else {
            // Fallback: search with the entire query if no keywords extracted
            sql += "AND content ILIKE ?";
            params.push(`%${userQuery}%`);
        }
    } else {
        // English: standard space-based tokenization  
        const keywords = userQuery.split(' ').filter(w => w.length > 2);
        if (keywords.length > 0) {
            sql += "AND (";
            const conditions = keywords.map(() => `content ILIKE ?`);
            sql += conditions.join(" OR ");
            sql += ")";
            keywords.forEach(k => params.push(`%${k}%`));
        }
    }
    
    sql += " LIMIT 5";
    
    const docs = await query(sql, params) as { doc_id: string, filename: string, content: string }[];

    // --- SHORT-CIRCUIT: No Ops if 0 docs found ---
    if (docs.length === 0) {
        return {
            answer: "申し訳ありませんが、関連する文書が見つかりませんでした。（検索結果 0件）",
            sources: []
        };
    }
    
    // Prepare Context
    // We add a fake "page" number (e.g. 1) since our raw text doesn't have it, 
    // or we tell LLM to infer/use null.
    const context = docs.map((d, i) => `[DocID: ${d.doc_id}] Filename: ${d.filename}\nContent: ${d.content.substring(0, 800)}...`).join("\n\n");

    const systemPrompt = `
      You are an intelligent assistant for a business ledger system. 
      Answer the user's question based strictly on the provided Context.
      
      Rules:
      1. You MUST cite the source document for every claim.
      2. If you cannot find the answer in the context, output "不明（文書に記載なし）" or "Unknown (not found in documents)".
      3. Return response in JSON format matching the schema.
      4. If the source text doesn't have explicit page numbers, return null for 'page'.
      5. IMPORTANT: Respond in the same language as the user's question.
         - If the user asks in Japanese, answer in Japanese.
         - If the user asks in English, answer in English.
      
      Context:
      ${context}
    `;

    // 2. Generation with Fallback Logic
    let finalResult = null;
    let attemptModel = DEFAULT_MODEL;

    // First Attempt
    try {
        finalResult = await callOpenAI(attemptModel, systemPrompt, messages);
    } catch (e) {
        console.warn(`Attempt 1 with ${attemptModel} failed:`, e);
        // Fallback checks
        attemptModel = FALLBACK_MODEL;
        console.log(`Retrying with fallback model: ${attemptModel}`);
        finalResult = await callOpenAI(attemptModel, systemPrompt, messages);
    }

    return {
      answer: finalResult.answer,
      sources: finalResult.citations
    };

  } catch (error: any) {
    console.error("Chat Error:", error);
    return {
      answer: "Sorry, an error occurred while processing your request.",
      sources: [],
      error: error.message
    };
  }
}

async function callOpenAI(model: string, systemPrompt: string, messages: ChatMessage[]) {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ],
      response_format: {
        type: "json_schema",
        json_schema: RAG_RESPONSE_SCHEMA as any // Cast to any to avoid strict typing issues with specific SDK versions
      },
    });

    const content = completion.choices[0].message.content;
    console.log("--- OpenAI RAG Response Debug ---\n", content, "\n-------------------------------");
    if (!content) throw new Error("No content generated");
    
    const parsed = JSON.parse(content);
    
    // Validate 'citations' minItems manually if SDK doesn't strictly enforce it on the specific model version yet,
    // though 'strict: true' should handle it.
    if (!parsed.citations || parsed.citations.length === 0) {
        throw new Error("Citations missing in schema output");
    }
    
    return parsed;
}
