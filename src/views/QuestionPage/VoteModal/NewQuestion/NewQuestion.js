import m from 'mithril';
import './NewQuestion.css'

//functions
import { uniqueId } from '../../../../functions/general';

module.exports = {

    oninit: vnode => {
        vnode.state = {
            options: [{ title: 'בעד', description: '', optionId: uniqueId() }, { title: 'נגד', description: '', optionId: uniqueId() }],
            addOption: true
        }
    },
    view: vnode => {


        return (
            <div class='newQuestion'>
                <div class='newQuestion__options'>
                    {vnode.state.options.map(option => {
                        return (<input type='text' class='inputGeneral' defaultValue={option.title} />)
                    })

                    }
                </div>
                {vnode.state.addOption ? <div class='newQuestion__addOption'>
                    <div class='buttons buttons--small' onclick={() => addOption(vnode)}>
                        הוספת אפשרות הצבעה
                        </div>
                    </div>
                    : null
                }
                
            </div>
        )

    }
}

function addOption(vnode) {
    if (vnode.state.options.length < 9) {
        vnode.state.options.push({ title: '', description: '', optionId: uniqueId() })
    } else {
        vnode.state.addOption = false
    }
}