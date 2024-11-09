const prefixFileUrlWithBackendUrl = (fileURL?: string): string | undefined => {
  return !!fileURL && fileURL.startsWith('/') ? `${(<any>window.strapi).backendURL}${fileURL}` : fileURL;
};

export { prefixFileUrlWithBackendUrl };
