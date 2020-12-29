import m from 'mithril';
import './ConsequenceTop.css';

//functions
import {calcOpacity, getColorForPercentage} from '../../../../../../functions/general';

module.exports = {
    view: vnode => {
        const {consequence} = vnode.attrs;
        const {groupId, questionId, subQuestionId, optionId} = vnode.attrs.ids;
       

        let color = getColorForPercentage((consequence.evaluationAvg + 1) / 2);
        let opacity = calcOpacity(consequence.truthinessAvg * 100)
        
        return (
            <div
                onclick={() => { m.route.set(`/option/${groupId}/${questionId}/${subQuestionId}/${optionId}`) }}
                class='option__consequnces'
                style={`background:${color}; opacity:${opacity}`}
            >
                {consequence.title}
            </div>
        )

    }
}

