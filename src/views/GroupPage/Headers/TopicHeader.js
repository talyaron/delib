import m from 'mithril'

import { editGroupTitle } from '../../../functions/firebase/set/setGroup';



module.exports = {
    oninit: vnode => {
        const { title } = vnode.attrs;

        vnode.state = {
            isEdit: false,
            text: title,
            timer:0
        }
    },
    view: vnode => {

        const { section, groupId, groupTitleId } = vnode.attrs;

        if (!vnode.state.isEdit) {
            return (<div ondblclick={() => { vnode.state.isEdit = true }} ontouchstart={()=>handleTouchStart(vnode)} ontouchend={()=>handleTouchEnd(vnode)}>{section}</div>)
        } else {
            return (
                <div>
                    <div onclick={() => { vnode.state.isEdit = false; editGroupTitle(vnode.state.text, groupId, groupTitleId) }} class='buttons buttons--small'>
                        OK
                    </div>
                    <input type='text' defaultValue={section} onkeyup={e => { vnode.state.text = e.target.value }} />
                </div>
            )
        }


    }
}

function handleTouchStart(vnode){
    console.log('tuch start');
    vnode.state.timer = new Date().getTime()

}

function handleTouchEnd(vnode){
    
    const timeDiffrence = new Date().getTime() - vnode.state.timer;

    console.log('tuch end', timeDiffrence);
    if(timeDiffrence>300){
        vnode.state.isEdit = true
    }

}