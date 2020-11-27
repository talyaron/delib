import m from 'mithril';
import './Description.css';

//functions
import { changeTextToArray } from '../../../functions/general';
import {updateOptionDescription} from '../../../functions/firebase/set/set';


//data
import store from '../../../data/store'

module.exports = {
    oninit: vnode => {
        const { description } = vnode.attrs;
        vnode.state = { 
            edit: true,
            description
        }
    },
    view: vnode => {

        const { description, creatorId } = vnode.attrs.option;
        console.log(creatorId);
        const descriptionParagraphs = changeTextToArray(description);
        console.log(descriptionParagraphs);
        return (
            <div class='description'>
                <h1>הסבר</h1>
                {vnode.state.edit ?
                    <textarea class='inputGeneral' defaultValue={description} onkeyup={e=>handleEditDescription(e, vnode)}/>
                    :
                    <div class='description__text'>
                        {
                            descriptionParagraphs.map((paragaph, index) => {
                                return (<p key={index}>{paragaph}</p>)
                            })
                        }

                    </div>


                }
                {creatorId === store.user.uid ?
                    <div class='buttonsBox'>
                        <div class='buttons buttonOutlineGray' onclick={()=>{handleEditSave(vnode)}}>
                            {vnode.state.edit?'שמירה':'עריכה'}
                        </div>
                    </div>
                    : null

                }
            </div>
        )
    }
}

function handleEditDescription(e, vnode){
    vnode.state.description = e.target.value;
}
function handleEditSave(vnode){

    const {groupId, questionId, subQuestionId, optionId} = vnode.attrs.option;

    updateOptionDescription({groupId, questionId, subQuestionId, optionId}, vnode.state.description)
    vnode.state.edit = !vnode.state.edit
}
