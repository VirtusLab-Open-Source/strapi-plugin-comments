import { StrapiContext } from "../@types";

interface EmailOptions {
  to: string[];
  from: string;
  subject: string;
  text: string;
}

const EMAIL_SERVICE_TIMEOUT_MS = 10000;

const getTimeoutPromise = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Email service timeout'));
    }, EMAIL_SERVICE_TIMEOUT_MS);
  });
};

export const emailService = ({ strapi }: StrapiContext) => {
  const plugin = strapi.plugin('email');
  const service = plugin ? plugin.service('email') : undefined;

  return {
    send: async (options: EmailOptions) => {
      if (!service) {
        strapi.log.warn('Email service not found');
        return;
      }

      try {
        return await Promise.race([
          service.send(options),
          getTimeoutPromise(),
        ]);
      } catch (error) {
        strapi.log.error(error);
        throw error;
      }
    },
  };
};