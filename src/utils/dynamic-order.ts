import { SelectQueryBuilder } from "typeorm/query-builder/SelectQueryBuilder";

export function applyDynamicOrder(
  query: SelectQueryBuilder<any>, // The TypeORM query builder
  alias: string,                 // The table alias (e.g., 'asset')
  order: any, // The order object (e.g., { created_at: 'DESC' })
  allowedColumns: string[]       // List of allowed columns
): SelectQueryBuilder<any> {
  if (order) {
    const [column, direction]: any[] = Object.entries(order)[0]; // Get the first key-value pair
    if (allowedColumns.includes(column)) {
      return query.orderBy(`${alias}.${column}`, direction.toUpperCase() as 'ASC' | 'DESC');
    } else {
      throw new Error(`Invalid column for ordering: ${column}`);
    }
  }
  return query.orderBy(`${alias}.created_at`, 'DESC'); // Default order
}