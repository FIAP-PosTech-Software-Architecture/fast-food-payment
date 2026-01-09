import { AxiosRequestConfig } from 'axios';

export interface IHttpClientService {
    get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
    post<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T>;
    put<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T>;
    patch<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T>;
}
