'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import DashboardOverview from '@/components/admin/DashboardOverview';
import UsersManagement from '@/components/admin/UsersManagement';
import ProductsManagement from '@/components/admin/ProductsManagementNew';
import OrdersManagement from '@/components/admin/OrdersManagement';
import DeliveryAreasManagement from '@/components/admin/DeliveryAreasManagement';
import { TProduct } from '@/models/productModel';

// Serialized version for client components
interface Product extends Omit<TProduct, '_id'> {
  _id: string;
}

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

// Skeleton loader component
function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="animate-pulse">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {[...Array(cols)].map((_, i) => (
              <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-300 bg-gray-100">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {[...Array(rows)].map((_, i) => (
            <tr key={i}>
              {[...Array(cols)].map((_, j) => (
                <td key={j} className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  // Separate loading states and data for each tab
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'products' | 'orders' | 'delivery-areas'>('overview');
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
    } catch (err) {
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
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  // Tab-specific data fetchers
  const loadUsers = async () => {
    setUsersLoading(true);
    const usersRes = await fetch('/api/admin/users');
    if (usersRes.ok) {
      const usersData = await usersRes.json();
      setUsers(usersData.users || []);
    }
    setUsersLoading(false);
  };
  const loadOrders = async () => {
    setOrdersLoading(true);
    const ordersRes = await fetch('/api/admin/orders');
    if (ordersRes.ok) {
      const ordersData = await ordersRes.json();
      setOrders(ordersData.orders || []);
    }
    setOrdersLoading(false);
  };
  const loadProducts = async () => {
    setProductsLoading(true);
    const productsRes = await fetch('/api/admin/products');
    if (productsRes.ok) {
      const productsData = await productsRes.json();
      setProducts(productsData.products || []);
    }
    setProductsLoading(false);
  };
  const loadDeliveryAreas = async () => {
    setDeliveryLoading(true);
    setTimeout(() => setDeliveryLoading(false), 1000);
  };

  useEffect(() => {
    if (activeTab === 'users' && users.length === 0 && !usersLoading) {
      loadUsers();
    }
    if (activeTab === 'orders' && orders.length === 0 && !ordersLoading) {
      loadOrders();
    }
    if (activeTab === 'products' && products.length === 0 && !productsLoading) {
      loadProducts();
    }
    if (activeTab === 'delivery-areas' && !deliveryLoading) {
      loadDeliveryAreas();
    }
  }, [activeTab]);

  const handleLogout = async () => {
    try {
      await fetch('/api/users/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {}
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8">
        <SkeletonTable rows={5} cols={4} /> {/* Users */}
        <SkeletonTable rows={5} cols={6} /> {/* Orders */}
        <SkeletonTable rows={5} cols={5} /> {/* Delivery Areas */}
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
                { key: 'delivery-areas', label: 'Delivery Areas' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as 'overview' | 'users' | 'products' | 'orders' | 'delivery-areas')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </button>
            </div>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <DashboardOverview stats={stats} />
            )}
            {activeTab === 'users' && (
              usersLoading ? <SkeletonTable rows={5} cols={4} /> : <UsersManagement users={users} />
            )}
            {activeTab === 'products' && (
              productsLoading ? <SkeletonTable rows={5} cols={4} /> : <ProductsManagement products={products} onRefresh={loadProducts} />
            )}
            {activeTab === 'orders' && (
              ordersLoading ? <SkeletonTable rows={5} cols={6} /> : <OrdersManagement orders={orders} onRefresh={loadOrders} />
            )}
            {activeTab === 'delivery-areas' && (
              deliveryLoading ? <SkeletonTable rows={5} cols={5} /> : <DeliveryAreasManagement onRefresh={loadDeliveryAreas} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

