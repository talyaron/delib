import m from 'mithril';

import './GroupSection.css';

//components
import QuestionCard from '../QuestionCard/QuestionCard';

module.exports = {
    view: vnode => {
        const { title, questions, groupId } = vnode.attrs;
        let questionsTitle = [];
        if (title === false) {
            questionsTitle = questions
        } else {
            questionsTitle = questions.filter(question => question.section === title.title);
        }
        return (
            <div class='groupSection'>
                <h3 class='grpupSection__header'>{title?title.title:'Unsorted'}</h3>
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