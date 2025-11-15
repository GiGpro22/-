const express = require('express');
const router = express.Router();
const pool = require('../db');

// получаю все товары, можно указать id категорий для фильтрации
router.get('/', async (req, res) => {
  try {
    const { category_ids } = req.query;
    
    let zapros = `
      SELECT 
        s.*,
        c.title as category_title,
        c.slug as category_slug
      FROM products s
      INNER JOIN categories c ON s.category_id = c.id_category
      WHERE s.is_active = TRUE
    `;
    
    const parametri = [];
    
    // если указаны категории, добавляю их к запросу
    if (category_ids) {
      const massivKategoriy = Array.isArray(category_ids) 
        ? category_ids 
        : category_ids.split(',').map(id => parseInt(id.trim()));
      
      if (massivKategoriy.length > 0) {
        zapros += ` AND s.category_id = ANY($1)`;
        parametri.push(massivKategoriy);
      }
    }
    
    zapros += ' ORDER BY s.title';
    
    const rezultat = await pool.query(zapros, parametri);
    res.json(rezultat.rows);
  } catch (oshibka) {
    console.error('не получилось получить товары:', oshibka);
    res.status(500).json({ error: 'Ошибка при получении товаров' });
  }
});

// получаю один товар по его id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const rezultat = await pool.query(
      `SELECT 
        s.*,
        c.title as category_title,
        c.slug as category_slug
      FROM products s
      INNER JOIN categories c ON s.category_id = c.id_category
      WHERE s.id_product = $1`,
      [id]
    );
    
    if (rezultat.rows.length === 0) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    res.json(rezultat.rows[0]);
  } catch (oshibka) {
    console.error('не получилось получить товар:', oshibka);
    res.status(500).json({ error: 'Ошибка при получении товара' });
  }
});

module.exports = router;

