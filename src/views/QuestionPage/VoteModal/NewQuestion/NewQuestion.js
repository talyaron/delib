import m from 'mithril';
import './NewQuestion.css'

//functions
import { uniqueId } from '../../../../functions/general';

const startOptions = [{ title: 'בעד', description: '', optionId: uniqueId() }, { title: 'נגד', description: '', optionId: uniqueId() }];

module.exports = {

   

    oninit: vnode => {

        const {vsp} = vnode.attrs;

        vnode.state = {
            options:startOptions ,
            addOption: true
        };

        if(vsp.options.length === 0) vsp.options = startOptions
    },
    view: vnode => {
        const {vsp} = vnode.attrs;

        return (
            <div class='newQuestion'>
                <div class='newQuestion__options'>
                    {vnode.state.options.map((option, index) => {
                        return (<input type='text' class='inputGeneral' defaultValue={option.title} onkeyup={e=>{handleOption(e,index, vsp)}} />)
                    })

                    }
                </div>
                {vnode.state.addOption ? <div class='newQuestion__addOption'>
                    <div class='buttons buttons--small' onclick={() => addOptionInputField(vnode)}>
                        הוספת אפשרות הצבעה
                        </div>
                    </div>
                    : null
                }
                
            </div>
        )

    }
}

function addOptionInputField(vnode) {
    if (vnode.state.options.length < 9) {
        vnode.state.options.push({ title: '', description: '', optionId: uniqueId() })
    } else {
        vnode.state.addOption = false
    }
}

function handleOption(e,index, vsp){
    console.log( e.target.value)
    vsp.options[index] = {title:e.target.value} 
    console.log(vsp.options)
}