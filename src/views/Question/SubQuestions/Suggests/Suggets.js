import m from 'mithril'

//components
import Option from './Option/Option';


module.exports = {
    oninit:vnode=>{
        
    },
    view: vnode => {
        
        return (
            <div>
                {vnode.attrs.options.map((option, index) => {
                   
                    return <Option
                        groupId={vnode.attrs.groupId}
                        questionId={vnode.attrs.questionId}
                        subQuestionId={vnode.attrs.subQuestionId}
                        optionId={option.id}
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
        )
    }
}