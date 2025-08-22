import { useState } from 'react';
import { Plus, Eye, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  price: number;
  type: string;
  image: string;
  description: string;
  details: string[];
  createdAt: string;
}

interface ProductsManagementProps {
  products: Product[];
  setProducts: (products: Product[]) => void;
  onRefresh: () => void;
}

export default function ProductsManagement({ products, setProducts, onRefresh }: ProductsManagementProps) {
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    image: '',
    description: '',
    type: 'basic' as 'basic' | 'pro' | 'max',
    price: 0,
    details: ['', '', '', '']
  });
  const [editProduct, setEditProduct] = useState({
    name: '',
    image: '',
    description: '',
    type: 'basic' as 'basic' | 'pro' | 'max',
    price: 0,
    details: ['', '', '', '']
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation (description is now optional)
    if (!newProduct.name || !newProduct.image || newProduct.price <= 0) {
      toast.error('Please fill in name, image, and price (description is optional)');
      return;
    }

    // Filter out empty details and validate count (details are now optional)
    const filteredDetails = newProduct.details.filter(detail => detail.trim() !== '');
    if (filteredDetails.length > 8) {
      toast.error('Please provide maximum 8 product details');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newProduct,
          details: filteredDetails
        }),
      });

      if (response.ok) {
        const addedProduct = await response.json();
        setProducts([...products, addedProduct]);
        setShowAddProductModal(false);
        setNewProduct({
          name: '',
          image: '',
          description: '',
          type: 'basic',
          price: 0,
          details: ['', '', '', '']
        });
        toast.success('Product added successfully!');
        onRefresh();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditProduct({
      name: product.name,
      image: product.image,
      description: product.description,
      type: product.type as 'basic' | 'pro' | 'max',
      price: product.price,
      details: [...product.details]
    });
    setShowEditProductModal(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) return;

    // Validation (description is now optional)
    if (!editProduct.name || !editProduct.image || editProduct.price <= 0) {
      toast.error('Please fill in name, image, and price (description is optional)');
      return;
    }

    // Filter out empty details and validate count (details are now optional)
    const filteredDetails = editProduct.details.filter(detail => detail.trim() !== '');
    if (filteredDetails.length > 8) {
      toast.error('Please provide maximum 8 product details');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Use the existing PUT endpoint with _id in the body
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: selectedProduct._id,
          ...editProduct,
          details: filteredDetails
        }),
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        const updatedProducts = products.map(p => 
          p._id === selectedProduct._id ? updatedProduct : p
        );
        setProducts(updatedProducts);
        setShowEditProductModal(false);
        setSelectedProduct(null);
        setEditProduct({
          name: '',
          image: '',
          description: '',
          type: 'basic',
          price: 0,
          details: ['', '', '', '']
        });
        toast.success('Product updated successfully!');
        onRefresh();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      setIsSubmitting(true);
      
      // Use the existing DELETE endpoint with _id in the body
      const response = await fetch('/api/products', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: selectedProduct._id
        }),
      });

      if (response.ok) {
        const updatedProducts = products.filter(p => p._id !== selectedProduct._id);
        setProducts(updatedProducts);
        setShowDeleteConfirm(false);
        setSelectedProduct(null);
        toast.success('Product deleted successfully!');
        onRefresh();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ...rest of your helper functions (addDetailField, removeDetailField, updateDetail) remain the same...

  const addDetailField = (isEdit = false) => {
    const currentDetails = isEdit ? editProduct.details : newProduct.details;
    if (currentDetails.length < 8) {
      if (isEdit) {
        setEditProduct({
          ...editProduct,
          details: [...currentDetails, '']
        });
      } else {
        setNewProduct({
          ...newProduct,
          details: [...currentDetails, '']
        });
      }
    }
  };

  const removeDetailField = (index: number, isEdit = false) => {
    const currentDetails = isEdit ? editProduct.details : newProduct.details;
    if (currentDetails.length > 4) {
      const updatedDetails = currentDetails.filter((_, i) => i !== index);
      if (isEdit) {
        setEditProduct({
          ...editProduct,
          details: updatedDetails
        });
      } else {
        setNewProduct({
          ...newProduct,
          details: updatedDetails
        });
      }
    }
  };

  const updateDetail = (index: number, value: string, isEdit = false) => {
    if (isEdit) {
      const updatedDetails = [...editProduct.details];
      updatedDetails[index] = value;
      setEditProduct({
        ...editProduct,
        details: updatedDetails
      });
    } else {
      const updatedDetails = [...newProduct.details];
      updatedDetails[index] = value;
      setNewProduct({
        ...newProduct,
        details: updatedDetails
      });
    }
  };

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Products Management</h3>
          <button 
            onClick={() => setShowAddProductModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={16} className="mr-2" />
            Add Product
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">{product.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">₹{product.price}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditProduct(product)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Edit Product"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {products.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No products found. Add your first product to get started.
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal - keep existing code */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Product</h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              {/* All your existing add product form fields... */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                <select
                  value={newProduct.type}
                  onChange={(e) => setNewProduct({...newProduct, type: e.target.value as 'basic' | 'pro' | 'max'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="max">Max</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Details (4-8 points required)
                </label>
                {newProduct.details.map((detail, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={detail}
                      onChange={(e) => updateDetail(index, e.target.value)}
                      placeholder={`Detail point ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {newProduct.details.length > 4 && (
                      <button
                        type="button"
                        onClick={() => removeDetailField(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                {newProduct.details.length < 8 && (
                  <button
                    type="button"
                    onClick={() => addDetailField()}
                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    + Add another detail
                  </button>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Product</h3>
              <button
                onClick={() => setShowEditProductModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4">
              {/* Same form fields as add modal but using editProduct state */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={editProduct.image}
                  onChange={(e) => setEditProduct({...editProduct, image: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editProduct.description}
                  onChange={(e) => setEditProduct({...editProduct, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                <select
                  value={editProduct.type}
                  onChange={(e) => setEditProduct({...editProduct, type: e.target.value as 'basic' | 'pro' | 'max'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="max">Max</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editProduct.price}
                  onChange={(e) => setEditProduct({...editProduct, price: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Details (4-8 points required)
                </label>
                {editProduct.details.map((detail, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={detail}
                      onChange={(e) => updateDetail(index, e.target.value, true)}
                      placeholder={`Detail point ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {editProduct.details.length > 4 && (
                      <button
                        type="button"
                        onClick={() => removeDetailField(index, true)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                {editProduct.details.length < 8 && (
                  <button
                    type="button"
                    onClick={() => addDetailField(true)}
                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    + Add another detail
                  </button>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditProductModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-2">Delete Product</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete &quot;{selectedProduct.name}&quot;? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center space-x-3 px-7 py-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteProduct}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}