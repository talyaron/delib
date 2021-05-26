import m from 'mithril';
import Sortable from "sortablejs";
import './Document.css'

import { get } from 'lodash';

//modal
import store from '../../../data/store';

//functions
import { updateSubQuestionToDoc, reorderSubQuestionsInDocument } from '../../../functions/firebase/set/setSubQuestions';
import { listenToSentences } from '../../../functions/firebase/get/getDocument';

//components
import DocumentCard from './DocumentCard/DocumentCard';
import Sentence from './Sentence/Sentence';
import DocMenu from './DocMenu/DocMenu';

module.exports = {
    oninit: vnode => {
        const { groupId, questionId } = vnode.attrs;
        vnode.state = { over: false, sortable: false, docElements: [] }
        listenToSentences({ groupId, questionId })
    },
    oncreate: vnode => {
        const { groupId, questionId } = vnode.attrs;
        let sortHeaders = document.getElementById("document__wrapper");

        let sortHeadersObj = Sortable.create(sortHeaders, {
            animation: 150,
            handle: '.documentCard__handle',
            onStart: evt => {
                vnode.state.sortable = true
            },
            onEnd: evt => {
                //set order to DB
                const elements = [...evt.target.children];

                elements.map((elm, i) => {
                    console.dir(elm.dataset.id)

                    reorderSubQuestionsInDocument({ groupId, questionId, elmId: elm.dataset.id, type: elm.dataset.type }, i)
                });
                vnode.state.sortable = false
            }
        });
    },
    onbeforeupdate: vnode => {
        const { subQuestions, questionId } = vnode.attrs;
        const sentences = get(store.documents, `[${questionId}]`, [])
        let tmpElements = [...subQuestions, ...sentences];


        vnode.state.docElements = concatinateSubQuestionsAndSentences(tmpElements)

    },
    view: vnode => {
        const { carouselColumn, groupId, questionId } = vnode.attrs;
        const { over } = vnode.state;



        return (<div class={carouselColumn ? 'carousel__col document' : 'document'}
            ondragover={e => handleDragOver(e, vnode)}
            ondragleave={e => handleDragLeave(e, vnode)}
            ondrop={e => handleDrop(e, vnode)}
            >

            <div class={over ? 'document__main document__main--over' : 'document__main'}>
                <DocMenu groupId={groupId} questionId={questionId} />
                <div class='document__wrapper' id='document__wrapper'>
                    {vnode.state.docElements.map((elm, index) => {
                        const id = elm.subQuestionId || elm.sentenceId;

                        if ('subQuestionId' in elm) return <DocumentCard key={id} subQuestion={elm} groupId={groupId} questionId={questionId} subQuestionId={elm.subQuestionId} order={index} />
                        else return <Sentence key={id} sentence={elm} groupId={groupId} questionId={questionId} order={index} />






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


        const { groupId, questionId } = vnode.attrs;
        const subQuestionId = e.dataTransfer.getData("text");

        //move in DB to element
        if (!vnode.state.sortable) {
            updateSubQuestionToDoc({ groupId, questionId, subQuestionId });
        }
        vnode.state.over = false;

    } catch (e) {
        console.error(e)
    }
}

function concatinateSubQuestionsAndSentences(elements) {

    elements = elements.sort((a, b) => a.order - b.order);
   
    return elements;
}