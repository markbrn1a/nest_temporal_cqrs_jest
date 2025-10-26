export abstract class Entity<T> {
  constructor(protected readonly id: T) {}

  public getId(): T {
    return this.id;
  }

  public equals(entity?: Entity<T>): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }

    if (this === entity) {
      return true;
    }

    return this.id === entity.id;
  }
}
