import m from 'mithril';
import './dist/ParallelOptions.css';

//components
import ParallelOption from './ParallelOption/ParallelOption';

module.exports = {
    view: vnode => {
        const { options } = vnode.attrs;

        return (<div class='parallelOptions'>
            {options.map(option => {
             
                return (<ParallelOption key={option.optionId} option={option}/>)
            })}
        </div>)
    }
}