import m from 'mithril';

import './GroupSection.css';

//components
import QuestionCard from '../QuestionCard/QuestionCard';

module.exports = {
    view: vnode => {
        const { title, questions, groupId } = vnode.attrs;

        const questionsTitle = questions.filter(question => question.section === title.title);
        return (
            <div class='groupSection'>
                <div class='grpupSection__header'>{title.title}</div>
                <div class='groupSection__wrapper'>
                    {questionsTitle.map(question => {
                        return (<QuestionCard
                            route={'/question/' + groupId + '/'}
                            question={question}
                            key={question.questionId}
                        />)
                    })}
                </div>
            </div>)
    }
}