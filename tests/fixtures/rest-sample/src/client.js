const axios = require('axios');

async function getUsers() {
  const response = await axios.get('/api/v1/users');
  return response.data;
}

async function createUser(user) {
  const response = await axios.post('/api/v1/users', user);
  return response.data;
}

async function updateUser(id, data) {
  const response = await axios.put(`/api/v1/users/${id}`, data);
  return response.data;
}

async function deleteUser(id) {
  await axios.delete(`/api/v1/users/${id}`);
}

async function fetchWithNative() {
  const response = await fetch('/api/v1/users');
  return response.json();
}

module.exports = { getUsers, createUser, updateUser, deleteUser, fetchWithNative };
