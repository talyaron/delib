const m = require('mithril');
const root = document.body;
import './style.css';

//functions
import './functions/firebase/config';
import { onAuth } from './functions/firebase/firebaseAuth';
import { logout } from './functions/firebase/googleLogin';
onAuth();
window.logout = logout;
m.route.prefix('?')

//Views
import Login from "./views/Login/Login";
import LoginGoogle from "./views/Login/LoginGoogle";
import Logout from './views/Logout/Logout';
import Groups from "./views/Groups/Groups";
import GroupPage from './views/GroupPage/GroupPage';
import Question from './views/Question/Question';
import QuestionEdit from './views/QuestionEdit/QuestionEdit';
import ChatPage from './views/ChatPage/ChatPage';
import SubQuestionsPage from './views/SubQuestionsPage/SubQuestionsPage';
import Edit from './views/Commons/Edit/Edit';



let nativeURL = window.document.URL;
//deal with facebook additions of url
if (nativeURL.includes('&')) {
    let indexAnd = nativeURL.indexOf('&');
    let indexQuestion = nativeURL.indexOf('?');

    nativeURL = nativeURL.slice(indexQuestion + 2, indexAnd);

    window.history.pushState(null, 'test', `/?/${nativeURL}`);

}



m.route(root, "/login", {
    "/login": Login,
    "/logingoogle": LoginGoogle,
    "/logout": Logout,
    "/groups": Groups,
    "/group/:id": GroupPage,
    '/question/:groupId/:questionId': Question,
    "/questionEdit/:groupId/:questionId": QuestionEdit,
    '/optionchat/:groupId/:questionId/:subQuestionId/:optionId': ChatPage,
    "/subquestions/:groupId/:questionId/:subQuestionId": SubQuestionsPage,
    "/edit":Edit

})


