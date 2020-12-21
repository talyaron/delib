import m from 'mithril';
import './Options.css';

//components
import Option from './Option/Option';


module.exports = {
    oninit: vnode => {

    },
    view: vnode => {
        const{groupId, questionId, subQuestionId} = vnode.attrs;
      
        return (
            <div class={vnode.attrs.isAlone ? 'optionsWrapper optionsWrapper--alone' : 'optionsWrapper'}>
                <div class='optionsWrapperInner'>
                    {vnode.attrs.options.map((option, index) => {

                        return <Option
                            ids={{groupId, questionId, subQuestionId, optionId: option.id}}
                            creatorName={option.creatorName}
                            creatorId={option.creatorId}
                            title={option.title}
                            description={option.description}
                            totalVoters={option.totalVoters}
                            consensusPrecentage={option.consensusPrecentage}
                            messagesCounter={option.numberOfMessages}
                            more={option.more}
                            key={option.id}
                        />
                    })
                    }
                </div>
            </div>
        )
    }
}