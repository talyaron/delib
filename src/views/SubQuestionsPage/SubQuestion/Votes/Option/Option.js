import m from 'mithril';
import './Option.css';

//data
import store from '../../../../../data/store';



module.exports = {
    view: vnode => {
        const { option, question, isSelected } = vnode.attrs;
     
        const voters = question.voters || 10000000;


        return (
            <div class='optionVote'>
                <div class='optionVote__percent'>{Math.round((option.votes / voters) * 100) || 0}%</div>
                <div class='optionVote__column' style={`height:${(option.votes / voters) * 100}%`}></div>
                
            </div>
        )
    }
}

