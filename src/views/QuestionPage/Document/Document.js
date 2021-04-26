import m from 'mithril';
import './Document.css'

//functions
import {updateSubQuestionToDoc} from '../../../functions/firebase/set/setSubQuestions';

//components
import DocumentCard from './DocumentCard/DocumentCard'

module.exports = {
    oninit: vnode => {
        vnode.state = { over: false }
    },
    view: vnode => {
        const { carouselColumn,subQuestions, groupId, questionId} = vnode.attrs;
        const { over } = vnode.state;

        return (<div class={carouselColumn ? 'carousel__col document' : 'document'}
            ondragover={e => handleDragOver(e, vnode)}
            ondragleave={e => handleDragLeave(e, vnode)}
            ondrop={e => handleDrop(e, vnode)}>
            <div class={over ? 'document__main document__main--over' : 'document__main'}>
                Document
                <div class='document__wrapper'>
                    {subQuestions.map(subQuestion=>{
                        return(
                            <DocumentCard key={subQuestion.subQuestionId} subQuestion={subQuestion} groupId={groupId} questionId={questionId} subQuestionId={subQuestion.subQuestionId}/>
                        )
                    })}
                </div>
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


        const { groupId,questionId } = vnode.attrs;
        const subQuestionId = e.dataTransfer.getData("text");

        console.log(subQuestionId)


        //move in DB to element

        updateSubQuestionToDoc({groupId, questionId, subQuestionId});
        vnode.state.over = false;

    } catch (e) {
        console.error(e)
    }
}