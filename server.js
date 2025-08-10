require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log("Servidor iniciando..."); // Log 1: Confirma que o script começou

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let model;
try {
    console.log("Verificando a chave de API..."); // Log 2
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.length < 10) { // Verifica se a chave existe e não está vazia
        throw new Error("A variável de ambiente GEMINI_API_KEY não foi encontrada ou está vazia!");
    }
    console.log("Chave de API encontrada. Inicializando o modelo de IA..."); // Log 3
    const genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-pro" });
    console.log("Modelo de IA inicializado com sucesso."); // Log 4
} catch (error) {
    console.error("!!!!!!!!!! ERRO CRÍTICO NA INICIALIZAÇÃO !!!!!!!!!!");
    console.error(error.message); // Mostra o erro de forma clara
}

// Rota de teste para ver se o servidor está no ar
app.get('/', (req, res) => {
    res.send('Servidor de IA está no ar e pronto para receber chamadas!');
});

app.post('/api/generate', async (req, res) => {
    console.log("\n--- Nova requisição recebida em /api/generate ---"); // Log 5
    
    if (!model) {
        console.error("ERRO: A chamada foi recebida, mas o modelo de IA não foi inicializado. Verifique os logs de erro acima.");
        return res.status(500).json({ error: 'Erro interno do servidor: Modelo de IA não está pronto.' });
    }

    try {
        const { prompt } = req.body;
        console.log("Prompt recebido:", prompt); // Log 6

        if (!prompt) {
            console.log("Erro: Prompt vazio recebido.");
            return res.status(400).json({ error: 'O prompt é obrigatório.' });
        }

        console.log("Enviando prompt para a API do Gemini..."); // Log 7
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Resposta da IA recebida com sucesso."); // Log 8

        res.json({ generatedText: text });

    } catch (error) {
        console.error("!!!!!!!!!! ERRO AO CHAMAR A API DO GEMINI !!!!!!!!!!");
        console.error(error);
        res.status(500).json({ error: 'Falha ao gerar conteúdo.' });
    }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
