import m from 'mithril';
import './Description.css';

//functions
import { changeTextToArray } from '../../../functions/general';
import { updateOptionDescription } from '../../../functions/firebase/set/set';


//data
import store from '../../../data/store'
import { concat } from 'lodash';

let firstDescription = false

module.exports = {
    oninit: async vnode => {

        vnode.state = {
            edit: true,
            description: '',
            addVideo: false,
            videoUrl: false,
            addPicture: true
        }


    },
    onupdate: vnode => {
        const { description } = vnode.attrs.option;

        if (description !== undefined && firstDescription === false) {
            vnode.state.description = description;
            firstDescription = description
        }

    },
    view: vnode => {

        const { description, creatorId, optionId } = vnode.attrs.option;

        const descriptionParagraphs = changeTextToArray(vnode.state.description);
        console.log(descriptionParagraphs)

        return (
            <div class='description'>
                <h1>הסבר</h1>
                {vnode.state.edit ?
                    <textarea class='inputGeneral' defaultValue={description} onkeyup={e => handleEditDescription(e, vnode)} id={`optionDescription${optionId}`} />
                    :
                    <div class='description__text'  >
                        {
                            descriptionParagraphs.map((paragaph, index) => {
                                console.log(paragaph)
                                return (convertParagraphsToVisual(paragaph, index))
                            })
                        }

                    </div>


                }
                {creatorId === store.user.uid ?
                    <div class='buttonsBox'>
                        {vnode.state.edit ? <div class='buttons buttonOutlineGray' onclick={() => { vnode.state.addVideo = true }}>הוספת וידאו</div> : null}
                        <div class='buttons buttonOutlineGray' onclick={() => { handleEditSave(vnode) }}>
                            {vnode.state.edit ? 'שמירה' : 'עריכה'}
                        </div>
                        {vnode.state.edit ? <div class='buttons buttonOutlineGray'>הוספת תמונה</div> : null}
                    </div>
                    : null

                }
                {vnode.state.addVideo ?
                    <div class='addVideo__background'>
                        <div class='addVideo'>
                            <input class='inputGeneral' type='text' oninput={e => { handleInputVideo(e, vnode) }} placeholder='Enter youtube video url' />
                            <div class='buttonsBox'>
                                <div class='buttons buttonOutlineGray' onclick={e => { handleAddVideo(e, vnode) }}>הוספה</div>
                                <div class='buttons buttonOutlineGray' onclick={() => { vnode.state.addVideo = false; vnode.state.edit = false }}>ביטול</div>
                            </div>
                        </div>
                    </div>
                    : null
                }
            </div>
        )
    }
}

function handleEditDescription(e, vnode) {
    vnode.state.description = e.target.value;
}
function handleEditSave(vnode) {


    const { groupId, questionId, subQuestionId, optionId } = vnode.attrs.option;
    if (vnode.state.description !== undefined && vnode.state.edit === true) {
        updateOptionDescription({ groupId, questionId, subQuestionId, optionId }, vnode.state.description)
    }
    vnode.state.edit = !vnode.state.edit
}

function handleInputVideo(e, vnode) {
    let videoUrl = e.target.value;
    const urlRegExp = new RegExp('https://youtu.be/');
    const urlLongRegExp = new RegExp('https://www.youtube.com/');
    if (urlRegExp.test(videoUrl) || urlLongRegExp.test(videoUrl)) {

        vnode.state.videoUrl = videoUrl;
        e.target.style.background = '#64ff64'
    } else {

        vnode.state.videoUrl = false;
        e.target.style.background = '#ff9d9d'
    }


}

function handleAddVideo(e, vnode) {

    const { optionId } = vnode.attrs.option;

    if (vnode.state.videoUrl !== false) {

        const descriptionTextarea = document.getElementById(`optionDescription${optionId}`);
        console.log(descriptionTextarea)
        vnode.state.description += `\n--video:${vnode.state.videoUrl}***\n`
        descriptionTextarea.value += `\n--video:${vnode.state.videoUrl}***\n`
        vnode.state.addVideo = false;

        // m.redraw();
        // vnode.state.edit = false;
    }
}

function convertParagraphsToVisual(paragraph, index) {
    try {
        if (typeof paragraph !== 'string') { throw new Error(`Paragraph ${index + 1} is not a string: ${paragraph}`) }

        console.log(paragraph)

        const videoRexExp = new RegExp('--video:');
        const endUrl = paragraph.indexOf('***');
        const videoInit = paragraph.indexOf('--video')
        
        if (endUrl > -1) {
            paragraph = paragraph.slice(0,endUrl)
            paragraph = paragraph.slice(videoInit+8)
            console.log(videoInit,endUrl, paragraph)

            //convert to embed string: https://www.youtube.com/embed/_4kHxtiuML0
            // https://www.youtube.com/watch?v=_4kHxtiuML0&t=7827s
            //https://youtu.be/_4kHxtiuML0

           return (
            <iframe width="100%" height='300' src={paragraph} frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
           )
        } else {
            return (<p key={index}>{paragraph}</p>)
        }


       
        // const url = 
        // if(videoRexExp.test(pargraph)){
        //     return(
        //         <iframe width="90%"  src="https://www.youtube.com/embed/_4kHxtiuML0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        //     )
        // }

    } catch (e) {
        console.error(e)
    }
}
