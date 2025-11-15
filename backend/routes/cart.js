const express = require('express');
const router = express.Router();
const pool = require('../db');

// получаю корзину пользователя или по session_id
router.get('/', async (req, res) => {
  try {
    const { user_id, session_id } = req.query;
    
    let korzina;
    
    // ищу корзину по user_id или session_id
    if (user_id) {
      korzina = await pool.query(
        'SELECT * FROM cart WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
        [user_id]
      );
    } else if (session_id) {
      korzina = await pool.query(
        'SELECT * FROM cart WHERE session_id = $1 ORDER BY updated_at DESC LIMIT 1',
        [session_id]
      );
    } else {
      return res.status(400).json({ error: 'Требуется user_id или session_id' });
    }
    
    if (korzina.rows.length === 0) {
      return res.json({ items: [], cartId: null, sessionId: session_id || null });
    }
    
    const idKorzini = korzina.rows[0].id_cart;
    
    // получаю товары из корзины
    const tovary = await pool.query(
      `SELECT 
        ci.*,
        p.title,
        p.price as original_price,
        p.discount
      FROM cart_items ci
      INNER JOIN products p ON ci.product_id = p.id_product
      WHERE ci.cart_id = $1`,
      [idKorzini]
    );
    
    res.json({
      items: tovary.rows,
      cartId: idKorzini,
      sessionId: korzina.rows[0].session_id
    });
  } catch (oshibka) {
    console.error('не получилось получить корзину:', oshibka);
    res.status(500).json({ error: 'Ошибка при получении корзины' });
  }
});

// добавляю товар в корзину
router.post('/', async (req, res) => {
  try {
    const { userId, sessionId, productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json({ error: 'ID товара обязателен' });
    }
    
    // получаю информацию о товаре
    const tovar = await pool.query(
      'SELECT price, discount FROM products WHERE id_product = $1 AND is_active = TRUE',
      [productId]
    );
    
    if (tovar.rows.length === 0) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    const cenaTovara = parseFloat(tovar.rows[0].price);
    const skidkaNaTovar = tovar.rows[0].discount || 0;
    const itogovayaCena = cenaTovara * (1 - skidkaNaTovar / 100);
    
    // нахожу или создаю корзину
    let korzina;
    if (userId) {
      korzina = await pool.query(
        'SELECT * FROM cart WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
        [userId]
      );
    } else if (sessionId) {
      korzina = await pool.query(
        'SELECT * FROM cart WHERE session_id = $1 ORDER BY updated_at DESC LIMIT 1',
        [sessionId]
      );
    }
    
    let idKorzini;
    if (korzina && korzina.rows.length > 0) {
      idKorzini = korzina.rows[0].id_cart;
      // обновляю время обновления корзины
      await pool.query(
        'UPDATE cart SET updated_at = CURRENT_TIMESTAMP WHERE id_cart = $1',
        [idKorzini]
      );
    } else {
      // создаю новую корзину
      const novayaKorzina = await pool.query(
        'INSERT INTO cart (user_id, session_id) VALUES ($1, $2) RETURNING *',
        [userId || null, sessionId || null]
      );
      idKorzini = novayaKorzina.rows[0].id_cart;
    }
    
    // проверяю есть ли уже этот товар в корзине
    const sushestvuyushiyTovar = await pool.query(
      'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [idKorzini, productId]
    );
    
    if (sushestvuyushiyTovar.rows.length > 0) {
      // обновляю количество
      await pool.query(
        'UPDATE cart_items SET quantity = quantity + $1, price = $2 WHERE id_cart_item = $3',
        [quantity, itogovayaCena, sushestvuyushiyTovar.rows[0].id_cart_item]
      );
    } else {
      // добавляю новый товар
      await pool.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [idKorzini, productId, quantity, itogovayaCena]
      );
    }
    
    res.json({ success: true, cartId: idKorzini });
  } catch (oshibka) {
    console.error('не получилось добавить в корзину:', oshibka);
    res.status(500).json({ error: 'Ошибка при добавлении в корзину' });
  }
});

// удаляю товар из корзины
router.delete('/item/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM cart_items WHERE id_cart_item = $1', [id]);
    
    res.json({ success: true });
  } catch (oshibka) {
    console.error('не получилось удалить из корзины:', oshibka);
    res.status(500).json({ error: 'Ошибка при удалении из корзины' });
  }
});

// очищаю корзину
router.delete('/', async (req, res) => {
  try {
    const { cartId } = req.body;
    
    if (!cartId) {
      return res.status(400).json({ error: 'ID корзины обязателен' });
    }
    
    await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
    await pool.query('DELETE FROM cart WHERE id_cart = $1', [cartId]);
    
    res.json({ success: true });
  } catch (oshibka) {
    console.error('не получилось очистить корзину:', oshibka);
    res.status(500).json({ error: 'Ошибка при очистке корзины' });
  }
});

module.exports = router;

