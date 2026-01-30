// Base DTO
export * from './base.dto';

// Pagination DTOs
export * from './pagination.dto';

// Response DTOs
export class ListResponseDto<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    skip: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
  path: string;
  message: string;
}

export class ErrorResponseDto {
  errorCode: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  path: string;
  correlationId?: string;
}
