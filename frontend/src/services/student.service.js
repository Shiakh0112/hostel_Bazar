import api from './api';

const studentService = {
  getStudentProfile: async () => {
    const response = await api.get('/students/profile');
    return response.data;
  },

  updateStudentProfile: async (data) => {
    const response = await api.put('/students/profile', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.put('/students/change-password', data);
    return response.data;
  }
};

export default studentService;
