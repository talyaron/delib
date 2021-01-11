import m from 'mithril';
import './Votes.css'


//components
import Option from './Option/Option';

//functions




module.exports = {
    oninit: vnode => {
        vnode.state = { votes: {} }

    },
    onbeforeupdate: vnode => {

    },
    view: vnode => {
        const { options } = vnode.attrs;
        console.log(options)

        return (
            <div class='votes'>
                {options.map(option => {
                    return (<Option option={option} />)
                })
                }
            </div>
        )
    }
}