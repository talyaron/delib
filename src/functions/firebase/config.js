import config from '../../../configKey';

firebase.initializeApp(config);
const DB = firebase.firestore();
// window.db = DB;
DB.settings({});

module.exports = DB;