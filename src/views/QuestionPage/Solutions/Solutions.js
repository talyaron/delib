import m from 'mithril';
import {get} from 'lodash';

//data
import store from '../../../data/store';
import { VOTES, SUGGESTIONS, PARALLEL_OPTIONS } from '../../../data/evaluationTypes';

module.exports = {
    view: vnode => {
        const { processType, title, subQuestionId } = vnode.attrs;
       


        switch (processType) {
            case VOTES:
                return (<div class='subQuestionSolution__text'>
                    <h1>{title}</h1>
                    <p>יש להיכנס כדי לראות תוצאות</p>
                </div>);
            case SUGGESTIONS:

                const option = get(store.selectedOption, `[${subQuestionId}]`, { title: 'אין עדיין תשובה' });

                return (
                    <div class='subQuestionSolution__text'>
                        <h1>{title}</h1>
                        <p>{option.title}</p>
                    </div>
                );
            case PARALLEL_OPTIONS:
                const options = get(store.subQuestionOptionsConfirmed, `[${subQuestionId}]`, []);
            

                return (
                    <div class='subQuestionSolution__text'>
                        <h1>{title}</h1>
                        {options.map(option => {
                            return (<p>
                               <img src='img/check_gray.svg'/> {option.title}
                            </p>)
                        })}
                    </div>
                );
            default:
                return (<div class='subQuestionSolution__text'>
                    <h1>{title}</h1>
                    <p>יש להיכנס כדי לראות תוצאות</p>
                </div>);


        }
    }
}