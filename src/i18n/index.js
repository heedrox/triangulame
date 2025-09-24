import i18next from 'i18next';
import es from './es';

class I18n {
  constructor () {
    this.i18next = i18next;
  }

  init () {
    this.i18next.init({
      lng: navigator.language,
      fallbackLng: 'es',
      supportedLngs: ['es', 'en'],
      nonExplicitSupportedLngs: true,
      debug: false,
      resources: {
        es,
      },
    });
  }

  get (...data) {
    return this.i18next.t(...data);
  }
}

export default I18n;
