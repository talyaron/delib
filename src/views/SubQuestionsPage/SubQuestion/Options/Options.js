import m from 'mithril';
import './Options.css';
import lang from '../../../../data/languages';

//components
import OptionCard from './OptionCard/OptionCard';


module.exports = {
    oninit: vnode => {
        vnode.state = {
            orderBy: 'new'
        };
    },
    view: vnode => {
        const { groupId, questionId, subQuestionId, processType } = vnode.attrs;

       

        return (
            <div class='optionsWrapper'>
                <div class='optionsWrapperInner'>
                    {vnode.attrs.options.map((option, index) => {

                        return <OptionCard
                            ids={{ groupId, questionId, subQuestionId, optionId: option.id }}
                            creatorName={option.creatorName}
                            creatorId={option.creatorId}
                            title={option.title}
                            description={option.description}
                            totalVoters={option.totalVoters}
                            consensusPrecentage={option.consensusPrecentage}
                            messagesCounter={option.numberOfMessages}
                            more={option.more}
                            key={option.id}
                            processType={processType}
                        />
                    })
                    }

                </div>

            </div>
        )
    }
}