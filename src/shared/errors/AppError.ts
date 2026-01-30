/**
 * Erro de aplicação base (Clean Architecture - camada shared).
 * Permite códigos HTTP e mensagens consistentes.
 */
export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly code?: string
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
