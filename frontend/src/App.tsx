import axios from "axios";
import { useReducer } from "react";
import styled from "styled-components";

// Estilo básico
const Wrapper = styled.div`
  max-width: 500px;
  margin: auto;
  text-align: center;
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
  box-sizing: border-box;
  background-color: #464646;
  color: white;
  width: 100%;
  border-radius: 4px;
  border: 1px solid rgb(133, 133, 133);
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

const Select = styled.select`
  padding: 10px;
  margin: 10px 0;
  width: 100%;
  border: 1px solid rgb(133, 133, 133);
  border-radius: 4px;
  appearance: none;
  background: white
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")
    no-repeat right 10px center;
  background-size: 16px 16px;
  cursor: pointer;
  background-color: #464646;
`;

// Estado inicial para o formulário
const initialState = {
  nome: "",
  cpfCnpj: "",
  email: "",
  telefone: "",
  valor: "",
  vencimento: "",
  paymentMethod: "BOLETO",
  cardInfo: {
    holderName: "",
    number: "",
    expiryMonth: "",
    expiryYear: "",
    ccv: "",
  },
  boletoUrl: "",
};

// Redutor para gerenciar o estado do formulário
interface CardInfo {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

interface State {
  nome: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  valor: string;
  vencimento: string;
  paymentMethod: string;
  cardInfo: CardInfo;
  boletoUrl: string;
}

type Action =
  | { type: "SET_FIELD"; field: keyof State; value: string }
  | { type: "SET_CARD_FIELD"; field: keyof CardInfo; value: string }
  | { type: "SET_BOLETO_URL"; value: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_CARD_FIELD":
      return {
        ...state,
        cardInfo: { ...state.cardInfo, [action.field]: action.value },
      };
    case "SET_BOLETO_URL":
      return { ...state, boletoUrl: action.value };
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleGerarPagamento = async () => {
    try {
      // Criar cliente
      const clienteResponse = await axios.post(
        "http://localhost:3001/api/criar-cliente",
        {
          nome: state.nome,
          cpfCnpj: state.cpfCnpj,
          email: state.email,
          telefone: state.telefone,
        }
      );

      const customerId = clienteResponse.data.id;

      // Dados adicionais para cartão de crédito
      const paymentData =
        state.paymentMethod === "CREDIT_CARD"
          ? {
              holderName: state.cardInfo.holderName,
              number: state.cardInfo.number,
              expiryMonth: state.cardInfo.expiryMonth,
              expiryYear: state.cardInfo.expiryYear,
              ccv: state.cardInfo.ccv,
            }
          : {};

      // Gerar pagamento com base no método selecionado
      const pagamentoResponse = await axios.post(
        "http://localhost:3001/api/gerar-pagamento",
        {
          customerId,
          valor: state.valor,
          vencimento: state.vencimento,
          paymentMethod: state.paymentMethod,
          cardInfo: paymentData,
        }
      );

      dispatch({
        type: "SET_BOLETO_URL",
        value: pagamentoResponse.data.invoiceUrl,
      });
    } catch (error) {
      console.error("Erro ao gerar pagamento:", error);
    }
  };

  const handleSendWhatsApp = () => {
    if (state.boletoUrl) {
      const mensagem = `Olá ${state.nome},\n\nAqui está o seu link de pagamento de R$${state.valor}, com vencimento em ${state.vencimento}.\nAcesse aqui: ${state.boletoUrl}`;
      const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
      window.open(urlWhatsApp, "_blank");
    } else {
      alert("Primeiro, gere o pagamento!");
    }
  };

  return (
    <Container>
      <Wrapper>
        <h2>Gerar Pagamento e Enviar pelo WhatsApp</h2>
        <Input
          type="text"
          placeholder="Nome"
          value={state.nome}
          onChange={(e) =>
            dispatch({
              type: "SET_FIELD",
              field: "nome",
              value: e.target.value,
            })
          }
        />
        <Input
          type="text"
          placeholder="CPF/CNPJ"
          value={state.cpfCnpj}
          onChange={(e) =>
            dispatch({
              type: "SET_FIELD",
              field: "cpfCnpj",
              value: e.target.value,
            })
          }
        />
        <Input
          type="email"
          placeholder="Email"
          value={state.email}
          onChange={(e) =>
            dispatch({
              type: "SET_FIELD",
              field: "email",
              value: e.target.value,
            })
          }
        />
        <Input
          type="text"
          placeholder="Telefone"
          value={state.telefone}
          onChange={(e) =>
            dispatch({
              type: "SET_FIELD",
              field: "telefone",
              value: e.target.value,
            })
          }
        />
        <Input
          type="number"
          placeholder="Valor"
          value={state.valor}
          onChange={(e) =>
            dispatch({
              type: "SET_FIELD",
              field: "valor",
              value: e.target.value,
            })
          }
        />
        <div
          style={{
            display: "flex",
            gap: "12px",
            width: "100%",
          }}
        >
          <Input
            type="date"
            value={state.vencimento}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                field: "vencimento",
                value: e.target.value,
              })
            }
          />
          <Select
            value={state.paymentMethod}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                field: "paymentMethod",
                value: e.target.value,
              })
            }
          >
            <option value="BOLETO">Boleto</option>
            <option value="PIX">Pix</option>
            <option value="CREDIT_CARD">Cartão de Crédito</option>
          </Select>
        </div>

        {/* Campos adicionais para cartão de crédito */}
        {state.paymentMethod === "CREDIT_CARD" && (
          <div style={{ width: "100%" }}>
            <Input
              type="text"
              placeholder="Número do Cartão"
              value={state.cardInfo.number}
              onChange={(e) =>
                dispatch({
                  type: "SET_CARD_FIELD",
                  field: "number",
                  value: e.target.value,
                })
              }
            />
            <Input
              type="text"
              placeholder="Nome no Cartão"
              value={state.cardInfo.holderName}
              onChange={(e) =>
                dispatch({
                  type: "SET_CARD_FIELD",
                  field: "holderName",
                  value: e.target.value,
                })
              }
            />
            <div style={{ display: "flex", gap: "12px" }}>
              <Input
                type="text"
                placeholder="Validade (MM)"
                value={state.cardInfo.expiryMonth}
                onChange={(e) => {
                  dispatch({
                    type: "SET_CARD_FIELD",
                    field: "expiryMonth",
                    value: e.target.value,
                  });
                }}
              />
              <Input
                type="text"
                placeholder="Validade (AA)"
                value={`${state.cardInfo.expiryYear}`}
                onChange={(e) => {
                  dispatch({
                    type: "SET_CARD_FIELD",
                    field: "expiryYear",
                    value: e.target.value,
                  });
                }}
              />
              <Input
                type="text"
                placeholder="CVV"
                value={state.cardInfo.ccv}
                onChange={(e) =>
                  dispatch({
                    type: "SET_CARD_FIELD",
                    field: "ccv",
                    value: e.target.value,
                  })
                }
              />
            </div>
          </div>
        )}

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
          <Button onClick={handleGerarPagamento}>Gerar Pagamento</Button>
          <Button onClick={handleSendWhatsApp}>Enviar pelo WhatsApp</Button>
        </div>
      </Wrapper>
    </Container>
  );
}

export default App;
