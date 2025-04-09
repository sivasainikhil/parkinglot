import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { CreditCard, Calendar, Lock } from 'lucide-react';

interface CheckoutProps {
  ticketId: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function Checkout({ ticketId, amount, onSuccess, onCancel }: CheckoutProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Update ticket status to processing
      const { error: updateError } = await supabase
        .from('parking_tickets')
        .update({
          payment_status: 'processing',
          payment_date: new Date().toISOString(),
          payment_method: 'credit_card',
        })
        .eq('id', ticketId);

      if (updateError) throw updateError;

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update ticket status to paid
      const { error: finalError } = await supabase
        .from('parking_tickets')
        .update({
          payment_status: 'paid',
          paid: true,
        })
        .eq('id', ticketId);

      if (finalError) throw finalError;

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment processing failed');
      
      // Revert to pending status on error
      await supabase
        .from('parking_tickets')
        .update({
          payment_status: 'pending',
          payment_date: null,
          payment_method: null,
        })
        .eq('id', ticketId);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Checkout</h2>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount to Pay
            </label>
            <div className="text-2xl font-bold text-gray-900">${amount.toFixed(2)}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Number
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="1234 5678 9012 3456"
                required
                pattern="\d{16}"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="MM/YY"
                  required
                  pattern="\d{4}"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVC
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="123"
                  required
                  pattern="\d{3}"
                />
              </div>
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}