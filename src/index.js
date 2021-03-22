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
import store from './data/store';

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
            console.info('sw.js was registerd');
          
            registration.addEventListener('updatefound', () => {
                // If updatefound is fired, it means that there's
                // a new service worker being installed.
                console.info('new service worker being installed')
                var installingWorker = registration.installing;
                console.info('A new service worker is being installed:',
                    installingWorker);

                // You can listen for changes to the installing service worker's
                // state via installingWorker.onstatechange
            });
        })
        .catch( error=> {
            console.error('Service worker registration failed:', error);
        });
} else {
    console.error('Service workers are not supported.');
}

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
console.log('can install!')
    console.log('beforeinstallprompt')
    // Stash the event so it can be triggered later.
    store.deferredPrompt = e;
    m.redraw();
   
   
    
  });



//Views
import Login from "./views/Login/Login";
import LoginGoogle from "./views/Login/LoginGoogle";
import Logout from './views/Logout/Logout';
import Groups from "./views/Groups/Groups";
import GroupPage from './views/GroupPage/GroupPage';
import Question from './views/QuestionPage/QuestionPage';
import QuestionEdit from './views/QuestionEdit/QuestionEdit';
import Reactions from './views/Commons/Reactions/Reactions';

import SubQuestionsPage from './views/SubQuestionsPage/SubQuestionPage';
import Edit from './views/Commons/Edit/Edit';
import NewGroupPage from './views/Groups/NewGroupPage/NewGroupPage';
import EditGroupPage from './views/GroupPage/EditGroupPage/EditGroupPage';
import UnAuthorized from './views/UnAuthorized/UnAuthorized';
import ChatFeed from './views/ChatFeed/ChatFeed';
import OptionPage from './views/OptionPage/OptionPage';
import FeedPage from './views/FeedPage/FeedPage';


console.log('index v2:', m.route.get())

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
    "/reactions/:groupId/:questionId":Reactions,
    "/questionEdit/:groupId/:questionId": QuestionEdit,
    "/subquestions-chat/:groupId/:questionId/:subQuestionId": SubQuestionsPage,
    "/subquestions/:groupId/:questionId/:subQuestionId/:orderBy": SubQuestionsPage,
    "/subquestions/:groupId/:questionId/:subQuestionId": SubQuestionsPage,
    "/option/:groupId/:questionId/:subQuestionId/:optionId": OptionPage,
    "/option-chat/:groupId/:questionId/:subQuestionId/:optionId": OptionPage,
    "/edit": Edit,
    '/unauthorized': UnAuthorized,
    "/feed": FeedPage,
    "/chatfeed": ChatFeed
})


