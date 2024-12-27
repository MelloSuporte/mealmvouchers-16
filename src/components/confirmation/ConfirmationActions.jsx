import { Button } from "@/components/ui/button";

const ConfirmationActions = ({ onConfirm, onCancel, isLoading }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button
        onClick={onCancel}
        variant="outline"
        className="w-full"
        disabled={isLoading}
      >
        Cancelar
      </Button>

      <Button
        onClick={onConfirm}
        disabled={isLoading}
        className="w-full bg-blue-900 hover:bg-blue-800"
      >
        {isLoading ? 'Confirmando...' : 'Confirmar'}
      </Button>
    </div>
  );
};

export default ConfirmationActions;