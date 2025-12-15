// utility to handle errors
export class AppError extends Error {
  header?: string;
  status: number;
  constructor(header: string, message: string, status = 500) {
    super(message);
    this.header = header || "Oops";
    this.status = status;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
