import axios from "axios";
import { useState } from "react";
import styled from "styled-components";

// Estilo básico
const Wrapper = styled.div`
  max-width: 500px;
  margin: auto;
  text-align: center;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Input = styled.input`
  padding: 10px;
  margin: 10px 0;
  width: 100%;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;
  &:hover {
    background-color: #45a049;
  }
`;

function App() {
  const [nome, setNome] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [valor, setValor] = useState("");
  const [vencimento, setVencimento] = useState("");
  const [boletoUrl, setBoletoUrl] = useState("");

  const handleGerarBoleto = async () => {
    try {
      // Criar cliente
      const clienteResponse = await axios.post(
        "http://localhost:3001/api/criar-cliente",
        {
          nome,
          cpfCnpj,
          email,
          telefone,
        }
      );

      const customerId = clienteResponse.data.id;

      // Gerar boleto
      const boletoResponse = await axios.post(
        "http://localhost:3001/api/gerar-boleto",
        {
          customerId,
          valor,
          vencimento,
        }
      );

      setBoletoUrl(boletoResponse.data.bankSlipUrl);
    } catch (error) {
      console.error("Erro ao gerar boleto:", error);
    }
  };

  const handleSendWhatsApp = () => {
    if (boletoUrl) {
      const mensagem = `Olá ${nome},\n\nAqui está o seu boleto de R$${valor}, com vencimento em ${vencimento}.\nBaixe o boleto aqui: ${boletoUrl}`;
      const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
      window.open(urlWhatsApp, "_blank");
    } else {
      alert("Primeiro, gere o boleto!");
    }
  };

  return (
    <Container>
      <Wrapper>
        <h2>Gerar Boleto e Enviar pelo WhatsApp</h2>
        <Input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <Input
          type="text"
          placeholder="CPF/CNPJ"
          value={cpfCnpj}
          onChange={(e) => setCpfCnpj(e.target.value)}
        />
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Valor"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />
        <Input
          type="date"
          value={vencimento}
          onChange={(e) => setVencimento(e.target.value)}
        />

        <div
          style={{
            display: "flex",
            alignSelf: "center",
            justifyContent: "center",
            alignItems: "center",
            gap: "24px",
            marginTop: "16px",
          }}
        >
          <Button onClick={handleGerarBoleto}>Gerar Boleto</Button>
          <Button onClick={handleSendWhatsApp}>Enviar pelo WhatsApp</Button>
        </div>
      </Wrapper>
    </Container>
  );
}

export default App;
