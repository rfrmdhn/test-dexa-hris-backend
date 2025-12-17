/**
 * Shared Query Utilities
 * Consolidates common Prisma query patterns to ensure DRY compliance
 */

/**
 * Standard user select fields (without password)
 */
export const USER_SELECT = {
    id: true,
    email: true,
    name: true,
    role: true,
} as const;

/**
 * Employee select fields (with timestamps)
 */
export const EMPLOYEE_SELECT = {
    ...USER_SELECT,
    createdAt: true,
    updatedAt: true,
} as const;

export function getStartOfDay(date = new Date()): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * Build a Prisma date range filter
 * @param startDate - Optional start date string
 * @param endDate - Optional end date string
 * @returns Prisma date filter object or undefined
 */
export function buildDateRangeFilter(
    startDate?: string,
    endDate?: string
): { gte?: Date; lte?: Date } | undefined {
    if (!startDate && !endDate) return undefined;

    const filter: { gte?: Date; lte?: Date } = {};
    if (startDate) filter.gte = new Date(startDate);
    if (endDate) filter.lte = new Date(endDate);
    return filter;
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Build pagination meta object
 * @param total - Total count of items
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Pagination meta object
 */
export function buildPaginationMeta(
    total: number,
    page: number,
    limit: number
): PaginationMeta {
    return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}

/**
 * Calculate skip value for pagination
 * @param page - Current page (1-indexed)
 * @param limit - Items per page
 * @returns Number of items to skip
 */
export function calculateSkip(page: number, limit: number): number {
    return (page - 1) * limit;
}

/**
 * Build paginated response
 * @param data - Array of items
 * @param total - Total count
 * @param page - Current page
 * @param limit - Items per page
 * @returns Paginated response with data and meta
 */
export function buildPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
): { data: T[]; meta: PaginationMeta } {
    return {
        data,
        meta: buildPaginationMeta(total, page, limit),
    };
}
