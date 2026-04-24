import { p as request } from "./index-CEcSfnM8.js";
function getTechnicians() {
  return request.get("/technicians");
}
function createTechnician(data) {
  return request.post("/technicians", data);
}
function updateTechnician(id, data) {
  return request.put(`/technicians/${id}`, data);
}
function deleteTechnician(id) {
  return request.delete(`/technicians/${id}`);
}
export {
  createTechnician as c,
  deleteTechnician as d,
  getTechnicians as g,
  updateTechnician as u
};
