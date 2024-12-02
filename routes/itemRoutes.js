const express = require('express');
const jwt = require('jsonwebtoken');
const Item = require('../models/Item');

const router = express.Router();

// Middleware para autenticação
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Acesso negado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ error: 'Token inválido' });
  }
};

// Obter todos os itens
router.get('/', authenticate, async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

// Obter item por ID
router.get('/:id', authenticate, async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item não encontrado' });
  res.json(item);
});

// Criar novo item
router.post('/', authenticate, async (req, res) => {
  try {
    const item = new Item(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Atualizar item
router.put('/:id', authenticate, async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Item não encontrado' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
