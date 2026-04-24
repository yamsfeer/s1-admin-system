import request from './request';

export function getOrderList(params) {
  return request.get('/orders', { params });
}

export function getOrderDetail(id) {
  return request.get(`/orders/${id}`);
}

export function createOrder(data) {
  return request.post('/orders', data);
}

export function updateOrderStatus(id, data) {
  return request.put(`/orders/${id}/status`, data);
}

export function updateOrder(id, data) {
  return request.put(`/orders/${id}`, data);
}

export function deleteOrder(id) {
  return request.delete(`/orders/${id}`);
}

export function addRemark(id, data) {
  return request.post(`/orders/${id}/remarks`, data);
}

export function exportOrders(params) {
  return request.get('/orders/export', {
    params,
    responseType: 'blob'
  });
}
