import i18next from 'i18next';

class I18n {
  constructor() {
    this.i18next = i18next;
  }

  init() {
    this.i18next.init({
      lng: navigator.language,
      fallbackLng: 'es-ES',
      supportedLngs: ['es', 'en'],
      nonExplicitSupportedLngs: true,
      debug: true,
      resources: {
        es: {
          translation: {
            key: 'hello world',
          },
        },
      },
    });
  }

  get(key) {
    return this.i18next.t(key);
  }
}

export default I18n;
