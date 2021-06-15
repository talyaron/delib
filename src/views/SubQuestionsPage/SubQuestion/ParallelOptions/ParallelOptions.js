import m from 'mithril';
import './dist/ParallelOptions.css';

module.exports = {
    view: vnode => {
        const { options } = vnode.attrs;

        return (<div class='parallelOptions'>
            {options.map(option => {
                console.log(option)
                return (<p>{option.title}</p>)
            })}
        </div>)
    }
}