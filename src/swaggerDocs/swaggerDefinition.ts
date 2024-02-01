import { SERVER_URL } from '../constants/server'

export const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Formify App - API Docs',
    version: '0.1.0'
  },
  servers: [
    {
      url: SERVER_URL
    }
  ],
  tags: [
    {
      name: 'users',
      description: 'APIs about Users'
    }
  ]
}
