import React, { useState, useEffect } from 'react';
import { Ticket, TicketPlus, Search, LogOut } from 'lucide-react';
import { Scene3D } from './components/Scene3D';
import { Dashboard } from './components/Dashboard';
import { SearchBar } from './components/SearchBar';
import { AuthForm } from './components/AuthForm';
import { Checkout } from './components/Checkout';
import { supabase } from './lib/supabase';
import type { Database } from './lib/database.types';

type ParkingTicket = Database['public']['Tables']['parking_tickets']['Row'];

function App() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'view' | 'create'>('view');
  const [tickets, setTickets] = useState<ParkingTicket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [checkoutTicket, setCheckoutTicket] = useState<ParkingTicket | null>(null);
  const [authType, setAuthType] = useState<'signin' | 'signup'>('signin');
  const [formData, setFormData] = useState({
    license_plate: '',
    violation_type: 'Expired Meter',
    location: '',
    amount: 50,
    notes: '',
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkAdminStatus(session?.user?.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkAdminStatus(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkAdminStatus(userId: string | undefined) {
    if (!userId) {
      setIsAdmin(false);
      return;
    }

    const { data, error } = await supabase
      .from('auth.users')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking admin status:', error);
      return;
    }

    setIsAdmin(data?.is_admin || false);
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
  }

  useEffect(() => {
    if (session) fetchTickets();
  }, [session]);

  async function fetchTickets() {
    let query = supabase
      .from('parking_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (!isAdmin) {
      query = query.eq('user_id', session?.user?.id);
    }

    if (searchTerm) {
      query = query.textSearch('search_vector', searchTerm);
    }

    if (filter !== 'all') {
      query = query.eq('payment_status', filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching tickets:', error);
      return;
    }

    setTickets(data || []);
  }

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    
    if (!session?.user) {
      alert('Please sign in to create tickets');
      return;
    }

    const { error } = await supabase
      .from('parking_tickets')
      .insert([
        {
          ...formData,
          user_id: session.user.id,
          payment_status: 'pending',
        }
      ]);

    if (error) {
      console.error('Error creating ticket:', error);
      return;
    }

    setFormData({
      license_plate: '',
      violation_type: 'Expired Meter',
      location: '',
      amount: 50,
      notes: '',
    });
    
    fetchTickets();
    setActiveTab('view');
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md mx-auto pt-8">
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={() => setAuthType('signin')}
              className={`px-4 py-2 rounded-lg ${
                authType === 'signin'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthType('signup')}
              className={`px-4 py-2 rounded-lg ${
                authType === 'signup'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>
          <AuthForm type={authType} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Ticket className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  3D Parking Tickets {isAdmin && '(Admin)'}
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-gray-600">{session.user.email}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('view')}
              className={`flex items-center px-4 py-2 rounded-lg ${
                activeTab === 'view'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Ticket className="h-5 w-5 mr-2" />
              View Tickets
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`flex items-center px-4 py-2 rounded-lg ${
                activeTab === 'create'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TicketPlus className="h-5 w-5 mr-2" />
              Create Ticket
            </button>
          </div>

          {activeTab === 'view' && (
            <>
              <Dashboard tickets={tickets} />
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={(term) => {
                  setSearchTerm(term);
                  fetchTickets();
                }}
                onFilterChange={(value) => {
                  setFilter(value);
                  fetchTickets();
                }}
              />
            </>
          )}

          <Scene3D />

          <div className="mt-6">
            {activeTab === 'create' ? (
              <form onSubmit={handleCreateTicket} className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">License Plate</label>
                  <input
                    type="text"
                    value={formData.license_plate}
                    onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter license plate number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Violation Type</label>
                  <select
                    value={formData.violation_type}
                    onChange={(e) => setFormData({ ...formData, violation_type: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  >
                    <option>Expired Meter</option>
                    <option>No Parking Zone</option>
                    <option>Handicap Violation</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter location"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount ($)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Generate Ticket
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                {tickets.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-500 text-center">No tickets to display</p>
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold">{ticket.license_plate}</h3>
                          <p className="text-gray-600">{ticket.violation_type}</p>
                          <p className="text-sm text-gray-500">{ticket.location}</p>
                          {ticket.notes && (
                            <p className="text-sm text-gray-500 mt-2">{ticket.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">${ticket.amount}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(ticket.issued_at).toLocaleDateString()}
                          </p>
                          <div className="mt-2">
                            <span
                              className={`inline-block px-2 py-1 rounded text-sm ${
                                ticket.payment_status === 'paid'
                                  ? 'bg-green-100 text-green-800'
                                  : ticket.payment_status === 'processing'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : ticket.payment_status === 'failed'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {ticket.payment_status.charAt(0).toUpperCase() + ticket.payment_status.slice(1)}
                            </span>
                          </div>
                          {ticket.payment_status === 'pending' && (
                            <button
                              onClick={() => setCheckoutTicket(ticket)}
                              className="mt-2 bg-indigo-600 text-white px-4 py-1 rounded text-sm hover:bg-indigo-700"
                            >
                              Pay Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {checkoutTicket && (
        <Checkout
          ticketId={checkoutTicket.id}
          amount={checkoutTicket.amount}
          onSuccess={() => {
            setCheckoutTicket(null);
            fetchTickets();
          }}
          onCancel={() => setCheckoutTicket(null)}
        />
      )}
    </div>
  );
}

export default App;