'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Send, Bot, User, FileText } from "lucide-react";
import { chatDetail, ChatMessage, ChatResponse } from '@/app/actions/chat';
import { toast } from "sonner";

export function RagChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastSources, setLastSources] = useState<ChatResponse['sources']>([]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Optimistic update or wait... let's wait for simplicity
      const response = await chatDetail([...messages, userMsg]);
      
      const botMsg: ChatMessage = { role: 'assistant', content: response.answer };
      setMessages(prev => [...prev, botMsg]);
      setLastSources(response.sources);
      
      if (response.error) {
        toast.error("Chat Error: " + response.error);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AIリサーチアシスタント
        </CardTitle>
        <CardDescription>
            契約書、社内ルール、案件について質問できます。
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="grid grid-cols-3 h-full">
            {/* Chat Area */}
            <div className="col-span-2 flex flex-col h-full border-r">
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-muted-foreground mt-20">
                                <p>ご質問をどうぞ！</p>
                                <p className="text-sm">例: 「支払条件を教えて」</p>
                            </div>
                        )}
                        {messages.map((m, i) => (
                            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                </div>
                                <div className={`p-3 rounded-lg max-w-[80%] text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="p-3 rounded-lg bg-muted text-sm animate-pulse">
                                    Thinking...
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t flex gap-2">
                    <Input 
                        placeholder="Type your question..." 
                        value={input} 
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        disabled={loading}
                    />
                    <Button size="icon" onClick={handleSend} disabled={loading}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Sources Area */}
            <div className="col-span-1 h-full flex flex-col bg-slate-50 dark:bg-slate-900/50">
                <div className="p-3 border-b font-semibold text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    引用元</div>
                <ScrollArea className="flex-1 p-3">
                    {lastSources.length > 0 ? (
                        <div className="space-y-3">
                            {lastSources.map((s, i) => (
                                <div key={i} className="p-3 rounded border bg-background text-xs text-muted-foreground">
                                    <div className="font-semibold text-primary mb-1 truncate" title={s.filename}>
                                        {s.filename}
                                        {s.page !== null && <span className="ml-1 text-muted-foreground font-normal">(ページ {s.page})</span>}
                                    </div>
                                    <div className="line-clamp-4 italic">
                                        "{s.excerpt}"
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-xs text-muted-foreground mt-10">
                            回答で引用された文書がここに表示されます。
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
