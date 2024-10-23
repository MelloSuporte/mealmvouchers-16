// Simulação temporária usando localStorage
export const executeQuery = async (query, params = []) => {
  try {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simular operações básicas
    if (query.toLowerCase().includes('select')) {
      const storedData = localStorage.getItem('users') || '[]';
      return JSON.parse(storedData);
    } else if (query.toLowerCase().includes('insert')) {
      const storedData = localStorage.getItem('users') || '[]';
      const users = JSON.parse(storedData);
      const newUser = {
        id: Date.now(),
        name: params[0],
        email: params[1],
        cpf: params[2],
        company: params[3],
        voucher: params[4],
        turno: params[5],
        is_suspended: params[6]
      };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      return { insertId: newUser.id };
    }
    return [];
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};