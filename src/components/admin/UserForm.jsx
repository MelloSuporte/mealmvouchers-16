import React, { useState } from 'react';
import { toast } from "sonner";
import UserFormMain from './UserFormMain';
import api from '../../utils/api';
import logger from '../../config/logger';

const UserForm = () => {
  const [formData, setFormData] = useState({
    nomeUsuario: "",
    cpfUsuario: "",
    empresa: "",
    voucher: "",
    turnoSelecionado: "",
    suspenso: false,
    fotoUsuario: null
  });
  const [enviando, setEnviando] = useState(false);

  const validarFormulario = () => {
    if (!formData.nomeUsuario || !formData.cpfUsuario || !formData.empresa || !formData.voucher || !formData.turnoSelecionado) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return false;
    }

    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!cpfRegex.test(formData.cpfUsuario)) {
      toast.error("Por favor, insira um CPF válido no formato XXX.XXX.XXX-XX");
      return false;
    }

    return true;
  };

  const handleSalvarUsuario = async () => {
    if (!validarFormulario() || enviando) return;

    try {
      setEnviando(true);
      
      const dadosUsuario = {
        nome: formData.nomeUsuario,
        cpf: formData.cpfUsuario.replace(/\D/g, ''),
        empresa_id: parseInt(formData.empresa),
        voucher: formData.voucher,
        turno: formData.turnoSelecionado,
        suspenso: formData.suspenso,
        foto: formData.fotoUsuario instanceof File ? await converterParaBase64(formData.fotoUsuario) : formData.fotoUsuario
      };

      let resposta;
      const endpoint = `/api/usuarios${formData.id ? `/${formData.id}` : ''}`;
      const metodo = formData.id ? 'put' : 'post';

      resposta = await api[metodo](endpoint, dadosUsuario);

      if (resposta.data.sucesso) {
        toast.success(formData.id ? "Usuário atualizado com sucesso!" : "Usuário cadastrado com sucesso!");
        limparFormulario();
      } else {
        throw new Error(resposta.data.erro || 'Erro ao salvar usuário');
      }
    } catch (erro) {
      const mensagemErro = erro.response?.data?.erro || erro.message || "Erro ao salvar usuário";
      toast.error(mensagemErro);
      logger.error('Erro ao salvar usuário:', erro);
    } finally {
      setEnviando(false);
    }
  };

  const converterParaBase64 = (arquivo) => {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.readAsDataURL(arquivo);
      leitor.onload = () => resolve(leitor.result);
      leitor.onerror = (erro) => reject(erro);
    });
  };

  const limparFormulario = () => {
    setFormData({
      nomeUsuario: "",
      cpfUsuario: "",
      empresa: "",
      voucher: "",
      turnoSelecionado: "",
      suspenso: false,
      fotoUsuario: null
    });
  };

  const handleInputChange = (campo, valor) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  return (
    <div className="space-y-4">
      <UserFormMain
        formData={formData}
        onInputChange={handleInputChange}
        onSave={handleSalvarUsuario}
        isSubmitting={enviando}
      />
    </div>
  );
};

export default UserForm;