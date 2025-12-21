'use client';

import { useActionState, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { registerPayment } from '@/app/actions/register-payment';
import { PlusCircle } from "lucide-react";

type Invoice = {
  invoice_number: string;
  project_name?: string;
  amount?: number;
};

interface PaymentModalProps {
  invoices: Invoice[];
}

const initialState = {
  message: '',
  success: false,
};

export function PaymentModal({ invoices }: PaymentModalProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(registerPayment, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      setOpen(false);
      // Reset logic would go here if we weren't just closing the modal
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state]);

  // Default values
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          入金登録
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>入金情報の登録</DialogTitle>
          <DialogDescription>
            新しい入金を手動で登録します。
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="invoice" className="text-right">
                請求書
              </Label>
              <Select name="invoice_params" required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="請求書を選択" />
                </SelectTrigger>
                <SelectContent>
                  {invoices.map((inv) => (
                    <SelectItem key={inv.invoice_number} value={inv.invoice_number}>
                      {inv.invoice_number} {inv.project_name ? `- ${inv.project_name}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                入金日
              </Label>
              <Input
                id="date"
                name="payment_date"
                type="date"
                defaultValue={today}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                金額
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                placeholder="0"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="note" className="text-right">
                備考
              </Label>
              <Input
                id="note"
                name="note"
                className="col-span-3"
                placeholder="任意"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? '保存中...' : '入金を保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
