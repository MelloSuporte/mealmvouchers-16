export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          cpf: string
          criado_em: string | null
          email: string
          empresa_id: string | null
          id: string
          nome: string
          permissoes: Json
          senha: string
          suspenso: boolean | null
        }
        Insert: {
          cpf: string
          criado_em?: string | null
          email: string
          empresa_id?: string | null
          id?: string
          nome: string
          permissoes?: Json
          senha: string
          suspenso?: boolean | null
        }
        Update: {
          cpf?: string
          criado_em?: string | null
          email?: string
          empresa_id?: string | null
          id?: string
          nome?: string
          permissoes?: Json
          senha?: string
          suspenso?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_users_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "vw_uso_voucher_detalhado"
            referencedColumns: ["empresa_id"]
          },
        ]
      }
      background_images: {
        Row: {
          created_at: string | null
          id: number
          image_url: string
          is_active: boolean | null
          page: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          image_url: string
          is_active?: boolean | null
          page: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          image_url?: string
          is_active?: boolean | null
          page?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      configuracoes: {
        Row: {
          atualizado_em: string | null
          chave: string
          descricao: string | null
          id: number
          valor: string | null
        }
        Insert: {
          atualizado_em?: string | null
          chave: string
          descricao?: string | null
          id?: number
          valor?: string | null
        }
        Update: {
          atualizado_em?: string | null
          chave?: string
          descricao?: string | null
          id?: number
          valor?: string | null
        }
        Relationships: []
      }
      empresas: {
        Row: {
          ativo: boolean | null
          cnpj: string
          criado_em: string | null
          id: string
          logo: string | null
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          cnpj: string
          criado_em?: string | null
          id?: string
          logo?: string | null
          nome: string
        }
        Update: {
          ativo?: boolean | null
          cnpj?: string
          criado_em?: string | null
          id?: string
          logo?: string | null
          nome?: string
        }
        Relationships: []
      }
      logs_sistema: {
        Row: {
          criado_em: string | null
          dados: Json | null
          detalhes: Json | null
          id: number
          mensagem: string
          nivel: string
          tipo: string
          usuario_id: string | null
        }
        Insert: {
          criado_em?: string | null
          dados?: Json | null
          detalhes?: Json | null
          id?: number
          mensagem: string
          nivel?: string
          tipo?: string
          usuario_id?: string | null
        }
        Update: {
          criado_em?: string | null
          dados?: Json | null
          detalhes?: Json | null
          id?: number
          mensagem?: string
          nivel?: string
          tipo?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      refeicoes: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          criado_em: string | null
          criado_por: string | null
          id: string
          nome: string
          valor: number
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          criado_em?: string | null
          criado_por?: string | null
          id?: string
          nome: string
          valor: number
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          criado_em?: string | null
          criado_por?: string | null
          id?: string
          nome?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "refeicoes_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      refeicoes_extras: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          autorizado_por: string | null
          criado_em: string | null
          data_consumo: string
          id: string
          nome_refeicao: string | null
          observacao: string | null
          quantidade: number
          refeicoes: string | null
          usuario_id: string | null
          valor: number
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          autorizado_por?: string | null
          criado_em?: string | null
          data_consumo: string
          id?: string
          nome_refeicao?: string | null
          observacao?: string | null
          quantidade?: number
          refeicoes?: string | null
          usuario_id?: string | null
          valor: number
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          autorizado_por?: string | null
          criado_em?: string | null
          data_consumo?: string
          id?: string
          nome_refeicao?: string | null
          observacao?: string | null
          quantidade?: number
          refeicoes?: string | null
          usuario_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "refeicoes_extras_refeicoes_fkey"
            columns: ["refeicoes"]
            isOneToOne: false
            referencedRelation: "refeicoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refeicoes_extras_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refeicoes_extras_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "view_cpf_uuid"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "refeicoes_extras_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vw_uso_voucher_detalhado"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      setores: {
        Row: {
          ativo: boolean | null
          criado_em: string | null
          id: number
          nome_setor: string
        }
        Insert: {
          ativo?: boolean | null
          criado_em?: string | null
          id?: number
          nome_setor: string
        }
        Update: {
          ativo?: boolean | null
          criado_em?: string | null
          id?: number
          nome_setor?: string
        }
        Relationships: []
      }
      tipos_refeicao: {
        Row: {
          ativo: boolean | null
          criado_em: string | null
          horario_fim: string | null
          horario_inicio: string | null
          id: string
          max_usuarios_por_dia: number | null
          minutos_tolerancia: number | null
          nome: string
          valor: number
        }
        Insert: {
          ativo?: boolean | null
          criado_em?: string | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          max_usuarios_por_dia?: number | null
          minutos_tolerancia?: number | null
          nome: string
          valor: number
        }
        Update: {
          ativo?: boolean | null
          criado_em?: string | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          max_usuarios_por_dia?: number | null
          minutos_tolerancia?: number | null
          nome?: string
          valor?: number
        }
        Relationships: []
      }
      turnos: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          horario_fim: string
          horario_inicio: string
          id: string
          tipo_turno: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          horario_fim: string
          horario_inicio: string
          id?: string
          tipo_turno?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          horario_fim?: string
          horario_inicio?: string
          id?: string
          tipo_turno?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      uso_voucher: {
        Row: {
          cpf: string | null
          cpf_id: string | null
          created_at: string | null
          id: string
          observacao: string | null
          tipo_refeicao_id: string | null
          tipo_voucher: string | null
          usado_em: string | null
          usuario_id: string | null
          voucher: string | null
          voucher_comum_id: string | null
          voucher_descartavel_id: string | null
        }
        Insert: {
          cpf?: string | null
          cpf_id?: string | null
          created_at?: string | null
          id?: string
          observacao?: string | null
          tipo_refeicao_id?: string | null
          tipo_voucher?: string | null
          usado_em?: string | null
          usuario_id?: string | null
          voucher?: string | null
          voucher_comum_id?: string | null
          voucher_descartavel_id?: string | null
        }
        Update: {
          cpf?: string | null
          cpf_id?: string | null
          created_at?: string | null
          id?: string
          observacao?: string | null
          tipo_refeicao_id?: string | null
          tipo_voucher?: string | null
          usado_em?: string | null
          usuario_id?: string | null
          voucher?: string | null
          voucher_comum_id?: string | null
          voucher_descartavel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "uso_voucher_tipo_refeicao_id_fkey"
            columns: ["tipo_refeicao_id"]
            isOneToOne: false
            referencedRelation: "tipos_refeicao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uso_voucher_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uso_voucher_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "view_cpf_uuid"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "uso_voucher_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vw_uso_voucher_detalhado"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "uso_voucher_voucher_descartavel_id_fkey"
            columns: ["voucher_descartavel_id"]
            isOneToOne: false
            referencedRelation: "vouchers_descartaveis"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          cpf: string
          cpf_id: string | null
          criado_em: string | null
          empresa_id: string | null
          foto: string | null
          id: string
          nome: string
          role: string | null
          setor_id: number | null
          suspenso: boolean | null
          turno_id: string | null
          voucher: string | null
        }
        Insert: {
          cpf: string
          cpf_id?: string | null
          criado_em?: string | null
          empresa_id?: string | null
          foto?: string | null
          id?: string
          nome: string
          role?: string | null
          setor_id?: number | null
          suspenso?: boolean | null
          turno_id?: string | null
          voucher?: string | null
        }
        Update: {
          cpf?: string
          cpf_id?: string | null
          criado_em?: string | null
          empresa_id?: string | null
          foto?: string | null
          id?: string
          nome?: string
          role?: string | null
          setor_id?: number | null
          suspenso?: boolean | null
          turno_id?: string | null
          voucher?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_usuarios_turnos"
            columns: ["turno_id"]
            isOneToOne: false
            referencedRelation: "turnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "vw_uso_voucher_detalhado"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "usuarios_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "vw_uso_voucher_detalhado"
            referencedColumns: ["setor_id"]
          },
        ]
      }
      vouchers_descartaveis: {
        Row: {
          codigo: string
          data_criacao: string | null
          data_requisicao: string | null
          data_uso: string | null
          id: string
          nome_empresa: string | null
          nome_pessoa: string | null
          solicitante: string | null
          tipo_refeicao_id: string | null
          usado_em: string | null
        }
        Insert: {
          codigo: string
          data_criacao?: string | null
          data_requisicao?: string | null
          data_uso?: string | null
          id?: string
          nome_empresa?: string | null
          nome_pessoa?: string | null
          solicitante?: string | null
          tipo_refeicao_id?: string | null
          usado_em?: string | null
        }
        Update: {
          codigo?: string
          data_criacao?: string | null
          data_requisicao?: string | null
          data_uso?: string | null
          id?: string
          nome_empresa?: string | null
          nome_pessoa?: string | null
          solicitante?: string | null
          tipo_refeicao_id?: string | null
          usado_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vouchers_descartaveis_solicitante_fkey"
            columns: ["solicitante"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vouchers_descartaveis_tipo_refeicao_id_fkey"
            columns: ["tipo_refeicao_id"]
            isOneToOne: false
            referencedRelation: "tipos_refeicao"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      view_cpf_uuid: {
        Row: {
          cpf: string | null
          cpf_id: string | null
          usuario_id: string | null
        }
        Insert: {
          cpf?: string | null
          cpf_id?: string | null
          usuario_id?: string | null
        }
        Update: {
          cpf?: string | null
          cpf_id?: string | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      vw_uso_voucher_detalhado: {
        Row: {
          codigo_voucher: string | null
          cpf: string | null
          created_at: string | null
          data_uso: string | null
          empresa_id: string | null
          id: string | null
          nome_empresa: string | null
          nome_setor: string | null
          nome_usuario: string | null
          observacao: string | null
          setor_id: number | null
          tipo_refeicao: string | null
          tipo_voucher: string | null
          turno: string | null
          usuario_id: string | null
          valor_refeicao: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_constraint_exists: {
        Args: { constraint_name: string }
        Returns: boolean
      }
      check_daily_usage_limits: {
        Args: { p_usuario_id: string }
        Returns: boolean
      }
      check_meal_time_allowed: {
        Args: { p_tipo_refeicao_id: string }
        Returns: boolean
      }
      check_meal_time_and_shift: {
        Args: { p_tipo_refeicao_id: string; p_turno_id: string }
        Returns: boolean
      }
      check_meal_time_rules: {
        Args: {
          p_tipo_refeicao_id: string
          p_usuario_id: string
          p_turno_id: string
        }
        Returns: boolean
      }
      check_user_shift: {
        Args: { p_usuario_id: string; p_current_time?: string }
        Returns: boolean
      }
      check_user_shift_allowed: {
        Args: { p_usuario_id: string }
        Returns: boolean
      }
      check_voucher_comum_rules: {
        Args: { p_usuario_id: string; p_tipo_refeicao_id: string }
        Returns: boolean
      }
      check_voucher_extra_rules: {
        Args: { p_voucher_id: string; p_usuario_id: string }
        Returns: boolean
      }
      convert_cpf_to_uuid: {
        Args: { cpf: string }
        Returns: string
      }
      count_estimate: {
        Args: { query: string }
        Returns: number
      }
      get_logs_sistema: {
        Args: {
          p_tipo?: string
          p_nivel?: string
          p_data_inicio?: string
          p_data_fim?: string
          p_limite?: number
        }
        Returns: {
          criado_em: string | null
          dados: Json | null
          detalhes: Json | null
          id: number
          mensagem: string
          nivel: string
          tipo: string
          usuario_id: string | null
        }[]
      }
      get_user_id_by_cpf: {
        Args: { cpf_input: string }
        Returns: string
      }
      get_user_uuid_by_cpf: {
        Args: { cpf_input: string }
        Returns: string
      }
      get_uuid_from_cpf: {
        Args: { p_cpf: string }
        Returns: string
      }
      insert_log_sistema: {
        Args: {
          p_tipo: string
          p_mensagem: string
          p_detalhes?: Json
          p_nivel?: string
        }
        Returns: undefined
      }
      insert_system_log: {
        Args: { p_tipo: string; p_mensagem: string; p_dados?: Json }
        Returns: undefined
      }
      insert_uso_voucher: {
        Args: { p_usuario_id: string; p_tipo_refeicao_id: string }
        Returns: {
          uso_id: number
          nome_usuario: string
          tipo_refeicao: string
          valor_refeicao: number
        }[]
      }
      insert_voucher_descartavel: {
        Args: {
          p_codigo: string
          p_tipo_refeicao_id: string
          p_nome_pessoa: string
          p_nome_empresa: string
          p_solicitante: string
          p_data_uso: string
        }
        Returns: string
      }
      is_feriado: {
        Args: { p_data: string }
        Returns: boolean
      }
      limpar_vouchers_descartaveis_expirados: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      log_voucher_usage: {
        Args: { p_voucher_id: string; p_tipo_refeicao_id: string }
        Returns: undefined
      }
      manage_configuracao: {
        Args: { p_chave: string; p_valor: Json; p_descricao?: string }
        Returns: {
          atualizado_em: string | null
          chave: string
          descricao: string | null
          id: number
          valor: string | null
        }
      }
      register_disposable_voucher_usage: {
        Args: { p_voucher_id: string; p_tipo_refeicao_id: string }
        Returns: Json
      }
      sync_uso_voucher_to_relatorio: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      use_voucher_descartavel: {
        Args: { p_codigo: string }
        Returns: string
      }
      validar_horario_refeicao: {
        Args: { p_tipo_refeicao_id: string; p_horario_atual?: string }
        Returns: boolean
      }
      validar_horario_refeicao_turno: {
        Args: { p_tipo_refeicao_id: string; p_usuario_id: string }
        Returns: boolean
      }
      validar_horario_tipo_refeicao: {
        Args: { p_tipo_refeicao_id: string; p_hora_atual?: string }
        Returns: boolean
      }
      validar_horario_turno: {
        Args: { p_turno_id: string }
        Returns: boolean
      }
      validar_limite_uso_tipo_refeicao: {
        Args: { p_usuario_id: string; p_tipo_refeicao_id: string }
        Returns: boolean
      }
      validar_limites_uso: {
        Args: { p_usuario_id: string; p_tipo_refeicao_id: string }
        Returns: boolean
      }
      validar_limites_uso_diario: {
        Args: { p_usuario_id: string; p_tipo_refeicao_id: string }
        Returns: boolean
      }
      validar_turno: {
        Args: { p_usuario_id: string }
        Returns: boolean
      }
      validar_turno_usuario: {
        Args:
          | { p_usuario_id: string }
          | { p_usuario_id: string; p_horario_atual?: string }
        Returns: boolean
      }
      validar_turno_usuario_horario: {
        Args: { p_usuario_id: string }
        Returns: boolean
      }
      validate_and_use_common_voucher: {
        Args: { p_usuario_id: string; p_tipo_refeicao_id: string }
        Returns: Json
      }
      validate_and_use_voucher: {
        Args: { p_codigo: string; p_tipo_refeicao_id: string }
        Returns: Json
      }
      validate_and_use_voucher_comum: {
        Args: { p_codigo: string; p_tipo_refeicao_id: string }
        Returns: Json
      }
      validate_cpf: {
        Args: { p_cpf: string }
        Returns: string
      }
      validate_disposable_voucher: {
        Args: { p_codigo: string; p_tipo_refeicao_id: string }
        Returns: Json
      }
      validate_meal_time: {
        Args: { p_tipo_refeicao_id: string }
        Returns: boolean
      }
      validate_shift_time: {
        Args: { p_turno_id: string }
        Returns: boolean
      }
      validate_usage_limits: {
        Args: { p_usuario_id: string; p_tipo_refeicao_id: string }
        Returns: boolean
      }
      validate_voucher_base: {
        Args: { p_codigo: string; p_tipo_refeicao_id: string }
        Returns: Json
      }
      validate_voucher_comum: {
        Args: { p_voucher: string }
        Returns: {
          usuario_id: string
          nome: string
          empresa_id: string
          turno_id: string
        }[]
      }
      validate_voucher_comum_usage: {
        Args: { p_codigo: string }
        Returns: boolean
      }
      validate_voucher_descartavel: {
        Args: { p_codigo: string; p_tipo_refeicao_id: string }
        Returns: boolean
      }
      validate_voucher_extra_usage: {
        Args: { p_voucher_id: string; p_usuario_id: string }
        Returns: boolean
      }
      validate_voucher_usage: {
        Args: { p_usuario_id: string; p_tipo_refeicao_id: string }
        Returns: boolean
      }
      validate_voucher_usage_limits: {
        Args: { p_usuario_id: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
