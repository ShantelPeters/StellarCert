import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { PaginatedResult, PaginationMeta, PaginationOptions } from '../interfaces/pagination.interface';

@Injectable()
export class PaginationService {
    /**
     * Default pagination settings
     */
    private readonly DEFAULT_PAGE = 1;
    private readonly DEFAULT_LIMIT = 10;
    private readonly MAX_LIMIT = 100;

    /**
     * Paginate a TypeORM QueryBuilder
     * 
     * @param queryBuilder - TypeORM SelectQueryBuilder to paginate
     * @param options - Pagination options (page, limit, sortBy, sortOrder)
     * @returns Paginated result with data and metadata
     * 
     * @example
     * ```typescript
     * const queryBuilder = this.repository.createQueryBuilder('entity');
     * const result = await this.paginationService.paginate(queryBuilder, {
     *   page: 1,
     *   limit: 10,
     *   sortBy: 'createdAt',
     *   sortOrder: 'DESC'
     * });
     * ```
     */
    async paginate<T extends ObjectLiteral>(
        queryBuilder: SelectQueryBuilder<T>,
        options: PaginationOptions,
    ): Promise<PaginatedResult<T>> {
        // Normalize and validate options
        const page = Math.max(1, options.page || this.DEFAULT_PAGE);
        const limit = Math.min(
            Math.max(1, options.limit || this.DEFAULT_LIMIT),
            this.MAX_LIMIT,
        );

        // Apply sorting if provided
        if (options.sortBy) {
            const alias = queryBuilder.alias;
            const sortField = `${alias}.${options.sortBy}`;
            const sortOrder = options.sortOrder || 'DESC';
            queryBuilder.orderBy(sortField, sortOrder);
        }

        // Get total count before pagination
        const total = await queryBuilder.getCount();

        // Calculate pagination metadata
        const pages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;

        // Apply pagination
        queryBuilder.skip(offset).take(limit);

        // Execute query
        const data = await queryBuilder.getMany();

        // Build metadata
        const meta: PaginationMeta = {
            total,
            page,
            limit,
            pages,
            hasNext: page < pages,
            hasPrev: page > 1,
        };

        return {
            data,
            meta,
        };
    }

    /**
     * Create pagination metadata manually (useful for custom queries)
     * 
     * @param total - Total number of items
     * @param page - Current page number
     * @param limit - Items per page
     * @returns Pagination metadata
     */
    createMeta(total: number, page: number, limit: number): PaginationMeta {
        const pages = Math.ceil(total / limit);

        return {
            total,
            page,
            limit,
            pages,
            hasNext: page < pages,
            hasPrev: page > 1,
        };
    }

    /**
     * Validate and normalize pagination options
     * 
     * @param page - Page number
     * @param limit - Items per page
     * @returns Normalized pagination options
     */
    normalizeOptions(page?: number, limit?: number): { page: number; limit: number } {
        const normalizedPage = (page && page > 0) ? page : this.DEFAULT_PAGE;
        const normalizedLimit = (limit && limit > 0) ? Math.min(limit, this.MAX_LIMIT) : this.DEFAULT_LIMIT;

        return {
            page: normalizedPage,
            limit: normalizedLimit,
        };
    }
}
