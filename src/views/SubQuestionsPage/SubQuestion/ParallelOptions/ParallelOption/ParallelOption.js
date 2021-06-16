import m from 'mithril';
import './dist/ParallelOption.css';

module.exports = {
    view: vnode => {
        const { option } = vnode.attrs;
        console.log(option)
        return (<div class='parallelOption'>
            <div class='parallelOption__confirm'>like</div>
            <div class='parallelOption__info'>
                <div class='parallelOption__title'>{option.title}</div>
                {option.description?<div class='parallelOption__description'>{option.description}</div>:null}
            </div>
        </div>)
    }
}