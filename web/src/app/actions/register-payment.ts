'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';

export async function registerPayment(prevState: any, formData: FormData) {
  const invoiceParams = formData.get('invoice_params');
  const paymentDate = formData.get('payment_date');
  const amount = formData.get('amount');
  const note = formData.get('note');

  if (!invoiceParams || !paymentDate || !amount) {
    return { message: 'Missing required fields', success: false };
  }

  // invoiceParams is expected to be "invoice_number,order_key" or similar
  // Let's parse it.
  // Actually, let's keep it simple: Invoice Number is the key here.
  const invoiceNumber = invoiceParams.toString();

  // Define path to CSV
  // Note: effectively we are writing to the project root's data/raw folder
  // We need to be careful about the path resolution in Next.js server environment
  const csvPath = path.join(process.cwd(), '..', 'data', 'raw', 'payments_app.csv');

  // Format: payment_id, invoice_number, payment_date, amount, note, created_at
  const paymentId = `PAY-${Date.now()}`;
  const createdAt = new Date().toISOString();
  
  // Clean string to avoid CSV issues
  const cleanNote = note?.toString().replace(/,/g, ' ') || '';

  const csvLine = `${paymentId},${invoiceNumber},${paymentDate},${amount},${cleanNote},${createdAt}\n`;

  try {
    // Check if file exists, if not create with header
    if (!fs.existsSync(csvPath)) {
        const header = 'payment_id,invoice_number,payment_date,amount,note,created_at\n';
        fs.writeFileSync(csvPath, header, { encoding: 'utf8' });
    }

    fs.appendFileSync(csvPath, csvLine, { encoding: 'utf8' });
    
    // In a real app we might revalidate, but here our data source is static JSON
    // so revalidation won't update the UI with the new data until dbt runs.
    // However, we return success so the Client Component can show a toast.
    
    return { message: 'Payment registered successfully', success: true };
  } catch (error) {
    console.error('Failed to write payment:', error);
    return { message: 'Failed to record payment', success: false };
  }
}
