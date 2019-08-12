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
import Logout from './views/Logout/Logout';
import Groups from "./views/Groups/Groups";
import GroupPage from './views/GroupPage/GroupPage';
import Question from './views/Question/Question';
import QuestionEdit from './views/QuestionEdit/QuestionEdit';
import ChatPage from './views/ChatPage/ChatPage';

m.route(root, "/splash", {
    "/splash": Login,
    "/logout": Logout,
    "/groups": Groups,
    "/group/:id": GroupPage,
    '/question/:groupId/:id': Question,
    "/questionEdit/:groupId/:questionId": QuestionEdit,
    '/optionchat/:groupId/:questionId/:subQuestionId/:optionId': ChatPage

})


