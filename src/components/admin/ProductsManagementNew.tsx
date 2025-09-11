import { useState } from 'react';
import { Edit, Trash2, Plus, Minus, ShoppingBag, Package2, Eye, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { TProduct } from '@/models/productModel';

// Create a serialized version for client components
interface Product extends Omit<TProduct, '_id'> {
  _id: string;
}

interface ProductsManagementProps {
  products: Product[];
  onRefresh: () => void;
}

const taxOptions = [
  { value: 0, label: "No Tax (0%)" },
  { value: 5, label: "Basic Tax (5%)" },
  { value: 12, label: "Standard Tax (12%)" },
  { value: 18, label: "GST (18%)" },
  { value: 28, label: "Luxury Tax (28%)" },
];

export default function ProductsManagement({ products, onRefresh }: ProductsManagementProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [qtyInputs, setQtyInputs] = useState<{ [key: string]: string }>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, '_id'>>({
    name: '',
    image: '',
    description: '',
    type: 'basic',
    price: 0,
    details: [],
    category: 'Electronics',
    stock: 0,
    status: 'active',
    tax: { type: 'percentage', value: 18, label: 'GST (18%)' },
    createdAt: new Date(),
    updatedAt: new Date()
  });

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

  const addQuantity = async (productId: string, currentStock: number) => {
    const qtyToAdd = qtyInputs[productId];
    if (!qtyToAdd || isNaN(Number(qtyToAdd)) || Number(qtyToAdd) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    const newStock = currentStock + Number(qtyToAdd);
    await updateStock(productId, newStock);
    
    // Clear the input after successful update
    setQtyInputs(prev => ({ ...prev, [productId]: '' }));
  };

  const handleImageUpload = (file: File) => {
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    setUploadingImage(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (editingProduct) {
        setEditingProduct({...editingProduct, image: result});
      }
      setUploadingImage(false);
      toast.success('Image uploaded successfully');
    };
    
    reader.onerror = () => {
      setUploadingImage(false);
      toast.error('Failed to upload image');
    };
    
    reader.readAsDataURL(file);
  };

  const handleNewProductImageUpload = (file: File) => {
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    setUploadingImage(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setNewProduct({...newProduct, image: result});
      setUploadingImage(false);
      toast.success('Image uploaded successfully');
    };
    
    reader.onerror = () => {
      setUploadingImage(false);
      toast.error('Failed to upload image');
    };
    
    reader.readAsDataURL(file);
  };

  // Single-click disable product
  const disableProduct = async (productId: string) => {
    setUpdating(productId);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'inactive' }),
      });
      if (!response.ok) throw new Error('Failed to disable product');
      toast.success('Product disabled');
      onRefresh();
    } catch (error) {
      toast.error('Failed to disable product');
    } finally {
      setUpdating(null);
    }
  };

  // Single-click update product
  const singleClickUpdateProduct = async (product: Product) => {
    setUpdating(product._id);
    try {
      const response = await fetch(`/api/admin/products/${product._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (!response.ok) throw new Error('Failed to update product');
      toast.success('Product updated');
      onRefresh();
    } catch (error) {
      toast.error('Failed to update product');
    } finally {
      setUpdating(null);
    }
  };

  // Single-click delete product
  const singleClickDeleteProduct = async (productId: string) => {
    setUpdating(productId);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete product');
      toast.success('Product deleted');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete product');
    } finally {
      setUpdating(null);
    }
  };

  const createProduct = async (productData: Omit<Product, '_id'>) => {
    try {
      const createData = {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        image: productData.image,
        type: productData.type,
        stock: productData.stock,
        status: productData.status,
        details: productData.details
      };
      
      console.log('Creating product:', createData);
      
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createData),
      });

      if (response.ok) {
        toast.success('Product created successfully');
        setShowAddForm(false);
        // Reset form
        setNewProduct({
          name: '',
          image: '',
          description: '',
          type: 'basic',
          price: 0,
          details: [],
          category: 'Electronics',
          stock: 0,
          status: 'active',
          tax: { type: 'percentage', value: 18, label: 'GST (18%)' },
          createdAt: new Date(),
          updatedAt: new Date()
        });
        onRefresh();
      } else {
        const error = await response.json();
        console.error('Create error response:', error);
        toast.error(error.error || 'Failed to create product');
      }
    } catch (error) {
      toast.error('Failed to create product');
      console.error('Create error:', error);
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

  const updateProduct = async (updatedProduct: Product) => {
    try {
      // Only send the fields that should be updated
      const updateData = {
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: updatedProduct.price,
        category: updatedProduct.category || 'Electronics', // Add fallback
        image: updatedProduct.image,
        type: updatedProduct.type,
        stock: updatedProduct.stock,
        status: updatedProduct.status,
        details: updatedProduct.details
      };
      
      console.log('Sending product update:', updateData); // Debug log
      console.log('Original product:', updatedProduct); // Debug log
      
      const response = await fetch(`/api/admin/products/${updatedProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        toast.success('Product updated successfully');
        setEditingProduct(null);
        onRefresh();
      } else {
        const error = await response.json();
        console.error('Update error response:', error); // Debug log
        toast.error(error.error || 'Failed to update product');
      }
    } catch (error) {
      toast.error('Failed to update product');
      console.error('Update error:', error);
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
                className="w-full h-full object-contain"
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
              <div className="space-y-2">
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
                
                {/* Add Quantity Section */}
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={qtyInputs[product._id] || ''}
                    onChange={(e) => setQtyInputs(prev => ({ ...prev, [product._id]: e.target.value }))}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={updating === product._id}
                  />
                  <button
                    onClick={() => addQuantity(product._id, product.stock)}
                    disabled={updating === product._id || !qtyInputs[product._id]}
                    className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
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
                    onClick={() => {
                      console.log('Setting editing product:', product); // Debug log
                      // Ensure category exists
                      const productWithCategory = {
                        ...product,
                        category: product.category || 'Electronics'
                      };
                      setEditingProduct(productWithCategory);
                    }}
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

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Edit Product</h2>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              
              // Client-side validation (details are now optional)
              if (editingProduct.details.length > 8) {
                toast.error('Product details must have maximum 8 points');
                return;
              }
              
              if (!editingProduct.image) {
                toast.error('Please provide a product image (URL or upload)');
                return;
              }
              
              updateProduct(editingProduct);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({...editingProduct, stock: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={editingProduct.type}
                    onChange={(e) => setEditingProduct({...editingProduct, type: e.target.value as "basic" | "pro" | "max"})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                    <option value="max">Max</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editingProduct.status}
                    onChange={(e) => setEditingProduct({...editingProduct, status: e.target.value as "active" | "inactive" | "out_of_stock"})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Optional: Enter product description"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                <div className="space-y-3">
                  {/* Current Image Preview */}
                  {editingProduct.image && (
                    <div className="flex items-center space-x-3">
                      <img 
                        src={editingProduct.image} 
                        alt="Product preview" 
                        className="w-16 h-16 object-cover rounded-md border"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMSAyM0MxOS44OTU0IDIzIDE5IDIzLjg5NTQgMTkgMjVWMzlDMTkgNDAuMTA0NiAxOS44OTU0IDQxIDIxIDQxSDQzQzQ0LjEwNDYgNDEgNDUgNDAuMTA0NiA0NSAzOVYyNUM0NSAyMy44OTU0IDQ0LjEwNDYgMjMgNDMgMjNIMjFaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8Y2lyY2xlIGN4PSIyOSIgY3k9IjI5IiByPSIzIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJtMzUgMzUgNSA1IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setEditingProduct({...editingProduct, image: ''})}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                  
                  {/* Image URL Input */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Option 1: Image URL</label>
                    <input
                      type="url"
                      value={editingProduct.image.startsWith('data:') ? '' : editingProduct.image}
                      onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* File Upload */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Option 2: Upload Image File</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file);
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={uploadingImage}
                      />
                      {uploadingImage && (
                        <div className="text-sm text-blue-600">Uploading...</div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Max file size: 5MB. Supported formats: JPG, PNG, GIF, WebP</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Details (Optional - Max 8 points, one per line)
                </label>
                <textarea
                  value={editingProduct.details.join('\n')}
                  onChange={(e) => {
                    const details = e.target.value.split('\n').filter(detail => detail.trim());
                    setEditingProduct({...editingProduct, details});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={6}
                  placeholder="Optional: Enter product details, one per line&#10;Maximum 8 points allowed"
                />
                <div className="text-sm text-gray-500 mt-1">
                  Current: {editingProduct.details.length} points 
                  {editingProduct.details.length > 8 && (
                    <span className="text-red-500 ml-2">Maximum 8 points allowed</span>
                  )}
                  {editingProduct.details.length === 0 && (
                    <span className="text-gray-500 ml-2">Optional field</span>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    editingProduct.details.length > 8 || 
                    !editingProduct.image ||
                    uploadingImage
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {uploadingImage ? 'Processing...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Add New Product</h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewProduct({
                    name: '',
                    image: '',
                    description: '',
                    type: 'basic',
                    price: 0,
                    details: [],
                    category: 'Electronics',
                    stock: 0,
                    status: 'active',
                    tax: { type: 'percentage', value: 18, label: 'GST (18%)' },
                    createdAt: new Date(),
                    updatedAt: new Date()
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              
              // Client-side validation (details are now optional)
              if (newProduct.details.length > 8) {
                toast.error('Product details must have maximum 8 points');
                return;
              }
              
              if (!newProduct.image) {
                toast.error('Please provide a product image (URL or upload)');
                return;
              }
              
              if (!newProduct.name || !newProduct.category) {
                toast.error('Please fill all required fields (name and category)');
                return;
              }
              
              createProduct(newProduct);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={newProduct.type}
                    onChange={(e) => setNewProduct({...newProduct, type: e.target.value as "basic" | "pro" | "max"})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                    <option value="max">Max</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={newProduct.status}
                    onChange={(e) => setNewProduct({...newProduct, status: e.target.value as "active" | "inactive" | "out_of_stock"})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Optional: Enter product description"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image *</label>
                <div className="space-y-3">
                  {/* Current Image Preview */}
                  {newProduct.image && (
                    <div className="flex items-center space-x-3">
                      <img 
                        src={newProduct.image} 
                        alt="Product preview" 
                        className="w-16 h-16 object-cover rounded-md border"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMSAyM0MxOS44OTU0IDIzIDE5IDIzLjg5NTQgMTkgMjVWMzlDMTkgNDAuMTA0NiAxOS44OTU0IDQxIDIxIDQxSDQzQzQ0LjEwNDYgNDEgNDUgNDAuMTA0NiA0NSAzOVYyNUM0NSAyMy44OTU0IDQ0LjEwNDYgMjMgNDMgMjNIMjFaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8Y2lyY2xlIGN4PSIyOSIgY3k9IjI5IiByPSIzIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJtMzUgMzUgNSA1IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setNewProduct({...newProduct, image: ''})}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                  
                  {/* Image URL Input */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Option 1: Image URL</label>
                    <input
                      type="url"
                      value={newProduct.image.startsWith('data:') ? '' : newProduct.image}
                      onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* File Upload */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Option 2: Upload Image File</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleNewProductImageUpload(file);
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={uploadingImage}
                      />
                      {uploadingImage && (
                        <div className="text-sm text-blue-600">Uploading...</div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Max file size: 5MB. Supported formats: JPG, PNG, GIF, WebP</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Details (Optional - Max 8 points, one per line)
                </label>
                <textarea
                  value={newProduct.details.join('\n')}
                  onChange={(e) => {
                    const details = e.target.value.split('\n').filter(detail => detail.trim());
                    setNewProduct({...newProduct, details});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={6}
                  placeholder="Optional: Enter product details, one per line&#10;Maximum 8 points allowed"
                />
                <div className="text-sm text-gray-500 mt-1">
                  Current: {newProduct.details.length} points 
                  {newProduct.details.length > 8 && (
                    <span className="text-red-500 ml-2">Maximum 8 points allowed</span>
                  )}
                  {newProduct.details.length === 0 && (
                    <span className="text-gray-500 ml-2">Optional field</span>
                  )}
                </div>
              </div>
              
              {/* Debug Info for Add Product Form */}
              <div className="mb-4 p-3 bg-gray-50 rounded-md text-sm">
                <div className="font-medium text-gray-700 mb-2">Form Validation Status:</div>
                <div className="space-y-1">
                  <div className={`${newProduct.name ? 'text-green-600' : 'text-red-600'}`}>
                    Name: {newProduct.name ? '✓' : '✗'} {newProduct.name || 'Required'}
                  </div>
                  <div className={`${newProduct.description ? 'text-green-600' : 'text-yellow-600'}`}>
                    Description: {newProduct.description ? '✓' : '○'} {newProduct.description ? 'Provided' : 'Optional'}
                  </div>
                  <div className={`${newProduct.image ? 'text-green-600' : 'text-red-600'}`}>
                    Image: {newProduct.image ? '✓' : '✗'} {newProduct.image ? 'Provided' : 'Required'}
                  </div>
                  <div className={`${newProduct.details.length <= 8 ? 'text-green-600' : 'text-red-600'}`}>
                    Details: {newProduct.details.length <= 8 ? '✓' : '✗'} {newProduct.details.length} points (optional, max 8)
                  </div>
                  <div className={`${!uploadingImage ? 'text-green-600' : 'text-yellow-600'}`}>
                    Upload Status: {!uploadingImage ? '✓ Ready' : '⏳ Uploading...'}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewProduct({
                      name: '',
                      image: '',
                      description: '',
                      type: 'basic',
                      price: 0,
                      details: [],
                      category: 'Electronics',
                      stock: 0,
                      status: 'active',
                      tax: { type: 'percentage', value: 18, label: 'GST (18%)' },
                      createdAt: new Date(),
                      updatedAt: new Date()
                    });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    newProduct.details.length > 8 || 
                    !newProduct.image ||
                    !newProduct.name ||
                    uploadingImage
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {uploadingImage ? 'Processing...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
