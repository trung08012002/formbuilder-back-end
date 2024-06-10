import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

export interface CustomRequest<T = unknown, U = unknown>
  extends Request<ParamsDictionary, unknown, T, U> {}
