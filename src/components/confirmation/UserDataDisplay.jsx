const UserDataDisplay = ({ userName, mealName }) => {
  return (
    <>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-bold text-lg mb-2">Dados do Usuário</h3>
        <p className="flex items-center gap-2">
          <span className="text-green-600">✓</span>
          {userName || 'Usuário'}
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-bold text-lg mb-2">Tipo de Refeição</h3>
        <p className="flex items-center gap-2">
          <span className="text-green-600">✓</span>
          {mealName || 'Refeição'}
        </p>
      </div>
    </>
  );
};

export default UserDataDisplay;