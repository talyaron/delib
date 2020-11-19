import m from 'mithril';
import './ModalConsequence.css';

//functions
import { createConsequence } from '../../../functions/firebase/set/set';

//data
import store from '../../../data/store';

module.exports = {
    view: vnode => {
        return (
            <div class='modalConsequence__background'>

                <form class='modalConsequence__box' onsubmit={e => handleSubmit(e, vnode)}>
                    <label for='consequence-title'>מה יקרה אם הפתרון יתרחש?</label>
                    <input name='title' id='consequence-title' class='inputGeneral' type='text' placeholder='כותרת' />
                    <textarea name='description' placeholder='הסבר' class='inputGeneral inputDescription' />
                    <label for='goodBad' >האם זה טוב או רע?</label>
                    <p class='modalConsequence__goodBad'><span>רע</span><input id='goodBad' type='range' name='goodBad' min='-100' max='100' step='10' value='0' /><span>טוב</span></p>
                    <div class='modalConsequence__buttons'>
                        <input type='submit' class='buttons' value='שמירה' />
                        <button onclick={e => handleCancel(e, vnode)} class='buttons buttons--cancel'>ביטול</button>
                    </div>
                </form>

            </div>
        )
    }
}

function handleCancel(e, vnode) {
    e.stopPropagation();
    e.preventDefault();

    const { pvs } = vnode.attrs;
    pvs.showModal = false;

}

function handleSubmit(e, vnode) {
    try {
        e.preventDefault();

        const title = e.target.children.title.value;
        const description = e.target.children.description.value;
        const goodBad = document.getElementById('goodBad').valueAsNumber;


        const { pvs } = vnode.attrs;
        const { option } = pvs;
        const { groupId, questionId, subQuestionId, optionId } = option;
        console.log(store.user)
        createConsequence(groupId, questionId, subQuestionId, optionId, store.user.uid, title, description, goodBad, store.user.name)
        // pvs.showModal = false;
    } catch (e) {
        console.error(e)
    }
}