import m from 'mithril';
import store from '../../data/store';

module.exports = {
    oninit:vnode=>{
        //get user before login to page
        store.lastPage = `/subquestions/${vnode.attrs.groupId}/${vnode.attrs.questionId}/${vnode.attrs.subQuestionId}`;
        sessionStorage.setItem('lastPage', store.lastPage);
    },
    view:vnode=>{
        return(<div>sub question</div>)
    }
}