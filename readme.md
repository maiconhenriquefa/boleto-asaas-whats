# Aplicação de Envio de Boletos via WhatsApp

Projeto que integra a API do **Asaas** para gerar boletos e enviá-los automaticamente via WhatsApp com mensagens personalizadas.

---

## 🛠 Tecnologias Utilizadas

- **Frontend**:

  - JavaScript
  - HTML / CSS
  - Axios (requisições HTTP)

- **Backend**:
  - API do **Asaas** (Geração de boletos)
  - Express
  - Node
  - Axios

---

## 🚀 Como Configurar

### Frontend

1. **Clone o Repositório**

   ```bash
   git clone https://github.com/seu-usuario/boletos-whatsapp.git
   cd boletos-whatsapp
   ```

2. **Instale as Dependências**

   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Inicie o Projeto**
   ```bash
   npm start
   # ou
   yarn start
   ```

### Backend

1. **Configure o .env**
   Crie um arquivo .env e adicione as seguintes variáveis:

```plaintext
ASAAS_API_KEY=sua_chave_api_aqui
ASAAS_API_URL=https://www.asaas.com/api/v3
```

2. Geração de Boletos
   A integração com o Asaas permitirá criar e gerenciar boletos a partir da API configurada.

### Documentação

- [API do Asaas](https://www.asaas.com/)
