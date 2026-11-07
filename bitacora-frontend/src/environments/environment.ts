const host = window.location.hostname;
const isLocal = host === 'localhost' || host === '127.0.0.1' || /^192\.168\./.test(host);

export const environment = {
  apiUrl: isLocal ? `http://${host}:3000` : 'https://api.tudominio.com',
  firebase: {
    apiKey: 'AIzaSyDtlihxe1m6VUQCScQnht7zsg_w7jWguZ4',
    authDomain: 'bitacora-platform.firebaseapp.com',
    projectId: 'bitacora-platform',
    appId: '1:587430868360:web:e171c0a974970f9fdb363d',
  },
  whatsappNumber: '5491112345678',
  instagramHandle: 'bitacora.vital',
};
