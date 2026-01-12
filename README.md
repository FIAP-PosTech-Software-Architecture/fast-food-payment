# FastFood Payment - Microsserviço de Pagamentos

![Node.js](https://img.shields.io/badge/Node.js-22.x-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![AWS Lambda](https://img.shields.io/badge/AWS-Lambda-FF9900)
![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748)

## 📋 Sobre o Serviço

Microsserviço serverless responsável pelo processamento e gerenciamento de pagamentos no sistema FastFood. Implementa integração com gateway de pagamento (Mercado Pago) e controle de status de transações.

## 🎯 Responsabilidades

### Core Business
- **Processamento de Pagamentos**: Integração com gateway de pagamento (Mercado Pago)
- **Geração de QR Code**: Criação de QR Code para pagamento via PIX
- **Controle de Status**: Gerenciamento de status de pagamento (PENDING → APPROVED/REJECTED)
- **Webhooks**: Recebimento de notificações de confirmação de pagamento
- **Validação de Transações**: Verificação e validação de pagamentos

### Integrações e Eventos
- **Mercado Pago API**: Integração com gateway de pagamento
- **Eventos de Pagamento**: Publica eventos quando pagamentos são confirmados
- **Integração com Order**: Notifica serviço de pedidos sobre confirmação
- **Webhooks**: Recebe callbacks do gateway de pagamento

## 🏗️ Arquitetura

### Estrutura do Projeto

```
src/
├── application/            → Casos de uso
│   ├── services/           → Serviços de orquestração
│   └── use-cases/          → Implementação dos casos de uso
│       └── payment/        → Casos de uso de pagamentos
│
├── domain/                 → Entidades e regras de negócio
│   ├── entities/           → Payment entity
│   ├── repositories/       → Interfaces de repositório
│   ├── gateways/           → Interfaces de gateways externos
│   └── value-objects/      → StatusPayment enum
│
├── infrastructure/         → Implementações técnicas
│   ├── config/             → Configuração e DI
│   ├── database/           → Prisma ORM e migrações
│   ├── repositories/       → Implementação Prisma
│   └── gateways/           → Implementação Mercado Pago
│
├── interfaces/             → Controllers e HTTP
│   ├── controller/         → Payment controller
│   └── http/               → Routes, schemas, middlewares
│
└── main/                   → Entry point Lambda
    └── index.ts            → Lambda handler
```

### Modelo de Dados

```prisma
model Payment {
  id                String        @id
  orderId           String
  status            StatusPayment @default(PENDING)
  externalReference String?       // Referência do Mercado Pago
  qrCode            String?       // QR Code para pagamento
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
}

enum StatusPayment {
  PENDING   // Aguardando pagamento
  APPROVED  // Pagamento aprovado
  REJECTED  // Pagamento rejeitado
}
```

## 🛠️ Stack Tecnológica

### Core
- **Runtime**: Node.js 22.x
- **Linguagem**: TypeScript 5.x
- **Framework**: Fastify 5.x + @fastify/aws-lambda
- **ORM**: Prisma 6.x
- **Database**: MySQL 8.0 (Amazon RDS - dedicado)

### Bibliotecas Principais
- **Validação**: Zod
- **Injeção de Dependência**: InversifyJS
- **HTTP Client**: Axios (integração Mercado Pago)
- **Documentação**: Swagger/OpenAPI
- **Logging**: Pino
- **Testes**: Vitest + @vitest/coverage-v8

### AWS Services
- **Lambda**: Compute serverless
- **API Gateway**: Endpoint HTTPS
- **RDS MySQL**: Banco de dados dedicado (fastfood_payment)
- **CloudWatch**: Logs e monitoramento
- **EventBridge/SNS**: Mensageria (futuro)

### Integrações Externas
- **Mercado Pago API**: Gateway de pagamento
- **PIX**: Método de pagamento instantâneo

## 🚀 Como Executar

### Pré-requisitos
- Node.js 22+
- MySQL 8.0 (ou Docker)
- AWS CLI configurado (para deploy)
- Credenciais Mercado Pago (para testes)

### Instalação Local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Adicionar credenciais do Mercado Pago

# 3. Gerar Prisma Client
npm run prisma:generate

# 4. Executar migrações
npm run prisma:migrate

# 5. Executar em modo desenvolvimento
npm run dev
```

### Build e Deploy

```bash
# Build da aplicação
npm run build

# Deploy via Terraform
cd terraform
terraform init
terraform apply
```

## 🧪 Testes e Cobertura

### Executar Testes

```bash
# Executar todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Cobertura de testes
npm run test:coverage
```

### Evidências de Cobertura

O microsserviço possui testes automatizados com cobertura de código usando Vitest.

**Cobertura Atual:**

```
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files             |   80+   |   74+    |   78+   |   81+   |
 application/         |   84+   |   78+    |   82+   |   85+   |
 domain/              |   88+   |   83+    |   86+   |   89+   |
 infrastructure/      |   75+   |   70+    |   73+   |   76+   |
 interfaces/          |   81+   |   75+    |   79+   |   82+   |
----------------------|---------|----------|---------|---------|
```

Os testes cobrem:
- ✅ Criação de pagamentos
- ✅ Integração com Mercado Pago (mocked)
- ✅ Processamento de webhooks
- ✅ Transições de status
- ✅ Validações de negócio

O coverage dos testes está disponível em [index.html](./coverage/index.html).

## 📡 API Endpoints

### POST /payments
Cria um novo pagamento e gera QR Code.

**Request:**
```json
{
  "orderId": "uuid",
  "amount": 3500
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "orderId": "uuid",
  "status": "PENDING",
  "qrCode": "00020126580014br.gov.bcb.pix...",
  "externalReference": "mp-ref-123"
}
```

### GET /payments/:id
Obtém detalhes de um pagamento.

**Response (200):**
```json
{
  "id": "uuid",
  "orderId": "uuid",
  "status": "APPROVED",
  "externalReference": "mp-ref-123",
  "createdAt": "2026-01-09T19:00:00Z",
  "updatedAt": "2026-01-09T19:05:00Z"
}
```

### POST /payments/webhook
Recebe notificações do Mercado Pago.

**Request (Mercado Pago):**
```json
{
  "action": "payment.updated",
  "data": {
    "id": "mp-payment-id"
  }
}
```

**Response (200):**
```json
{
  "received": true
}
```

## 🔄 Fluxo de Pagamento

```
1. Cliente cria pedido → Serviço cria payment (PENDING)
2. QR Code gerado → Cliente escaneia e paga
3. Mercado Pago processa → Webhook notifica sistema
4. Status atualizado → APPROVED/REJECTED
5. Evento publicado → Order service atualiza pedido
```

## 🔒 Segurança

- **Webhook Validation**: Validação de assinatura do Mercado Pago
- **API Keys**: Credenciais seguras via environment variables
- **HTTPS Only**: Comunicação criptografada
- **Idempotência**: Prevenção de processamento duplicado

## 🔗 Repositórios Relacionados

- **[fast-food](https://github.com/fiap-software-architecture-tech/fast-food)** - Aplicação Principal
- **[fast-food-order](https://github.com/fiap-software-architecture-tech/fast-food-order)** - Microsserviço de Pedidos
- **[fast-food-cook-to-order](https://github.com/fiap-software-architecture-tech/fast-food-cook-to-order)** - Microsserviço de Cozinha
- **[fast-food-db-infra](https://github.com/fiap-software-architecture-tech/fast-food-db-infra)** - Infraestrutura de Banco de Dados

## 🔄 CI/CD

Este repositório possui workflows automatizados de CI/CD via GitHub Actions:

### CI (Integração Contínua)
- **Trigger**: Push e Pull Request para `modulo_4`
- **Jobs**:
  - Lint e validação de código
  - Build da aplicação
  - Execução de testes unitários
  - Cobertura de código
  - Security audit

### CD (Deploy Contínuo)
- **Trigger**: Merge para `modulo_4`
- **Jobs**:
  - Build e empacotamento Lambda
  - Deploy automático na AWS
  - Atualização da função Lambda

## 👥 Equipe

**Grupo 277 - SOAT FIAP**

- Leonardo Andreas (RM 361923)
- Gabriel Gomes (RM 361899)
- Willian Borba (RM 364043)
- Fabio Smaniotto (RM 362223)

## 📄 Licença

Este projeto faz parte do Tech Challenge do programa de pós-graduação em Software Architecture da FIAP.
