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

let sEnt = new EntityModel('', 'aa', 'aa');
console.dir(sEnt);

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

m.route(root, "/login", {
    "/login": Login,
    "/logingoogle": LoginGoogle,
    "/logout": Logout,
    "/groups": Groups,
    "/group/:id": GroupPage,
    '/question/:groupId/:id': Question,
    "/questionEdit/:groupId/:questionId": QuestionEdit,
    '/optionchat/:groupId/:questionId/:subQuestionId/:optionId': ChatPage,
    "/subquestions/:groupId/:questionId/:subQuestionId": SubQuestionsPage

})


