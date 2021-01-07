import m from 'mithril';
import './AddPanel.css'

module.exports = {
    view: vnode => {

        const {isOpen, vsp} = vnode.attrs;
        return (
            <div class={isOpen?'addPanel addPanel--open':'addPanel addPanel--close'}>
                <h2>הוספת שאלה חדשה</h2>
                <div class='addPanel_newQuestions'>
                    <div onclick={()=>{vsp.openVote = true;vsp.openAddPanel= false}}>
                        <div class='addPanel__suggestions'>
                            <img src='img/votes.svg' alt='votes' />
                        </div>
                        <p>הצבעה</p>
                    </div>
                    <div onclick={()=>{vsp.modalSubQuestion = { isShow: true, new: true, numberOfSubquestions: vsp.subQuestions.length }; vsp.openAddPanel= false}}>
                        <div class='addPanel__votes'>
                            <img src='img/suggestions.svg' alt='add suggestions' />
                        </div>
                        <p>הצעות</p>
                    </div>
                </div>
            </div>
        )
    }
}
