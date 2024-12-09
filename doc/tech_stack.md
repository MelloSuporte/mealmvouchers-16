# Stack Tecnológica e Frameworks

## 1. Frontend

### 1.1 Core
- **React 18+**
  - Versão: 18.2.0
  - Features utilizadas:
    - Hooks
    - Context API
    - Suspense
    - Concurrent Mode
    - Server Components

- **Vite**
  - Versão: 4.4.0
  - Plugins:
    - @vitejs/plugin-react
    - vite-plugin-pwa
    - vite-plugin-compression

### 1.2 UI/UX
- **Tailwind CSS**
  - Versão: 3.3.3
  - Plugins:
    - @tailwindcss/forms
    - @tailwindcss/typography
    - @tailwindcss/aspect-ratio
  - Configurações personalizadas:
    ```javascript
    // tailwind.config.js
    module.exports = {
      theme: {
        extend: {
          colors: {
            primary: {...},
            secondary: {...}
          },
          spacing: {...},
          borderRadius: {...}
        }
      }
    }
    ```

- **Shadcn/ui**
  - Componentes utilizados:
    - Button
    - Dialog
    - Dropdown
    - Form
    - Table
    - Toast
  - Temas personalizados:
    ```javascript
    // themes/default.js
    export const defaultTheme = {
      colors: {...},
      spacing: {...},
      typography: {...}
    }
    ```

### 1.3 Gerenciamento de Estado
- **React Query**
  - Versão: 4.29.19
  - Configurações:
    ```typescript
    // queryClient.ts
    export const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,
          cacheTime: 10 * 60 * 1000,
          retry: 3,
          refetchOnWindowFocus: false
        }
      }
    });
    ```

- **Zustand**
  - Versão: 4.3.9
  - Stores:
    - AuthStore
    - UIStore
    - VoucherStore

### 1.4 Formulários
- **React Hook Form**
  - Versão: 7.45.1
  - Validação: Zod
  - Exemplo de configuração:
    ```typescript
    // forms/voucherForm.ts
    export const voucherSchema = z.object({
      code: z.string().length(4),
      type: z.enum(['comum', 'extra', 'descartavel']),
      validUntil: z.date().optional()
    });
    ```

### 1.5 Roteamento
- **React Router DOM**
  - Versão: 6.14.1
  - Estrutura:
    ```typescript
    // routes/index.tsx
    const routes = [
      {
        path: '/',
        element: <Layout />,
        children: [
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'vouchers', element: <Vouchers /> },
          { path: 'users', element: <Users /> }
        ]
      }
    ];
    ```

## 2. Backend

### 2.1 Supabase
- **Core**
  - Versão: 2.26.0
  - Serviços utilizados:
    - Database
    - Auth
    - Storage
    - Edge Functions
    - Realtime

- **Database**
  - PostgreSQL 14
  - Extensions:
    - pgcrypto
    - uuid-ossp
    - pgjwt
    - pg_stat_statements

### 2.2 APIs
- **REST API**
  - Endpoints principais:
    - /auth
    - /vouchers
    - /users
    - /companies
  - Middlewares:
    - Authentication
    - Rate Limiting
    - CORS
    - Error Handling

- **WebSocket**
  - Channels:
    - voucher_updates
    - user_notifications
    - system_status

### 2.3 Edge Functions
- **Deno**
  - Runtime: 1.34
  - Features:
    - TypeScript
    - Web Standards
    - Top Level Await

## 3. DevOps

### 3.1 Containerização
- **Docker**
  - Versão: 24.0.2
  - Images:
    ```dockerfile
    # Dockerfile
    FROM node:18-alpine
    WORKDIR /app
    COPY package*.json ./
    RUN npm install
    COPY . .
    RUN npm run build
    ```

- **Docker Compose**
  - Versão: 2.18.1
  - Serviços:
    ```yaml
    # docker-compose.yml
    services:
      app:
        build: .
        ports:
          - "3000:3000"
      nginx:
        image: nginx:alpine
        ports:
          - "80:80"
    ```

### 3.2 CI/CD
- **GitHub Actions**
  - Workflows:
    - Build e Test
    - Deploy
    - Security Scan
  - Exemplo:
    ```yaml
    # .github/workflows/main.yml
    name: CI/CD Pipeline
    on:
      push:
        branches: [main]
    jobs:
      build:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v3
          - uses: actions/setup-node@v3
          - run: npm ci
          - run: npm test
    ```

## 4. Layout e Estrutura de Arquivos

### 4.1 Estrutura de Diretórios
```
src/
├── components/
│   ├── common/
│   │   ├── Button/
│   │   ├── Input/
│   │   └── Modal/
│   ├── layout/
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   └── Footer/
│   └── features/
│       ├── vouchers/
│       ├── users/
│       └── reports/
├── hooks/
│   ├── useAuth.ts
│   ├── useVoucher.ts
│   └── useNotification.ts
├── pages/
│   ├── Dashboard/
│   ├── Vouchers/
│   └── Users/
├── services/
│   ├── api.ts
│   ├── supabase.ts
│   └── websocket.ts
├── store/
│   ├── auth.ts
│   ├── ui.ts
│   └── voucher.ts
├── styles/
│   ├── globals.css
│   └── themes/
└── utils/
    ├── format.ts
    ├── validation.ts
    └── constants.ts
```

### 4.2 Padrões de Layout
- **Grid System**
  ```css
  .container {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 1rem;
  }
  ```

- **Breakpoints**
  ```javascript
  // tailwind.config.js
  module.exports = {
    theme: {
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px'
      }
    }
  }
  ```

- **Componentes de Layout**
  ```typescript
  // Layout.tsx
  const Layout = ({ children }) => (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Sidebar />
      <main className="ml-64 p-8">
        {children}
      </main>
      <Footer />
    </div>
  );
  ```

### 4.3 Temas e Estilos
- **Variáveis CSS**
  ```css
  :root {
    --color-primary: #2563eb;
    --color-secondary: #4f46e5;
    --spacing-unit: 0.25rem;
    --border-radius: 0.375rem;
  }
  ```

- **Componentes Base**
  ```typescript
  // components/common/Button/styles.ts
  export const buttonVariants = {
    primary: 'bg-primary-500 hover:bg-primary-600',
    secondary: 'bg-secondary-500 hover:bg-secondary-600',
    danger: 'bg-red-500 hover:bg-red-600'
  };
  ```

## 5. Dependências Principais

### 5.1 Produção
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.26.0",
    "@tanstack/react-query": "^4.29.19",
    "date-fns": "^2.30.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.45.1",
    "react-router-dom": "^6.14.1",
    "tailwindcss": "^3.3.3",
    "zod": "^3.21.4",
    "zustand": "^4.3.9"
  }
}
```

### 5.2 Desenvolvimento
```json
{
  "devDependencies": {
    "@types/react": "^18.2.14",
    "@typescript-eslint/eslint-plugin": "^5.61.0",
    "@vitejs/plugin-react": "^4.0.1",
    "eslint": "^8.44.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.2",
    "vite": "^4.4.0"
  }
}
```

## 6. Configurações

### 6.1 TypeScript
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 6.2 ESLint
```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}
```

### 6.3 Vite
```javascript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@shadcn/ui'],
        },
      },
    },
  },
})
```
