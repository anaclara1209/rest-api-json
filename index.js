const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para interpretar JSON
//app.use(express.json());

// Simulação de banco de dados
let usuarios = [
  { id: 1, username: 'joao', password: 'senha123', email: 'joao@example.com' },
  { id: 2, username: 'maria', password: 'senha456', email: 'maria@example.com' },
];

let apiKey = "minha-api-chave"; // Chave para bloquear acesso

// Middleware para verificar API Key
function verificarApiKey(req, res, next) {
  const token = req.headers['x-api-key'];
  if (token === apiKey) {
    next();
  } else {
    res.status(403).json({ message: 'Acesso negado. Chave de API inválida.' });
  }
}

// Rota de autenticação (POST /auth)
app.post('/auth', (req, res) => {
  const { username, password } = req.body;

  const usuario = usuarios.find(user => user.username === username && user.password === password);

  if (usuario) {
    res.json({ message: 'Autenticação bem-sucedida', usuario });
  } else {
    res.status(401).json({ message: 'Credenciais inválidas' });
  }
});

// Rota para listar todos os usuários (GET /usuarios)
app.get('/usuarios', verificarApiKey, (req, res) => {
  res.json(usuarios);
});

// Rota para consultar um usuário por ID (GET /usuarios/:id)
app.get('/usuarios/:id', verificarApiKey, (req, res) => {
  const usuario = usuarios.find(u => u.id === parseInt(req.params.id));

  if (usuario) {
    res.json(usuario);
  } else {
    res.status(404).json({ message: 'Usuário não encontrado' });
  }
});

// Rota para criar um novo usuário (POST /usuarios)
app.post('/usuarios', verificarApiKey, (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
  }

  const novoUsuario = {
    id: usuarios.length + 1,
    username,
    password,
    email,
  };

  usuarios.push(novoUsuario);
  res.status(201).json({ message: 'Usuário criado com sucesso', usuario: novoUsuario });
});

// Rota para atualizar um usuário (PUT /usuarios/:id)
app.put('/usuarios/:id', verificarApiKey, (req, res) => {
  const { username, password, email } = req.body;

  const usuario = usuarios.find(u => u.id === parseInt(req.params.id));

  if (!usuario) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  if (!username || !password || !email) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
  }

  usuario.username = username;
  usuario.password = password;
  usuario.email = email;

  res.json({ message: 'Usuário atualizado com sucesso', usuario });
});

// Iniciando o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
