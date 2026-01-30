import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationWithSortDto } from '../../../common/dto/pagination.dto';

/**
 * Search and filter DTO for certificates
 */
export class SearchCertificateDto extends PaginationWithSortDto {
    @ApiPropertyOptional({
        description: 'Filter by certificate status',
        enum: ['active', 'revoked', 'expired'],
        example: 'active',
    })
    @IsOptional()
    @IsEnum(['active', 'revoked', 'expired'])
    status?: 'active' | 'revoked' | 'expired';

    @ApiPropertyOptional({
        description: 'Filter by issuer name',
        example: 'University of Example',
    })
    @IsOptional()
    @IsString()
    issuer?: string;

    @ApiPropertyOptional({
        description: 'Filter by recipient name',
        example: 'John Doe',
    })
    @IsOptional()
    @IsString()
    recipient?: string;

    @ApiPropertyOptional({
        description: 'Filter certificates issued after this date (ISO 8601)',
        example: '2024-01-01T00:00:00Z',
    })
    @IsOptional()
    @IsDateString()
    issuedAfter?: string;

    @ApiPropertyOptional({
        description: 'Filter certificates issued before this date (ISO 8601)',
        example: '2024-12-31T23:59:59Z',
    })
    @IsOptional()
    @IsDateString()
    issuedBefore?: string;
}
