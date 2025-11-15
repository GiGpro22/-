const express = require('express');
const router = express.Router();
const pool = require('../db');

// получаю все категории с сервера
router.get('/', async (req, res) => {
  try {
    const rezultat = await pool.query(
      'SELECT * FROM categories WHERE is_active = TRUE ORDER BY display_order, title'
    );
    res.json(rezultat.rows);
  } catch (oshibka) {
    console.error('не получилось получить категории:', oshibka);
    res.status(500).json({ error: 'Ошибка при получении категорий' });
  }
});

// создаю новую категорию, используется только в админке
router.post('/', async (req, res) => {
  try {
    const { title, slug, is_active = true, display_order = 0 } = req.body;
    
    if (!title || !slug) {
      return res.status(400).json({ error: 'Название и slug обязательны' });
    }

    const rezultat = await pool.query(
      'INSERT INTO categories (title, slug, is_active, display_order) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, slug, is_active, display_order]
    );
    
    res.status(201).json(rezultat.rows[0]);
  } catch (oshibka) {
    console.error('не получилось создать категорию:', oshibka);
    res.status(500).json({ error: 'Ошибка при создании категории' });
  }
});

module.exports = router;



