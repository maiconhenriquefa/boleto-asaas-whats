const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Configurando a URL base da API e a API Key do Asaas
const ASAAS_API_URL = process.env.ASAAS_API_URL;
const API_KEY = process.env.ASAAS_API_KEY;

// Rota para criar um novo cliente
app.post("/api/criar-cliente", async (req, res) => {
  const { nome, cpfCnpj, email, telefone } = req.body;

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
    console.error(error);
    res
      .status(500)
      .json({ message: "Erro ao criar cliente", error: error.message });
  }
});

// Rota para gerar boleto
app.post("/api/gerar-boleto", async (req, res) => {
  const { customerId, valor, vencimento } = req.body;

  try {
    const response = await axios.post(
      `${ASAAS_API_URL}/payments`,
      {
        customer: customerId,
        billingType: "BOLETO",
        dueDate: vencimento,
        value: valor,
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
    console.error(error);
    res
      .status(500)
      .json({ message: "Erro ao gerar boleto", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
