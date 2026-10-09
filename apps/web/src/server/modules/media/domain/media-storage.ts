export interface MediaStorage {
  write(key: string, bytes: Uint8Array): Promise<string>;
  read(key: string): Promise<Uint8Array>;
  remove(key: string): Promise<void>;
}
