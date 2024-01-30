import express, { Request, Response } from 'express'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.DB_PORT || 3000

app.get('/', (req: Request, res: Response) => {
  res.send(`Hello World!`)
})

app.listen(PORT, () => {
  console.log(`Server listened in port ${PORT}, http://localhost:${PORT}`)
})
