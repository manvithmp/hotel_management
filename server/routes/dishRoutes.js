const express = require('express');
const router = express.Router();
const Dish = require('../models/Dish');

router.get('/', async (req, res) => {
  try {
    const dishes = await Dish.find();
    res.json(dishes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dishes' });
  }
});

router.post('/', async (req, res) => {
  const { name, price, image, category } = req.body;

  try {
    const newDish = new Dish({ name, price, image, category });
    await newDish.save();
    res.status(201).json(newDish);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add dish' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Dish.findByIdAndDelete(req.params.id);
    res.json({ message: 'Dish deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete dish' });
  }
});

module.exports = router;
