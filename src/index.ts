import dotenv from 'dotenv'
import express, { Request, Response } from 'express'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { ROUTES } from './constants/routes'
import { PORT } from './constants/server'
import { swaggerDefinition } from './swaggerDocs/swaggerDefinition'

dotenv.config()

const app = express()

const options: swaggerJSDoc.Options = {
  swaggerDefinition,
  apis: ['./src/swaggerDocs/*.yaml']
}
const swaggerDocument = swaggerJSDoc(options)

app.use(ROUTES.API_DOCS, swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.get('/', (req: Request, res: Response) => {
  res.send(`Hello World!`)
})

app.listen(PORT, () => {
  console.log(`Server listened in port ${PORT}, http://localhost:${PORT}`)
})
