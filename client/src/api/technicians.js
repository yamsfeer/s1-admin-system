import request from './request';

export function getTechnicians() {
  return request.get('/technicians');
}

export function createTechnician(data) {
  return request.post('/technicians', data);
}

export function updateTechnician(id, data) {
  return request.put(`/technicians/${id}`, data);
}

export function deleteTechnician(id) {
  return request.delete(`/technicians/${id}`);
}
