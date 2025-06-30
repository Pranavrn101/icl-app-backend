import pkg from 'pg'
const { Pool } = pkg

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'jobCardData',
  password: 'Postgres101',
  port: 5432,
})

export default pool