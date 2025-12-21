'use server';

import { query } from '@/lib/db';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
});

// --- Weekly Report Schema Definition ---
const WEEKLY_REPORT_SCHEMA = {
  name: "weekly_report",
  strict: true,
  schema: {
    type: "object",
    properties: {
      status_summary: { 
          type: "string", 
          description: "2-3 sentences summarizing financial health." 
      },
      key_highlights: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: {
            type: "object", // Changed to object to ensure STRICT adherence rules in all SDKs
            properties: { 
                point: { type: "string" } 
            },
            required: ["point"],
            additionalProperties: false
        },
        description: "Exactly 3 key points."
      },
      next_actions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            order_id: { type: "string" },
            category: { 
                type: "string", 
                enum: ["billing_reminder", "payment_confirmation", "contract_review", "unknown"] 
            },
            suggested_action: { type: "string" },
            reasoning_source: { type: "string", description: "Specific field/clause used as evidence" }
          },
          required: ["order_id", "category", "suggested_action", "reasoning_source"],
          additionalProperties: false
        }
      }
    },
    required: ["status_summary", "key_highlights", "next_actions"],
    additionalProperties: false
  }
};

const DEFAULT_MODEL = "gpt-5-nano";
const FALLBACK_MODEL = "gpt-5-mini"; 

export interface ReportData {
    status_summary: string;
    key_highlights: string[];
    next_actions: {
        order_id: string;
        category: string;
        suggested_action: string;
        reasoning_source: string;
    }[];
}

export async function generateWeeklyReport(): Promise<ReportData | { error: string }> {
    if (!process.env.OPENAI_API_KEY && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
        return { error: "API Key Missing" };
    }

    // --- DEMO MODE: Return Fixed Report ---
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
        // Simulate network delay for realism
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return {
            status_summary: "【デモ版】全体の回収状況は良好ですが、2件の期限超過案件が発生しており注意が必要です。未請求額は前週比で減少傾向にあります。",
            key_highlights: [
                "期限超過案件が2件（合計50万円）発生しており、督促が必要です。",
                "今週の新規受注は3件、合計120万円で順調に推移しています。",
                "未請求の案件が1件あり、月末までの対応が推奨されます。"
            ],
            next_actions: [
                {
                    order_id: "ORD-2025-001",
                    category: "billing_reminder",
                    suggested_action: "㈱サンプル商事へ再督促メールを送信してください。",
                    reasoning_source: "支払期日(12/20)から3日経過"
                },
                {
                    order_id: "ORD-2025-004",
                    category: "contract_review",
                    suggested_action: "次回契約更新に向けて、単価交渉の準備を推奨します。",
                    reasoning_source: "利益率低下の兆候あり"
                }
            ]
        };
    }

    try {
        // 1. Fetch Data (Unbilled/Overdue for Context)
        // Aggregating some stats for the LLM to digest
        const ledgerData = await query(`
            SELECT 
                sequence_no as order_id, 
                organization_name as company_name, 
                order_date, 
                amount as total_amount, 
                0 as billed_amount, -- Not currently in gold_ledger view
                0 as paid_amount,   -- Not currently in gold_ledger view
                billing_status as payment_status, 
                CASE 
                    WHEN billing_status = 'OVERDUE' THEN 'Urgent Attention'
                    WHEN billing_status = 'UNBILLED' THEN 'Action Required'
                    ELSE 'OK'
                END as attention_level
            FROM main_gold.gold_ledger
            WHERE billing_status IN ('OVERDUE', 'UNBILLED')
            LIMIT 20
        `);

        const context = JSON.stringify(ledgerData, null, 2);
        
        const systemPrompt = `
            You are a financial analyst generating a weekly status report.
            Analyze the provided ledger data (JSON) and output a structured report.
            
            Rules:
            1. 'key_highlights' MUST contain exactly 3 distinct points.
            2. For 'next_actions', you must cite the specific 'order_id' and the reasoning (e.g. "Overdue by 5 days").
            3. Do not hallucinate data not present in the JSON.
            
            Data:
            ${context}
        `;

        // 2. Generation with Fallback
        let attemptModel = DEFAULT_MODEL;
        let finalResult = null;

        try {
            finalResult = await callOpenAIReport(attemptModel, systemPrompt);
        } catch (e) {
            console.warn(`Report Gen Attempt 1 (${attemptModel}) failed:`, e);
            attemptModel = FALLBACK_MODEL;
            finalResult = await callOpenAIReport(attemptModel, systemPrompt);
        }

        return {
            status_summary: finalResult.status_summary,
            key_highlights: finalResult.key_highlights.map((k: any) => k.point),
            next_actions: finalResult.next_actions
        };

    } catch (error: any) {
        console.error("Report Gen Error:", error);
        return { error: error.message };
    }
}

async function callOpenAIReport(model: string, systemPrompt: string) {
    const completion = await openai.chat.completions.create({
        model: model,
        messages: [{ role: 'system', content: systemPrompt }],
        response_format: {
            type: "json_schema",
            json_schema: WEEKLY_REPORT_SCHEMA as any
        },
    });
    
    const content = completion.choices[0].message.content;
    console.log("--- OpenAI Report Response Debug ---\n", content, "\n----------------------------------");
    if (!content) throw new Error("No content");
    
    const parsed = JSON.parse(content);
    
    // Explicit Validation for Fallback Trigger
    if (!parsed.key_highlights || parsed.key_highlights.length !== 3) {
        throw new Error("Highlight count mismatch (Requirement: 3)");
    }
    
    return parsed;
}
