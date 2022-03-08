
interface PluginErrorInterface extends Error {
    status: number
    payload: any
};

export class PluginError extends Error implements PluginErrorInterface {
    status: number
    payload: any

    constructor(status: number, message: string, payload = undefined) { 
        super();
        this.name = 'Strapi:Plugin:Comments'; 
        this.status = status || 500;
        this.message = message || 'Internal error'; 
        this.payload = payload;
     }

     toString(e = this) {
        return `${e.name} - ${e.message}`;
     }

     toJSON() {
        if (this.payload) {
           return {
               name: this.name,
               message: this.message,
               ...(this.payload || {}),
           };
       }
       return this;
    }
}; 