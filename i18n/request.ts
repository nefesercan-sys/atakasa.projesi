import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  // Mesajların ana dizindeki messages klasöründe olduğunu varsayıyoruz
  messages: (await import(`../messages/${locale}.json`)).default
}));
