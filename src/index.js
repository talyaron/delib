const m = require('mithril');
const root = document.body;
import './style.css';
import './animations.css';

//functions
import './functions/firebase/config';
import './functions/firebase/messaging';
import { onAuth } from './functions/firebase/firebaseAuth';
import { logout } from './functions/firebase/googleLogin';
import { setBrowserUniqueId } from './functions/general';
onAuth();
window.logout = logout;
m.route.prefix('?');

//model
import { EntityModel } from './data/dataTypes';

//dealing with URLs from facebook with %
let nativeURL = window.document.URL;

let decoded1 = decodeURIComponent(nativeURL);
let decoded2 = decodeURIComponent(decoded1);
if (nativeURL !== decoded2) {
    window.history.pushState(null, 'test', `/?/${decoded2}`);
    nativeURL = decoded2;
}

setBrowserUniqueId()

//deal with facebook additions of url
if (nativeURL.includes('&')) {
    let indexAnd = nativeURL.indexOf('&');
    let indexQuestion = nativeURL.indexOf('?');

    nativeURL = nativeURL.slice(indexQuestion + 2, indexAnd);

    window.history.pushState(null, 'test', `/?/${nativeURL}`);

}

//service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(registration => {
            console.log('sw.js was registerd');
            console.dir(registration)
            registration.addEventListener('updatefound', () => {
                // If updatefound is fired, it means that there's
                // a new service worker being installed.
                console.log('new service worker being installed')
                var installingWorker = registration.installing;
                console.log('A new service worker is being installed:',
                    installingWorker);

                // You can listen for changes to the installing service worker's
                // state via installingWorker.onstatechange
            });
        })
        .catch( error=> {
            console.log('Service worker registration failed:', error);
        });
} else {
    console.log('Service workers are not supported.');
}

//badge
if ('clearAppBadge' in navigator) {
    console.log('clearAppBadge in navigator!');
    const unreadCount = 24;
    navigator.setAppBadge(unreadCount).catch((error) => {

    });
}

//Views
import Login from "./views/Login/Login";
import LoginGoogle from "./views/Login/LoginGoogle";
import Logout from './views/Logout/Logout';
import Groups from "./views/Groups/Groups";
import GroupPage from './views/GroupPage/GroupPage';
import Question from './views/QuestionPage/QuestionPage';
import QuestionEdit from './views/QuestionEdit/QuestionEdit';

import SubQuestionsPage from './views/SubQuestionsPage/SubQuestionPage';
import Edit from './views/Commons/Edit/Edit';
import NewGroupPage from './views/Groups/NewGroupPage/NewGroupPage';
import EditGroupPage from './views/GroupPage/EditGroupPage/EditGroupPage';
import UnAuthorized from './views/UnAuthorized/UnAuthorized';
import ChatFeed from './views/ChatFeed/ChatFeed';
import OptionPage from './views/OptionPage/OptionPage';
import FeedPage from './views/FeedPage/FeedPage';


m.route(root, "/login", {
    "/login": Login,
    "/logingoogle": LoginGoogle,
    "/logout": Logout,
    "/groups": Groups,
    "/group/:id": GroupPage,
    "/group-chat/:id": GroupPage,
    "/newgroup": NewGroupPage,
    "/editgroup/:id": EditGroupPage,
    '/question/:groupId/:questionId': Question,
    '/question-chat/:groupId/:questionId': Question,
    "/questionEdit/:groupId/:questionId": QuestionEdit,
    "/subquestions/:groupId/:questionId/:subQuestionId": SubQuestionsPage,
    "/subquestions-chat/:groupId/:questionId/:subQuestionId": SubQuestionsPage,
    "/option/:groupId/:questionId/:subQuestionId/:optionId": OptionPage,
    "/option-chat/:groupId/:questionId/:subQuestionId/:optionId": OptionPage,
    "/edit": Edit,
    '/unauthorized': UnAuthorized,
    "/feed": FeedPage,
    "/chatfeed": ChatFeed


})


