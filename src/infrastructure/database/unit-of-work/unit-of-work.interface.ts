export const UNIT_OF_WORK = Symbol('UNIT_OF_WORK');

export interface UnitOfWork {
  execute<T>(operation: (uow: UnitOfWorkContext) => Promise<T>): Promise<T>;
}

export interface UnitOfWorkContext {
  // Generic transaction context - repositories are injected by the operation
  [key: string]: any;
}
