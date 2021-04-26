import m from 'mithril';
import {get} from 'lodash';
import './DocumentCard.css';

//data
import store from '../../../../data/store';

//functions
import { listenToTopOption } from '../../../../functions/firebase/get/getOptions';


module.exports = {
    oninit:vnode=>{
        const {groupId,questionId, subQuestionId} = vnode.attrs;
        listenToTopOption({groupId,questionId, subQuestionId})
    },
    
    view: vnode => {
        const {subQuestion} = vnode.attrs;
        
		const option = get(store.selectedOption, `[${subQuestion.subQuestionId}]`,{title:'אין עדיין תשובה'})
        

        return(
            <div class='documentCard'>
                <p>{subQuestion.title}</p>
                <p>{option.title}</p>
            </div>
        )
    }
}
