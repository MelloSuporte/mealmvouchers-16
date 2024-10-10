import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

const Index = () => {
  const [newUser, setNewUser] = useState({ name: '', email: '' });

  const fetchUsers = async () => {
    const response = await fetch('http://localhost:5000/api/users');
    if (!response.ok) {
      throw new Error('Erro ao buscar usuários');
    }
    return response.json();
  };

  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      if (!response.ok) {
        throw new Error('Erro ao criar usuário');
      }
      setNewUser({ name: '', email: '' });
      refetch();
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Lista de Usuários</h1>
      <ul className="mb-4">
        {users.map((user) => (
          <li key={user.id} className="mb-2">
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nome"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Adicionar Usuário
        </button>
      </form>
    </div>
  );
};

export default Index;