import m from 'mithril';

import './GroupSection.css';

//functions
import { updateGroupSection } from '../../../functions/firebase/set/setGroup'

//components
import QuestionCard from '../QuestionCard/QuestionCard';

module.exports = {
    oninit: vnode => {
        vnode.state = { droped: false, over: false }
    },
    view: vnode => {
        const { over } = vnode.state;
        const { title, questions, groupId } = vnode.attrs;
        console.log(title)
        let questionsTitle = [];
        if (title === false) {
            questionsTitle = questions.filter(question => question.section === undefined);
        } else {

            questionsTitle = questions.filter(question => question.section === title.groupTitleId);
            // questionsTitle = []

        }
        return (
            <div class={over ? 'groupSection groupSection--over' : 'groupSection'} ondragover={e => handleDragOver(e, vnode)} ondragleave={e => handleDragLeave(e, vnode)} ondrop={e => handleDrop(e, vnode)}>
                <h3 class='grpupSection__header'>{title ? title.title : 'Unsorted'}</h3>
                <div class='groupSection__wrapper'>
                    {questionsTitle.map(question => {
                        return (<QuestionCard
                            route={'/question/' + groupId + '/'}
                            question={question}
                            key={question.questionId}
                        />)
                    })}
                </div>
            </div>)
    }
}

function handleDragOver(e, vnode) {
    e.preventDefault();
    vnode.state.over = true
}

function handleDragLeave(e, vnode) {
    vnode.state.over = false
}

function handleDrop(e, vnode) {
    try {
        const { groupId, title } = vnode.attrs;
        const draggedId = e.dataTransfer.getData("text");
        console.log(draggedId);

        console.log(title)

        //move in DB to element

        updateGroupSection(groupId, draggedId, title.groupTitleId);
        vnode.state.over = false;

    } catch (e) {
        console.error(e)
    }
}