'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { generateWeeklyReport, ReportData } from '@/app/actions/report';
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ReportGenerator() {
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<ReportData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await generateWeeklyReport();
            if ('error' in data) {
                setError(data.error);
                toast.error("Failed to generate report");
            } else {
                setReport(data);
                toast.success("Report generated successfully");
            }
        } catch (e) {
            console.error(e);
            setError("Unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">AI週次分析</h3>
                <Button onClick={handleGenerate} disabled={loading} size="sm">
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            分析中...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            レポートを生成 (Beta)
                        </>
                    )}
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>エラー</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {report && (
                <Card className="bg-slate-50 dark:bg-slate-900/50">
                    <CardContent className="pt-6 space-y-6">
                        {/* Summary */}
                        <div>
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                ステータス概要
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {report.status_summary}
                            </p>
                        </div>

                        {/* Highlights */}
                        <div>
                            <h4 className="font-semibold text-sm mb-2">主なポイント</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                {report.key_highlights.map((point, i) => (
                                    <li key={i}>{point}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Next Actions */}
                        <div>
                            <h4 className="font-semibold text-sm mb-2">推奨アクション</h4>
                            <div className="space-y-3">
                                {report.next_actions.map((action, i) => (
                                    <div key={i} className="bg-background border rounded p-3 text-sm">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-medium">案件 #{action.order_id}</span>
                                            <span className="text-xs bg-muted px-2 py-0.5 rounded uppercase">{action.category}</span>
                                        </div>
                                        <p className="text-muted-foreground mb-2">{action.suggested_action}</p>
                                        <div className="text-xs text-orange-600 bg-orange-50 dark:bg-orange-950/20 p-1.5 rounded inline-block">
                                            💡 理由: {action.reasoning_source}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
