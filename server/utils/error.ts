type ErrorPayload =
  | {
      [key: string]: any;
    }
  | undefined;

interface IPluginError extends Error {
  status: number;
  payload: ErrorPayload;
}

export default class PluginError extends Error implements IPluginError {
  status: number;
  payload: ErrorPayload;

  constructor(
    status: number,
    message: string,
    payload: ErrorPayload = undefined
  ) {
    super();
    this.name = "Strapi:Plugin:Comments";
    this.status = status || 500;
    this.message = message || "Internal error";
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
