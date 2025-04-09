import React from 'react';
import { BarChart3, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import type { Database } from '../lib/database.types';

type ParkingTicket = Database['public']['Tables']['parking_tickets']['Row'];

interface DashboardProps {
  tickets: ParkingTicket[];
}

export function Dashboard({ tickets }: DashboardProps) {
  const totalAmount = tickets.reduce((sum, ticket) => sum + Number(ticket.amount), 0);
  const paidAmount = tickets
    .filter(ticket => ticket.payment_status === 'paid')
    .reduce((sum, ticket) => sum + Number(ticket.amount), 0);
  const pendingTickets = tickets.filter(ticket => ticket.payment_status === 'pending').length;
  const recentTickets = tickets.slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Collected: ${paidAmount.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Pending Tickets</p>
            <p className="text-2xl font-bold text-gray-900">{pendingTickets}</p>
          </div>
          <div className="bg-yellow-100 p-3 rounded-full">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Requires attention
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Violation Types</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Set(tickets.map(t => t.violation_type)).size}
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <AlertTriangle className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Different categories
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Analytics</p>
            <p className="text-2xl font-bold text-gray-900">
              {tickets.length}
            </p>
          </div>
          <div className="bg-purple-100 p-3 rounded-full">
            <BarChart3 className="h-6 w-6 text-purple-600" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Total tickets issued
          </p>
        </div>
      </div>
    </div>
  );
}