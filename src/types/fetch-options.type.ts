'use strict'

export interface FetchOptionsProps {
  filters?: Record<string, unknown>;
  populate?: string | string[] | Record<string, unknown>;
  sort?: string | string[];
  pagination?: {
    page?: number;
    pageSize?: number;
  };
  locale?: string;
}
