export {};

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      sessionId?: string;
      roles?: string[];
      correlationId?: string;
    }
  }
}
