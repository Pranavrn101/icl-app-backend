import express from 'express'
import pool from '../db.js' // Make sure this path is correct

const router = express.Router()

// GET staff list
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM warehouse_staff ORDER BY name ASC')
    res.json(result.rows)
  } catch (error) {
    console.error('Failed to fetch staff:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST add staff
router.post('/', async (req, res) => {
  const { name } = req.body
  try {
    await pool.query('INSERT INTO warehouse_staff (name) VALUES ($1)', [name])
    res.status(201).json({ message: 'Staff added' })
  } catch (error) {
    console.error('Failed to add staff:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE staff
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM warehouse_staff WHERE id = $1', [id])
    res.json({ message: 'Staff removed' })
  } catch (error) {
    console.error('Failed to delete staff:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
