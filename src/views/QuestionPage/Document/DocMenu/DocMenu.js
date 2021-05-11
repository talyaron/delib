import m from 'mithril';
import './DocMenu.css';
import {HEADER, PARAGRAPH} from '../Sentence/sentenceTypes';

import { createSentence } from '../../../../functions/firebase/set/setDocument';

module.exports = {
    oninit: vnode => {
        vnode.state = {}
    },
    view: vnode => {

        return (
            <div class='docMenu'>
                <div onclick={()=>{addDocElement(HEADER)}}>H</div>
                <div onclick={()=>{addDocElement(PARAGRAPH)}}>P</div>
            </div>
        )

        function addDocElement(type) {
            try {
                const { groupId, questionId } = vnode.attrs;
                
                if (type !== PARAGRAPH && type !== HEADER) throw new Error('not a correct type');
                
                createSentence({ groupId, questionId }, 'משפט חדש', 'type', -1);
            } catch (e) {
                console.info(type)
                console.error(e)
            }

        }
    }


}


