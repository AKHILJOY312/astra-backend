export interface ICounterRepository {
  getNext(key: string): Promise<number>;
}
