import { p as request } from "./index-CEcSfnM8.js";
function getOrderList(params) {
  return request.get("/orders", { params });
}
function getOrderDetail(id) {
  return request.get(`/orders/${id}`);
}
function createOrder(data) {
  return request.post("/orders", data);
}
function updateOrderStatus(id, data) {
  return request.put(`/orders/${id}/status`, data);
}
function addRemark(id, data) {
  return request.post(`/orders/${id}/remarks`, data);
}
function exportOrders(params) {
  return request.get("/orders/export", {
    params,
    responseType: "blob"
  });
}
export {
  getOrderDetail as a,
  addRemark as b,
  createOrder as c,
  exportOrders as e,
  getOrderList as g,
  updateOrderStatus as u
};
