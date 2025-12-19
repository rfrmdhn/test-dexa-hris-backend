export const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
} as const;
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
export function buildDateRangeFilter(
  startDate?: string,
  endDate?: string,
): { gte?: Date; lte?: Date } | undefined {
  if (!startDate && !endDate) return undefined;
  const filter: { gte?: Date; lte?: Date } = {};
  if (startDate) filter.gte = new Date(startDate);
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    filter.lte = end;
  }
  return filter;
}
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}
export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): { data: T[]; meta: PaginationMeta } {
  return {
    data,
    meta: buildPaginationMeta(total, page, limit),
  };
}
