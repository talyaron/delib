import config from './configKey';



firebase.initializeApp(config);
const DB = firebase.firestore();
const storage = firebase.storage();
// window.db = DB;
DB.settings({});

module.exports = {DB,storage};