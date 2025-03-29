require("dotenv").config({ path: "../.env" });
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Configurando a URL base da API e a API Key do Asaas
const ASAAS_API_URL = process.env.ASAAS_API_URL_SANDBOX;
const API_KEY = process.env.ASAAS_API_KEY;

// Middleware para validar a API Key
if (!API_KEY) {
  console.error("Erro: API_KEY não configurada no arquivo .env");
  process.exit(1);
}

// Rota para criar um novo cliente
app.post("/api/criar-cliente", async (req, res) => {
  const { nome, cpfCnpj, email, telefone } = req.body;

  if (!nome || !cpfCnpj || !email || !telefone) {
    return res
      .status(400)
      .json({ message: "Todos os campos são obrigatórios" });
  }

  try {
    const response = await axios.post(
      `${ASAAS_API_URL}/customers`,
      {
        name: nome,
        cpfCnpj: cpfCnpj,
        email: email,
        phone: telefone,
      },
      {
        headers: {
          "Content-Type": "application/json",
          access_token: API_KEY,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      "Erro ao criar cliente:",
      error.response?.data || error.message
    );
    res.status(500).json({
      message: "Erro ao criar cliente",
      error: error.response?.data || error.message,
    });
  }
});

// Rota para gerar pagamento (boleto, cartão de crédito ou Pix)
app.post("/api/gerar-pagamento", async (req, res) => {
  const { customerId, valor, vencimento, paymentMethod, cardInfo } = req.body;

  if (!customerId || !valor || !vencimento || !paymentMethod) {
    return res
      .status(400)
      .json({ message: "Todos os campos são obrigatórios" });
  }

  try {
    // Validação do método de pagamento
    let billingType;
    if (paymentMethod === "BOLETO") {
      billingType = "BOLETO";
    } else if (paymentMethod === "PIX") {
      billingType = "PIX";
    } else if (paymentMethod === "CREDIT_CARD") {
      billingType = "CREDIT_CARD";
    } else {
      return res.status(400).json({ message: "Método de pagamento inválido" });
    }

    // Configuração do corpo da requisição
    const paymentData = {
      customer: customerId,
      billingType: billingType,
      dueDate: vencimento,
      value: valor,
    };

    // Adicionar informações específicas para cartão de crédito
    if (billingType === "CREDIT_CARD") {
      if (!cardInfo) {
        return res.status(400).json({
          message: "Informações do cartão de crédito são obrigatórias",
        });
      }

      const { holderName, number, expiryMonth, expiryYear, ccv } = cardInfo;
      if (!holderName || !number || !expiryMonth || !expiryYear || !ccv) {
        return res.status(400).json({
          message: "Todos os campos do cartão de crédito são obrigatórios",
        });
      }
      paymentData.creditCard = {
        holderName,
        number,
        expiryMonth,
        expiryYear,
        ccv,
      };

      paymentData.creditCardHolderInfo = {
        name: holderName,
        email: req.body.email,
        cpfCnpj: req.body.cpfCnpj,
        postalCode: req.body.postalCode,
        addressNumber: req.body.addressNumber,
        phone: req.body.telefone,
      };
    }

    // Chamada à API do Asaas
    const response = await axios.post(
      `${ASAAS_API_URL}/payments`,
      paymentData,
      {
        headers: {
          "Content-Type": "application/json",
          access_token: API_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(
      "Erro ao gerar pagamento:",
      error.response?.data || error.message
    );
    res.status(500).json({
      message: "Erro ao gerar pagamento",
      error: error.response?.data || error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
