import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import { FiSearch, FiUser, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Customer {
  id: string;
  name: string;
  phone: string;
  province: string;
  total_orders: number;
  total_spent: number;
  orders?: any[];
}

const CustomersList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const res = await api.getCustomers();
      setCustomers(res.customers || res || []);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const viewCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setLoadingDetail(true);
    try {
      const res = await api.getCustomer(customer.id);
      const data = res.customer || res;
      setCustomerOrders(data.orders || []);
    } catch {
      setCustomerOrders([]);
    } finally {
      setLoadingDetail(false);
    }
  };

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#FE8B7C' }} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Customers</h1>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="p-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Customers table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Province</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total Orders</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No customers found
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{customer.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.province}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.total_orders}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {formatPrice(customer.total_spent)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => viewCustomer(customer)}
                        className="text-sm font-medium hover:underline"
                        style={{ color: '#FE8B7C' }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer detail modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-xl">
              <h3 className="text-lg font-semibold text-gray-800">Customer Details</h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FE8B7C20' }}>
                  <FiUser size={20} style={{ color: '#FE8B7C' }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{selectedCustomer.name}</p>
                  <p className="text-sm text-gray-500">{selectedCustomer.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Province</p>
                  <p className="text-sm font-medium text-gray-800">{selectedCustomer.province}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Total Spent</p>
                  <p className="text-sm font-medium text-gray-800">{formatPrice(selectedCustomer.total_spent)}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2">
                  Orders ({selectedCustomer.total_orders})
                </h4>
                {loadingDetail ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: '#FE8B7C' }} />
                  </div>
                ) : customerOrders.length === 0 ? (
                  <p className="text-sm text-gray-500 py-2">No order history available</p>
                ) : (
                  <div className="space-y-2">
                    {customerOrders.map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{order.order_number}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-800">{formatPrice(order.total)}</p>
                          <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersList;
