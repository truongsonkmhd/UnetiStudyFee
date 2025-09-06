export interface IResponseMessage<T = any> {
  status: boolean;
  statusCode: number;
  message: string;
  data?: T;
}
