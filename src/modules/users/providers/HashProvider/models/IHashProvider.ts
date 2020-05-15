export default interface IHashProvider {
  generateHash(payload: string): Promise<string>;
  compareHash(payload: string, hashe: string): Promise<boolean>;
}
