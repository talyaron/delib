import m from 'mithril';
import './Votes.css'


//components
import Option from './Option/Option';

module.exports = {
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