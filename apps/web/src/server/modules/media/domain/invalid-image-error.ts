export class InvalidImageError extends Error {
  constructor() {
    super("The file is not a supported static image");
    this.name = "InvalidImageError";
  }
}
