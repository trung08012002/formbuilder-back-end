import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

export interface CustomRequest<T>
  extends Request<ParamsDictionary, unknown, T> {}
