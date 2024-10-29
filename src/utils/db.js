import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const executeQuery = async (query, params = []) => {
  try {
    if (query.toLowerCase().includes('select')) {
      if (query.includes('WHERE cpf =')) {
        const cpf = params[0];
        const response = await axios.get(`${API_URL}/users/search?cpf=${cpf}`);
        return response.data ? [response.data] : [];
      } else if (query.includes('FROM meal_types')) {
        const response = await axios.get(`${API_URL}/meal-types`);
        return response.data || [];
      } else if (query.includes('FROM voucher_usage')) {
        const userId = params[0];
        const date = params[1];
        const response = await axios.get(`${API_URL}/voucher-usage?userId=${userId}&date=${date}`);
        return response.data || [];
      } else {
        const response = await axios.get(`${API_URL}/users`);
        return response.data || [];
      }
    } else if (query.toLowerCase().includes('insert')) {
      const [name, email, cpf, company, voucher, turno, isSuspended] = params;
      const response = await axios.post(`${API_URL}/users`, {
        name,
        email,
        cpf,
        company,
        voucher,
        turno,
        isSuspended
      });
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};