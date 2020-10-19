const m = require('mithril');
const root = document.body;
import './style.css';

//functions
import './functions/firebase/config';
import './functions/firebase/messaging';
import { onAuth } from './functions/firebase/firebaseAuth';
import { logout } from './functions/firebase/googleLogin';
onAuth();
window.logout = logout;
m.route.prefix('?');

//model
import { EntityModel } from './data/dataTypes';

//dealing with URLs from facebook with %
let nativeURL = window.document.URL;

let decoded1 = decodeURIComponent(nativeURL);
let decoded2 = decodeURIComponent(decoded1);
if(nativeURL !== decoded2){
    window.history.pushState(null, 'test', `/?/${decoded2}`);
    nativeURL = decoded2;
}

//deal with facebook additions of url
if (nativeURL.includes('&')) {
    let indexAnd = nativeURL.indexOf('&');
    let indexQuestion = nativeURL.indexOf('?');   

    nativeURL = nativeURL.slice(indexQuestion + 2, indexAnd);
   
    window.history.pushState(null, 'test', `/?/${nativeURL}`);
    
}

//Views
import Login from "./views/Login/Login";
import LoginGoogle from "./views/Login/LoginGoogle";
import Logout from './views/Logout/Logout';
import Groups from "./views/Groups/Groups";
import GroupPage from './views/GroupPage/GroupPage';
import Question from './views/Question/Question';
import QuestionEdit from './views/QuestionEdit/QuestionEdit';
import ChatPage from './views/ChatPage/ChatPage';
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
    "/group-chat/:id":GroupPage,
    "/newgroup": NewGroupPage,
    "/editgroup/:id":EditGroupPage,
    '/question/:groupId/:questionId': Question,
    '/question-chat/:groupId/:questionId': Question,
    "/questionEdit/:groupId/:questionId": QuestionEdit,
    '/optionchat/:groupId/:questionId/:subQuestionId/:optionId': ChatPage,
    "/subquestions/:groupId/:questionId/:subQuestionId": SubQuestionsPage,
    "/subquestions-chat/:groupId/:questionId/:subQuestionId": SubQuestionsPage,
    "/option/:groupId/:questionId/:subQuestionId/:optionId":OptionPage,
    "/option-chat/:groupId/:questionId/:subQuestionId/:optionId":OptionPage,
    "/edit":Edit,
    '/unauthorized':UnAuthorized,
    "/feed":FeedPage,
    "/chatfeed":ChatFeed


})


