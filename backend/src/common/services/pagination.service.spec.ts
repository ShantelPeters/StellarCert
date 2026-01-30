import { Test, TestingModule } from '@nestjs/testing';
import { PaginationService } from './pagination.service';
import { SelectQueryBuilder } from 'typeorm';

describe('PaginationService', () => {
    let service: PaginationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PaginationService],
        }).compile();

        service = module.get<PaginationService>(PaginationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('normalizeOptions', () => {
        it('should use default values when no options provided', () => {
            const result = service.normalizeOptions();
            expect(result).toEqual({ page: 1, limit: 10 });
        });

        it('should normalize negative page to 1', () => {
            const result = service.normalizeOptions(-5, 10);
            expect(result.page).toBe(1);
        });

        it('should normalize zero page to 1', () => {
            const result = service.normalizeOptions(0, 10);
            expect(result.page).toBe(1);
        });

        it('should cap limit at maximum (100)', () => {
            const result = service.normalizeOptions(1, 200);
            expect(result.limit).toBe(100);
        });

        it('should normalize negative limit to default', () => {
            const result = service.normalizeOptions(1, -5);
            expect(result.limit).toBe(10);
        });

        it('should accept valid page and limit', () => {
            const result = service.normalizeOptions(5, 20);
            expect(result).toEqual({ page: 5, limit: 20 });
        });
    });

    describe('createMeta', () => {
        it('should create correct metadata for first page', () => {
            const meta = service.createMeta(100, 1, 10);
            expect(meta).toEqual({
                total: 100,
                page: 1,
                limit: 10,
                pages: 10,
                hasNext: true,
                hasPrev: false,
            });
        });

        it('should create correct metadata for middle page', () => {
            const meta = service.createMeta(100, 5, 10);
            expect(meta).toEqual({
                total: 100,
                page: 5,
                limit: 10,
                pages: 10,
                hasNext: true,
                hasPrev: true,
            });
        });

        it('should create correct metadata for last page', () => {
            const meta = service.createMeta(100, 10, 10);
            expect(meta).toEqual({
                total: 100,
                page: 10,
                limit: 10,
                pages: 10,
                hasNext: false,
                hasPrev: true,
            });
        });

        it('should handle partial last page', () => {
            const meta = service.createMeta(95, 10, 10);
            expect(meta).toEqual({
                total: 95,
                page: 10,
                limit: 10,
                pages: 10,
                hasNext: false,
                hasPrev: true,
            });
        });

        it('should handle empty results', () => {
            const meta = service.createMeta(0, 1, 10);
            expect(meta).toEqual({
                total: 0,
                page: 1,
                limit: 10,
                pages: 0,
                hasNext: false,
                hasPrev: false,
            });
        });

        it('should handle single page of results', () => {
            const meta = service.createMeta(5, 1, 10);
            expect(meta).toEqual({
                total: 5,
                page: 1,
                limit: 10,
                pages: 1,
                hasNext: false,
                hasPrev: false,
            });
        });
    });

    describe('paginate', () => {
        let mockQueryBuilder: jest.Mocked<SelectQueryBuilder<any>>;

        beforeEach(() => {
            mockQueryBuilder = {
                alias: 'entity',
                orderBy: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                getCount: jest.fn(),
                getMany: jest.fn(),
            } as any;
        });

        it('should paginate with default options', async () => {
            mockQueryBuilder.getCount.mockResolvedValue(100);
            mockQueryBuilder.getMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);

            const result = await service.paginate(mockQueryBuilder, {
                page: 1,
                limit: 10,
            });

            expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
            expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
            expect(result.data).toHaveLength(2);
            expect(result.meta.total).toBe(100);
            expect(result.meta.pages).toBe(10);
        });

        it('should apply sorting when provided', async () => {
            mockQueryBuilder.getCount.mockResolvedValue(50);
            mockQueryBuilder.getMany.mockResolvedValue([]);

            await service.paginate(mockQueryBuilder, {
                page: 1,
                limit: 10,
                sortBy: 'createdAt',
                sortOrder: 'ASC',
            });

            expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('entity.createdAt', 'ASC');
        });

        it('should calculate correct offset for page 2', async () => {
            mockQueryBuilder.getCount.mockResolvedValue(100);
            mockQueryBuilder.getMany.mockResolvedValue([]);

            await service.paginate(mockQueryBuilder, {
                page: 2,
                limit: 10,
            });

            expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
            expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
        });

        it('should handle empty results', async () => {
            mockQueryBuilder.getCount.mockResolvedValue(0);
            mockQueryBuilder.getMany.mockResolvedValue([]);

            const result = await service.paginate(mockQueryBuilder, {
                page: 1,
                limit: 10,
            });

            expect(result.data).toHaveLength(0);
            expect(result.meta.total).toBe(0);
            expect(result.meta.pages).toBe(0);
            expect(result.meta.hasNext).toBe(false);
            expect(result.meta.hasPrev).toBe(false);
        });

        it('should cap limit at maximum', async () => {
            mockQueryBuilder.getCount.mockResolvedValue(100);
            mockQueryBuilder.getMany.mockResolvedValue([]);

            await service.paginate(mockQueryBuilder, {
                page: 1,
                limit: 200, // Should be capped at 100
            });

            expect(mockQueryBuilder.take).toHaveBeenCalledWith(100);
        });
    });
});
