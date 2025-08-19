export type ProductType = {
  _id: string;
  name: string;
  image: string;
  description: string;
  type: 'basic' | 'pro' | 'max';
  price: number;
  details: string[];
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  category: string;
  tax: {
    type: 'percentage' | 'fixed';
    value: number;
    label: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type OrderItemType = {
  productId: ProductType;
  quantity: number;
};

export type OrderType = {
  _id: string;
  items: OrderItemType[];
  totalAmount: number;
  status: string;
};

export type UserType = {
  _id: string;
  username: string;
  email: string;
  isVerified: boolean;
};