const express = require('express');
const router = express.Router();
const pool = require('../db');

// получаю все купоны пользователя, которые он может использовать
router.get('/user/:userId/coupons', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const rezultat = await pool.query(
      `SELECT 
        uc.*,
        u_assigned.first_name as assigned_by_name,
        u_assigned.last_name as assigned_by_last_name
      FROM user_coupons uc
      INNER JOIN users u_assigned ON uc.assigned_by = u_assigned.id_user
      WHERE uc.user_id = $1 AND uc.is_active = TRUE
      ORDER BY uc.assigned_at DESC`,
      [userId]
    );
    
    res.json(rezultat.rows);
  } catch (oshibka) {
    console.error('не получилось получить купоны:', oshibka);
    res.status(500).json({ error: 'Ошибка при получении купонов' });
  }
});

// считаю все скидки для корзины: персональные, на товары, купоны
router.post('/calculate', async (req, res) => {
  try {
    const { userId, cartItems } = req.body;
    
    if (!cartItems || !Array.isArray(cartItems)) {
      return res.status(400).json({ error: 'Товары корзины обязательны' });
    }
    
    const tovary = cartItems;
    let obshayaSkidka = 0;
    let obshayaSumma = 0;
    let personalnayaSkidka = 0;
    let skidkaKupona = 0;
    let skidkiNaTovary = [];
    
    // получаю персональную скидку пользователя
    if (userId) {
      const polzovatel = await pool.query(
        'SELECT personal_discount FROM users WHERE id_user = $1',
        [userId]
      );
      
      if (polzovatel.rows.length > 0) {
        personalnayaSkidka = polzovatel.rows[0].personal_discount || 0;
      }
      
      // получаю активные купоны
      const kupony = await pool.query(
        'SELECT discount FROM user_coupons WHERE user_id = $1 AND is_active = TRUE AND used_at IS NULL',
        [userId]
      );
      
      if (kupony.rows.length > 0) {
        // беру максимальную скидку из купонов
        skidkaKupona = Math.max(...kupony.rows.map(k => k.discount));
      }
    }
    
    // считаю скидки на товары
    for (const tovar of tovary) {
      const produkt = await pool.query(
        'SELECT price, discount FROM products WHERE id_product = $1',
        [tovar.productId]
      );
      
      if (produkt.rows.length > 0) {
        const dannyeProdukta = produkt.rows[0];
        const cenaTovara = parseFloat(dannyeProdukta.price);
        const skidkaNaTovar = dannyeProdukta.discount || 0;
        const summaTovara = cenaTovara * tovar.quantity;
        const summaSkidkiNaTovar = (summaTovara * skidkaNaTovar) / 100;
        
        obshayaSumma += summaTovara;
        obshayaSkidka += summaSkidkiNaTovar;
        
        skidkiNaTovary.push({
          productId: tovar.productId,
          discount: skidkaNaTovar,
          discountAmount: summaSkidkiNaTovar
        });
      }
    }
    
    // применяю персональную скидку или скидку купона (беру максимальную)
    const maksimalnayaPersonalnayaSkidka = Math.max(personalnayaSkidka, skidkaKupona);
    const summaPersonalnoySkidki = (obshayaSumma * maksimalnayaPersonalnayaSkidka) / 100;
    
    const itogovayaSumma = obshayaSumma - obshayaSkidka - summaPersonalnoySkidki;
    const itogovayaSkidka = obshayaSkidka + summaPersonalnoySkidki;
    
    res.json({
      totalAmount: obshayaSumma,
      itemDiscounts: skidkiNaTovary,
      personalDiscount: maksimalnayaPersonalnayaSkidka,
      personalDiscountAmount: summaPersonalnoySkidki,
      totalDiscount: itogovayaSkidka,
      finalTotal: itogovayaSumma
    });
  } catch (oshibka) {
    console.error('не получилось посчитать скидки:', oshibka);
    res.status(500).json({ error: 'Ошибка при расчете скидок' });
  }
});

module.exports = router;

