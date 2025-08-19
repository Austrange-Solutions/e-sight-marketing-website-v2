import { Users, Package, ShoppingCart, DollarSign } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

interface DashboardOverviewProps {
  stats: DashboardStats;
}

export default function DashboardOverview({ stats }: DashboardOverviewProps) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-6">Dashboard Overview</h3>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-50 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">₹{stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-2">Welcome to Admin Dashboard</h4>
        <p className="text-gray-600">
          Use the tabs above to manage users, products, and orders. Monitor your platform's 
          performance through the comprehensive statistics and management tools available.
        </p>
      </div>
    </div>
  );
}