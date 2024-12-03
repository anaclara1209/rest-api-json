const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config(); // Carrega variáveis de ambiente do arquivo .env


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para interpretar JSON
app.use(express.json());

// Conexão com o MongoDB
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

// Função para conectar ao banco de dados
async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Conectado ao MongoDB!");
    db = client.db('clarafbana'); // Aqui conectamos ao banco de dados
    //console.log("Conectado ao MongoDB!",db);
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error);
    process.exit(1); // Encerra o servidor em caso de erro
  }
}

// Inicializa a conexão ao banco
connectToDatabase();

// Endpoints

// Rota para testar a conexão
app.get('/', (req, res) => {
  res.send('API funcionando!');
});

// Rota para listar todos os usuários
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await db.collection('usuarios').find().toArray(); // Acessa a coleção "usuarios"
    res.json(usuarios);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ message: 'Erro ao buscar usuários', error });
  }
});

// Rota GET para buscar um usuário por ID
app.get('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const trimmedId = id.trim();  // Remover espaços em branco

  try {
    // Importa o ObjectId para buscas por ID
    const { ObjectId } = require('mongodb');
    
    // Exibe o ID recebido para verificar se está correto
    console.log("ID recebido:", trimmedId);

    // Verifica se o ID tem o formato correto para o MongoDB (24 caracteres hexadecimais)
    if (!ObjectId.isValid(trimmedId) || trimmedId.length !== 24) {
      console.log("ID inválido detectado.");
      return res.status(400).json({ message: 'ID inválido' });
    }

    // Converte o ID para o tipo ObjectId
    const newId = new ObjectId(trimmedId);

    // Log para verificar o ID que está sendo usado na consulta
    console.log("Buscando usuário com ID:", newId);

    // Consulta no banco de dados usando o _id
    const usuario = await db.collection('usuarios').findOne({ _id: newId });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error); // Log do erro
    res.status(500).json({ message: 'Erro ao buscar usuário', error });
  }
});


// Rota para criar um novo usuário
app.post('/usuarios', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const novoUsuario = { username, email, password };
    const result = await db.collection('usuarios').insertOne(novoUsuario); // Insere na coleção "usuarios"
    res.status(201).json(result);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res.status(500).json({ message: 'Erro ao criar usuário', error });
  }
});

// Rota PUT para alterar um usuário por ID
app.put('/usuarios/:id', async (req, res) => {
  let { id } = req.params;
  const updatedData = req.body; // Dados para atualizar

  // Remover espaços em branco extras do ID e dados
  id = id.trim(); // Remove espaços antes e depois do ID

  // Trime os campos do corpo da requisição
  if (updatedData.username) updatedData.username = updatedData.username.trim();
  if (updatedData.email) updatedData.email = updatedData.email.trim();
  if (updatedData.password) updatedData.password = updatedData.password.trim();

  try {
    // Importa o ObjectId para buscas por ID
    const { ObjectId } = require('mongodb');

    // Verifica se o ID é válido
    if (!ObjectId.isValid(id) || id.length !== 24) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    // Converte o ID para o tipo ObjectId
    const newId = new ObjectId(id);

    // Log para verificar o ID que está sendo usado na consulta
    console.log("Buscando usuário para atualizar com ID:", newId);

    // Tenta encontrar o usuário no banco de dados
    const usuarioExistente = await db.collection('usuarios').findOne({ _id: newId });

    if (!usuarioExistente) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Atualiza o usuário com os dados fornecidos
    const result = await db.collection('usuarios').updateOne(
      { _id: newId },
      { $set: updatedData } // Atualiza os campos com os dados fornecidos no corpo da requisição
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: 'Nenhuma alteração realizada' });
    }

    res.status(200).json({ message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({ message: 'Erro ao atualizar usuário', error });
  }
});



// Inicia o servidor
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
