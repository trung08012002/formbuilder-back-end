import { compareSync } from 'bcrypt'
import { JWT_SECRET, JWT_TOKEN_DURATION } from '../configs/secrets'
import * as jwt from 'jsonwebtoken'

interface Payload {
  userId: number
  email: string
  username: string
}

export const comparePassword = (reqPassword: string, userPassword: string) => compareSync(reqPassword, userPassword)

export const createJWT = (payload: Payload): string => jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_TOKEN_DURATION })
