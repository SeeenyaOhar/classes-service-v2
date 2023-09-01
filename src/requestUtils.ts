import { Request } from 'express';

export class InvalidIdError extends Error {
    constructor(message: string){
        super(message);
    }
}

export function getIdFromParam(req: Request) {
    if (!req?.params?.id || Number.isNaN(req.params.id)) {
      throw new InvalidIdError("The parameter in the URL is invalid.");
    }
    const id = Number.parseFloat(req.params.id);
    if (!Number.isInteger(id)) {
      throw new InvalidIdError("The parameter in the URL is not an integer.")
    }
    return id;
  }