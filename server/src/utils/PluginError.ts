export type ErrorPayload = Record<string, any> | undefined;

export default class PluginError extends Error {
  status: number;
  payload: ErrorPayload;

  constructor(
    status: number,
    message: string,
    payload: ErrorPayload = undefined,
  ) {
    super();
    this.name = 'Strapi:Plugin:Comments';
    this.status = status || 500;
    console.log('message', message);
    this.message = message || 'Internal error';
    this.payload = payload;

    Object.setPrototypeOf(this, PluginError.prototype);
  }

  toString(e: PluginError = this): string {
    return `${e.name} - ${e.message}`;
  }

  toJSON() {
    if (this.payload) {
      return {
        ...this.payload,
        name: this.name,
        message: this.message,
      };
    }
    return this;
  }
}