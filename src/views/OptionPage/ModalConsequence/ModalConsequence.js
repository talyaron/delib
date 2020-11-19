import m from 'mithril';
import './ModalConsequence.css';

module.exports = {
    view: vnode => {
        return (
            <div class='modalConsequence__background'>

                <form class='modalConsequence__box' onsubmit={e => handleSubmit(e, vnode)}>
                    <label for='consequence-title'>מה יקרה אם הפתרון יתרחש?</label>
                    <input name='title' id='consequence-title' class='inputGeneral' type='text' placeholder='כותרת' />
                    <textarea name='desciption' placeholder='הסבר' class='inputGeneral inputDescription' />
                    <label for='goodBad' >האם זה טוב או רע?</label>
                    <p class='modalConsequence__goodBad'><span>טוב</span><input id='goodBad' type='range' name='goodBad' min='-50' max='50' step='10' value='0' /><span>רע</span></p>
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

    console.log('handleCancel')
    const { pvs } = vnode.attrs;
    pvs.showModal = false;

}

function handleSubmit(e, vnode) {
    e.preventDefault();
    console.log(e)
}