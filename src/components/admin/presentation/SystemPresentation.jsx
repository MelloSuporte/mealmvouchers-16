import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';

const SystemPresentation = () => {
  const { data: usageData } = useQuery({
    queryKey: ['usage-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_uso_voucher_detalhado')
        .select('*')
        .order('data_uso', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      return data;
    }
  });

  const processedData = usageData?.reduce((acc, curr) => {
    const date = new Date(curr.data_uso).toLocaleDateString();
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.total += 1;
      existing.value += parseFloat(curr.valor_refeicao || 0);
    } else {
      acc.push({
        date,
        total: 1,
        value: parseFloat(curr.valor_refeicao || 0)
      });
    }
    return acc;
  }, []) || [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Sistema de Vouchers para Refeitório</h1>
        <p className="text-gray-600">Gestão Inteligente de Refeições</p>
      </header>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="benefits">Benefícios</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="features">Funcionalidades</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sobre o Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>• Controle digital de acesso ao refeitório</li>
                  <li>• Gestão de diferentes tipos de vouchers</li>
                  <li>• Integração com sistemas existentes</li>
                  <li>• Monitoramento em tempo real</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tipos de Vouchers</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>• Voucher Comum (permanente)</li>
                  <li>• Voucher Extra (situações específicas)</li>
                  <li>• Voucher Descartável (uso único)</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="benefits">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Financeiros</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>• Redução de custos operacionais</li>
                  <li>• Controle efetivo de gastos</li>
                  <li>• Prevenção de fraudes</li>
                  <li>• Relatórios detalhados</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Operacionais</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>• Automatização de processos</li>
                  <li>• Redução de erros humanos</li>
                  <li>• Gestão simplificada</li>
                  <li>• Maior produtividade</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estratégicos</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>• Dados para tomada de decisão</li>
                  <li>• Melhor planejamento</li>
                  <li>• Satisfação dos usuários</li>
                  <li>• Conformidade legal</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Utilização nos Últimos 30 Dias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="total" stroke="#8884d8" name="Refeições" />
                    <Line type="monotone" dataKey="value" stroke="#82ca9d" name="Valor (R$)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Acesso</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>• Validação em tempo real</li>
                  <li>• Controle por turnos</li>
                  <li>• Gestão de horários</li>
                  <li>• Restrições personalizadas</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relatórios e Análises</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>• Dashboards interativos</li>
                  <li>• Exportação de dados</li>
                  <li>• Métricas personalizadas</li>
                  <li>• Histórico completo</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Segurança</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>• Autenticação robusta</li>
                  <li>• Logs de atividades</li>
                  <li>• Backup automático</li>
                  <li>• Criptografia de dados</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integrações</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>• Sistema de RH</li>
                  <li>• Controle de Acesso</li>
                  <li>• Sistema Financeiro</li>
                  <li>• APIs personalizadas</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemPresentation;