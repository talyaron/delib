import m from 'mithril';
import './SubItems.css';
import SubItem from './SubItem';
import settings from '../../../data/settings';
import store from '../../../data/store';





module.exports = {

    view: vnode => {
        return (
            <div class='questionSection'>
                <div class='questionSectionTitle questions' style={`background:${vnode.attrs.titleColor}`}>{vnode.attrs.subItemsTitle}</div>
                <div class='questionSectionFooter'>
                    {
                        vnode.attrs.subItems.map(subItem => {

                            let userRole = false;

                            if (subItem.roles.hasOwnProperty(store.user.uid)) {
                                userRole = subItem.roles[store.user.uid];

                                if (settings.roles.subQuestions.write[userRole]) {
                                    userRole = true
                                } else {
                                    userRole = false
                                }
                            }

                            return <SubItem
                                subItemsType={vnode.attrs.subItemsType}
                                title={subItem.title}
                                mainColor={vnode.attrs.mainColor}
                                description={subItem.description}
                                author={subItem.author}
                                support={subItem.support}
                                questionId={subItem.id}
                                groupId={vnode.attrs.groupId}
                                questionId={vnode.attrs.questionId}
                                subQuestionId={subItem.id}
                                isEditable={userRole}
                                subAnswers={vnode.attrs.subAnswers[subItem.id]}
                                key={subItem.id}

                            />
                        })
                    }
                    <div class='buttons questionSectionAddButton' onclick={() => { openNewQuestion(vnode) }}>{vnode.attrs.addTitle}</div>

                </div>
            </div>
        )
    }
}

function openNewQuestion(vnode) {
    vnode.attrs.questionVnode.state.showModal = {
        isShow: true,
        which: vnode.attrs.subItemsType,
        title: vnode.attrs.addTitle
    }
}

