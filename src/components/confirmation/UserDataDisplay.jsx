const UserDataDisplay = ({ userName, cpf, turno, mealName }) => {
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-bold text-lg mb-2">Dados do Usuário</h3>
        <div className="space-y-2">
          <p className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span className="font-semibold">Nome:</span> {userName}
          </p>
          <p className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span className="font-semibold">CPF:</span> {cpf}
          </p>
          <p className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span className="font-semibold">Turno:</span> {turno}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-bold text-lg mb-2">Tipo de Refeição</h3>
        <p className="flex items-center gap-2">
          <span className="text-green-600">✓</span>
          {mealName || 'Não definido'}
        </p>
      </div>
    </div>
  );
};

export default UserDataDisplay;