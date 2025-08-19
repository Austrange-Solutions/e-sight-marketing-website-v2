'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import DashboardOverview from '@/components/admin/DashboardOverview';
import UsersManagement from '@/components/admin/UsersManagement';
import ProductsManagement from '@/components/admin/ProductsManagementNew';
import OrdersManagement from '@/components/admin/OrdersManagement';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

interface User {
  _id: string;
  username: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  type: string;
  image: string;
  description: string;
  details: string[];
  category: string;
  stock: number;
  status: "active" | "inactive" | "out_of_stock";
  tax: {
    type: "percentage" | "fixed";
    value: number;
    label: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  customer: {
    userId: string;
    username: string;
    email: string;
    phone: string;
    isAdmin: boolean;
  };
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    subtotal: number;
  }>;
  shippingAddress: {
    name: string;
    phone: string;
    email: string;
    address: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    addressType: string;
  };
  paymentInfo: {
    method: string;
    status: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    paidAt?: string;
  };
  orderSummary: {
    subtotal: number;
    gst: number;
    transactionFee: number;
    deliveryCharges: number;
    total: number;
  };
  cancellation?: {
    isCancelled: boolean;
    cancelledAt?: string;
    cancelReason?: string;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'products' | 'orders'>('overview');
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();

  useEffect(() => {
    checkAdminAuth();
    fetchDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAdminAuth = async () => {
    try {
      const res = await fetch('/api/admin/verify');
      if (!res.ok) {
        router.push('/admin/login');
      }
    } catch {
      router.push('/admin/login');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsRes = await fetch('/api/admin/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch users
      const usersRes = await fetch('/api/admin/users');
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }

      // Fetch products
      const productsRes = await fetch('/api/products');
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData || []);
      }

      // Fetch orders
      const ordersRes = await fetch('/api/admin/orders');
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/users/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'users', label: 'Users' },
                { key: 'products', label: 'Products' },
                { key: 'orders', label: 'Orders' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as 'overview' | 'users' | 'products' | 'orders')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <DashboardOverview stats={stats} />
            )}

            {activeTab === 'users' && (
              <UsersManagement users={users} onRefresh={fetchDashboardData} />
            )}

            {activeTab === 'products' && (
              <ProductsManagement 
                products={products} 
                setProducts={setProducts}
                onRefresh={fetchDashboardData} 
              />
            )}

            {activeTab === 'orders' && (
              <OrdersManagement orders={orders} onRefresh={fetchDashboardData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}