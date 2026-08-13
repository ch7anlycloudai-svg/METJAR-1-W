const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  };

  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  const res = await fetch(url, config);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

export const api = {
  // Products
  getProducts: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/products${query}`);
  },
  getProduct: (id: string) => request<any>(`/products/${id}`),
  createProduct: (data: any) => request<any>('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: any) => request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: string) => request<any>(`/products/${id}`, { method: 'DELETE' }),
  uploadProductImages: (id: string, formData: FormData) =>
    fetch(`${API_BASE}/products/${id}/images`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
      body: formData,
    }).then(r => r.json()),
  deleteProductImage: (imageId: string) => request<any>(`/products/images/${imageId}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => request<any>('/categories'),
  getCategory: (id: string) => request<any>(`/categories/${id}`),
  createCategory: (data: any) => request<any>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: string, data: any) => request<any>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id: string) => request<any>(`/categories/${id}`, { method: 'DELETE' }),

  // Orders
  createOrder: (data: any) => request<any>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getOrders: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/orders${query}`);
  },
  getOrder: (id: string) => request<any>(`/orders/${id}`),
  updateOrderStatus: (id: string, status: string) =>
    request<any>(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Customers
  getCustomers: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/customers${query}`);
  },
  getCustomer: (id: string) => request<any>(`/customers/${id}`),

  // Coupons
  getCoupons: () => request<any>('/coupons'),
  createCoupon: (data: any) => request<any>('/coupons', { method: 'POST', body: JSON.stringify(data) }),
  updateCoupon: (id: string, data: any) => request<any>(`/coupons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCoupon: (id: string) => request<any>(`/coupons/${id}`, { method: 'DELETE' }),
  validateCoupon: (code: string, total: number) =>
    request<any>('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, total }) }),

  // Homepage
  getHomepageSections: () => request<any>('/homepage/sections'),
  updateHero: (data: any) => request<any>('/homepage/hero', { method: 'PUT', body: JSON.stringify(data) }),
  updateBanner: (data: any) => request<any>('/homepage/banner', { method: 'PUT', body: JSON.stringify(data) }),
  updateSection: (id: string, data: any) => request<any>(`/homepage/sections/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Settings
  getSettings: () => request<any>('/settings'),
  updateSettings: (data: any) => request<any>('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Auth
  login: (email: string, password: string) =>
    request<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getProfile: () => request<any>('/auth/profile'),
  changePassword: (current_password: string, new_password: string) =>
    request<any>('/auth/password', { method: 'PUT', body: JSON.stringify({ current_password, new_password }) }),
};
