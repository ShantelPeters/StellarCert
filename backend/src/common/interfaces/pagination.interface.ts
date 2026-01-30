/**
 * Pagination metadata interface
 */
export interface PaginationMeta {
    /**
     * Total number of items across all pages
     */
    total: number;

    /**
     * Current page number (1-indexed)
     */
    page: number;

    /**
     * Number of items per page
     */
    limit: number;

    /**
     * Total number of pages
     */
    pages: number;

    /**
     * Whether there is a next page
     */
    hasNext: boolean;

    /**
     * Whether there is a previous page
     */
    hasPrev: boolean;
}

/**
 * Paginated result wrapper
 */
export interface PaginatedResult<T> {
    /**
     * Array of data items for the current page
     */
    data: T[];

    /**
     * Pagination metadata
     */
    meta: PaginationMeta;
}

/**
 * Pagination options for internal use
 */
export interface PaginationOptions {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
