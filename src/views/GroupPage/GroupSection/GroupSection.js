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
        const { section, questions, groupId } = vnode.attrs;
        console.log(section)
        let questionsTitle = [];
        if (section === undefined) {
            questionsTitle = questions.filter(question => question.section === undefined);
        } else {

            questionsTitle = questions.filter(question => question.section === section.groupTitleId);
            // questionsTitle = []

        }
        return (
            <div class={over ? 'groupSection groupSection--over' : 'groupSection'} ondragover={e => handleDragOver(e, vnode)} ondragleave={e => handleDragLeave(e, vnode)} ondrop={e => handleDrop(e, vnode)}>
                <h3 class='grpupSection__header'>{section ? section.title : 'Unsorted'}</h3>
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
        const { groupId, section } = vnode.attrs;
        const draggedId = e.dataTransfer.getData("text");
   



        //move in DB to element

        updateGroupSection(groupId, draggedId, section.groupTitleId);
        vnode.state.over = false;

    } catch (e) {
        console.error(e)
    }
}