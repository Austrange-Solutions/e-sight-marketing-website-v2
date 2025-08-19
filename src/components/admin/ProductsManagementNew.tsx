import { useState } from 'react';
import { Edit, Trash2, Plus, Minus, ShoppingBag, Tag, Package2, Eye, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  image: string;
  description: string;
  type: "basic" | "pro" | "max";
  price: number;
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

interface ProductsManagementProps {
  products: Product[];
  setProducts: (products: Product[]) => void;
  onRefresh: () => void;
}

const taxOptions = [
  { value: 0, label: "No Tax (0%)" },
  { value: 5, label: "Basic Tax (5%)" },
  { value: 12, label: "Standard Tax (12%)" },
  { value: 18, label: "GST (18%)" },
  { value: 28, label: "Luxury Tax (28%)" },
];

export default function ProductsManagement({ products, setProducts, onRefresh }: ProductsManagementProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const categories = ["Electronics", "Accessories", "Home", "Sports", "Health", "Other"];

  const updateStock = async (productId: string, newStock: number) => {
    if (newStock < 0) return;
    
    setUpdating(productId);
    try {
      const response = await fetch('/api/admin/products/stock', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          stock: newStock,
        }),
      });

      if (response.ok) {
        toast.success('Stock updated successfully');
        onRefresh();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update stock');
      }
    } catch (error) {
      toast.error('Failed to update stock');
      console.error('Stock update error:', error);
    } finally {
      setUpdating(null);
    }
  };

  const updateTax = async (productId: string, taxValue: number) => {
    setUpdating(productId);
    try {
      const response = await fetch('/api/admin/products/tax', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          tax: {
            type: "percentage",
            value: taxValue,
            label: taxOptions.find(t => t.value === taxValue)?.label || "Custom Tax",
          },
        }),
      });

      if (response.ok) {
        toast.success('Tax updated successfully');
        onRefresh();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update tax');
      }
    } catch (error) {
      toast.error('Failed to update tax');
      console.error('Tax update error:', error);
    } finally {
      setUpdating(null);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Product deleted successfully');
        onRefresh();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete product');
      }
    } catch (error) {
      toast.error('Failed to delete product');
      console.error('Delete error:', error);
    }
  };

  const getStatusColor = (status: string, stock: number) => {
    if (stock === 0 || status === 'out_of_stock') return 'bg-red-100 text-red-800';
    if (status === 'active') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string, stock: number) => {
    if (stock === 0) return 'Out of Stock';
    if (status === 'active') return 'In Stock';
    if (status === 'inactive') return 'Inactive';
    return status;
  };

  const filteredProducts = products.filter(product => {
    const categoryMatch = filterCategory === 'all' || product.category === filterCategory;
    const statusMatch = filterStatus === 'all' || 
      (filterStatus === 'in_stock' && product.stock > 0 && product.status === 'active') ||
      (filterStatus === 'out_of_stock' && (product.stock === 0 || product.status === 'out_of_stock')) ||
      (filterStatus === 'inactive' && product.status === 'inactive');
    
    return categoryMatch && statusMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Product Management</h3>
          <p className="text-sm text-gray-500">Manage your product catalog</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
        >
          <Plus size={16} className="mr-2" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Category:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1"
          >
            <option value="all">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            {/* Product Image */}
            <div className="relative h-48 bg-gray-100">
              <img
                src={product.image || '/assets/images/e-sight-logo.png'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/assets/images/e-sight-logo.png';
                }}
              />
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status, product.stock)}`}>
                  {getStatusText(product.status, product.stock)}
                </span>
              </div>
              <div className="absolute top-2 left-2">
                <span className="bg-indigo-100 text-indigo-800 px-2 py-1 text-xs font-medium rounded-full">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4 space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-900">₹{product.price.toLocaleString()}</span>
                <span className="text-gray-500 capitalize">{product.type}</span>
              </div>

              {/* Stock Management */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package2 size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => updateStock(product._id, product.stock - 1)}
                    disabled={product.stock <= 0 || updating === product._id}
                    className="p-1 rounded text-gray-400 hover:text-red-600 disabled:opacity-50"
                  >
                    <Minus size={16} />
                  </button>
                  <button
                    onClick={() => updateStock(product._id, product.stock + 1)}
                    disabled={updating === product._id}
                    className="p-1 rounded text-gray-400 hover:text-green-600 disabled:opacity-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Tax Management */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">Tax: {product.tax?.value || 18}%</span>
                </div>
                <select
                  value={product.tax?.value || 18}
                  onChange={(e) => updateTax(product._id, Number(e.target.value))}
                  disabled={updating === product._id}
                  className="text-xs border border-gray-300 rounded px-2 py-1"
                >
                  {taxOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  <Eye size={14} />
                  <span>View</span>
                </button>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <Edit size={14} />
                    <span>Edit</span>
                  </button>
                  
                  <button
                    onClick={() => deleteProduct(product._id)}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No products found matching your filters.</p>
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-3xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Product Details</h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img
                  src={selectedProduct.image || '/assets/images/e-sight-logo.png'}
                  alt={selectedProduct.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedProduct.name}</h4>
                  <p className="text-gray-600">{selectedProduct.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Price:</span>
                    <span className="ml-2">₹{selectedProduct.price.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="font-medium">Type:</span>
                    <span className="ml-2 capitalize">{selectedProduct.type}</span>
                  </div>
                  <div>
                    <span className="font-medium">Category:</span>
                    <span className="ml-2">{selectedProduct.category}</span>
                  </div>
                  <div>
                    <span className="font-medium">Stock:</span>
                    <span className="ml-2">{selectedProduct.stock}</span>
                  </div>
                  <div>
                    <span className="font-medium">Tax:</span>
                    <span className="ml-2">{selectedProduct.tax?.value || 18}% ({selectedProduct.tax?.label || 'GST'})</span>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedProduct.status, selectedProduct.stock)}`}>
                      {getStatusText(selectedProduct.status, selectedProduct.stock)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <span className="font-medium block mb-2">Product Details:</span>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {selectedProduct.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
