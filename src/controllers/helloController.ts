import { Request, Response } from 'express';
import { fetchHelloMessage } from '../services/helloService';

export const getHelloMessage = (req: Request, res: Response) => {
  const message = fetchHelloMessage();
  res.status(200).json({ message });
};
