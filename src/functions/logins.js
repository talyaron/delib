import m from 'mithril';
import store from '../data/store';

function restrictedPage(URLPath) {
    //check if user is logged-in and has permission to view the page

    //check if user is logged-in, else redirect to login
    if (store.user.hasOwnProperty('isAnonymous')) {
        // if (store.user.isAnonymous) {
        //     redirectToLogin(URLPath);
        //     return false
        // } else {
            return true;
        // }
    } else {
        redirectToLogin();
        return false;
    }
}

function redirectToLogin(URLPath) {
    store.lastPage = URLPath;
    m.route.set('/login');
}

module.exports = { restrictedPage }