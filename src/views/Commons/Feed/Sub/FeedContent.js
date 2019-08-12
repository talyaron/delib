import m from 'mithril';
import './FeedContent.css';

import { msToTime } from '../../../../functions/general';



module.exports = {

    view: (vnode) => {

        return (

            <div class='feedContent'
                onclick={() => { m.route.set(convertPathToLink(vnode.attrs.data.path)) }}
            >
                <div class='feedContentMessage'>{vnode.attrs.data.message}</div>
                <div class='feedContentName'>
                    {msToTime(vnode.attrs.data.timeSeconds)} {vnode.attrs.data.creatorName} - {vnode.attrs.data.groupName} / {vnode.attrs.data.questionName}  / {vnode.attrs.data.optionName}
                </div>
            </div>

        )
    }
}

//functions
function convertPathToLink(path) {
    let parsedPath = path.split('--');

    //build path acording to group, question, option, messages
    if (parsedPath[parsedPath.length - 1] == 'messages') {
        return `/optionchat/${parsedPath[1]}/${parsedPath[3]}/${parsedPath[5]}/${parsedPath[7]}`;
    } else if (parsedPath[parsedPath.length - 1] == 'questions') {
        return `/question/${parsedPath[1]}/${parsedPath[3]}`;
    } else if (parsedPath[parsedPath.length - 1] == 'groups') {
        return `/group/${parsedPath[1]}`;
    } else {
        return false;
    }


}




