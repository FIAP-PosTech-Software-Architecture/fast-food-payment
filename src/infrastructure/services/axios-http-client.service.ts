import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { inject, injectable } from 'inversify';

import { IHttpClientService } from '#/domain/services/http-client.service';
import { ILogger } from '#/domain/services/logger.service';
import { TYPES } from '#/infrastructure/config/di/types';

@injectable()
export class AxiosHttpClientService implements IHttpClientService {
    private readonly client: AxiosInstance;

    constructor(@inject(TYPES.Logger) private readonly logger: ILogger) {
        this.client = axios.create({
            timeout: 5000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        try {
            this.logger.debug('HTTP GET Request', { url });
            const response = await this.client.get<T>(url, config);
            this.logger.debug('HTTP GET Response', { url, status: response.status });
            return response.data;
        } catch (error) {
            this.logger.error('HTTP GET request failed', error as Error, {
                url,
                status: (error as AxiosError).response?.status,
            });
            throw error;
        }
    }

    async post<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
        try {
            this.logger.debug('HTTP POST Request', { url });
            const response = await this.client.post<T>(url, data, config);
            this.logger.debug('HTTP POST Response', { url, status: response.status });
            return response.data;
        } catch (error) {
            this.logger.error('HTTP POST request failed', error as Error, {
                url,
                status: (error as AxiosError).response?.status,
            });
            throw error;
        }
    }

    async put<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
        try {
            this.logger.debug('HTTP PUT Request', { url });
            const response = await this.client.put<T>(url, data, config);
            this.logger.debug('HTTP PUT Response', { url, status: response.status });
            return response.data;
        } catch (error) {
            this.logger.error('HTTP PUT request failed', error as Error, {
                url,
                status: (error as AxiosError).response?.status,
            });
            throw error;
        }
    }

    async patch<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
        try {
            this.logger.debug('HTTP PATCH Request', { url });
            const response = await this.client.patch<T>(url, data, config);
            this.logger.debug('HTTP PATCH Response', { url, status: response.status });
            return response.data;
        } catch (error) {
            this.logger.error('HTTP PATCH request failed', error as Error, {
                url,
                status: (error as AxiosError).response?.status,
            });
            throw error;
        }
    }
}
