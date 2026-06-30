import http from './http';

export const aiMatch = (payload) => http.post('/ai/match', payload);
export const createScan = (payload) => http.post('/scan', payload);
export const getOrders = (params) => http.get('/orders', { params });
export const updateStatus = (payload) => http.post('/update-status', payload);
export const getInventory = () => http.get('/inventory');
export const getFinance = () => http.get('/finance');
export const getPayables = () => http.get('/payables');
export const importCsv = (formData) =>
  http.post('/import-csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
export const exportCsvUrl = (params = {}) => {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const query = new URLSearchParams(params).toString();
  return `${base}/export-csv${query ? `?${query}` : ''}`;
};
export const getProductLibrary = () => http.get('/product-library');
export const createProductLibrary = (payload) => http.post('/product-library', payload);
export const updateProductLibrary = (id, payload) => http.put(`/product-library/${id}`, payload);
export const deleteProductLibrary = (id) => http.delete(`/product-library/${id}`);

