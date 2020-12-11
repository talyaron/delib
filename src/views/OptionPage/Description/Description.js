import m from 'mithril';
import './Description.css';

//functions
import { changeTextToArray } from '../../../functions/general';
import { updateOptionDescription } from '../../../functions/firebase/set/set';
import { storage } from '../../../functions/firebase/config'


//data
import store from '../../../data/store'
import { concat } from 'lodash';

let firstDescription = false

module.exports = {
    oninit: async vnode => {

        vnode.state = {
            edit: false,
            description: '',
            addVideo: false,
            youtubeVideoId: false,
            addPicture: false
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


        return (
            <div class='description'>
                <h1>הסבר</h1>
                {vnode.state.edit ?
                    <textarea class='inputGeneral' defaultValue={description} onkeyup={e => handleEditDescription(e, vnode)} id={`optionDescription${optionId}`} />
                    :
                    <div class='description__text'  >
                        {
                            descriptionParagraphs.map((paragaph, index) => {

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
                        {vnode.state.edit ? <div class='buttons buttonOutlineGray' onclick={()=>{vnode.state.addPicture = true}}>הוספת תמונה</div> : null}
                    </div>
                    : null

                }
                {vnode.state.addVideo ?
                    <div class='addVideo__background'>
                        <div class='addVideo'>
                            <p>יש לרשום רק את ה-id של הוידאו</p>
                            <p>https://www.youtube.com/watch?v=<b>PHhOoVVqOzI</b></p>
                            <input class='inputGeneral' type='text' oninput={e => { handleInputVideo(e, vnode) }} placeholder='Enter youtube video id' />
                            <div class='buttonsBox'>
                                <div class='buttons buttonOutlineGray' onclick={e => { handleAddVideo(e, vnode) }}>הוספה</div>
                                <div class='buttons buttonOutlineGray' onclick={() => { vnode.state.addVideo = false; vnode.state.edit = false }}>ביטול</div>
                            </div>
                        </div>
                    </div>
                    : null
                }
                {vnode.state.addPicture ?
                    <div class='addVideo__background'>
                        <div class='addVideo'>
                            <h2>הוסיפו תמונה</h2>
                            <input class='inputGeneral' type='file' onchange={e => { handleUploadImage(e, vnode) }} />
                            <div class='buttonsBox'>
                                <div class='buttons buttonOutlineGray' onclick={e => { handleAddPicture(e, vnode) }}>הוספה</div>
                                <div class='buttons buttonOutlineGray' onclick={() => { vnode.state.addPicture = false; vnode.state.edit = false }}>ביטול</div>
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

    let videIdRegExp = /^[A-Za-z0-9_-]{11}$/

    if (videIdRegExp.test(videoUrl)) {

        vnode.state.youtubeVideoId = videoUrl;
        e.target.style.background = '#64ff64'
    } else {

        vnode.state.youtubeVideoId = false;
        e.target.style.background = '#ff9d9d'
    }


}

function handleAddVideo(e, vnode) {

    const { optionId } = vnode.attrs.option;

    if (vnode.state.youtubeVideoId !== false) {

        const descriptionTextarea = document.getElementById(`optionDescription${optionId}`);

        vnode.state.description += `\n--video:${vnode.state.youtubeVideoId}***\n`
        descriptionTextarea.value += `\n--video:${vnode.state.youtubeVideoId}***\n`
        vnode.state.addVideo = false;

        // m.redraw();
        // vnode.state.edit = false;
    }
}

function convertParagraphsToVisual(paragraph, index) {
    try {
        if (typeof paragraph !== 'string') { throw new Error(`Paragraph ${index + 1} is not a string: ${paragraph}`) }



        const videoRexExp = new RegExp('--video:');
        const endUrl = paragraph.indexOf('***');
        const videoInit = paragraph.indexOf('--video');
        const pictureInit = paragraph.indexOf('--imgSrc');

        console.log(paragraph)

        if (endUrl > -1) {
            if (videoInit > -1) {
                paragraph = paragraph.slice(0, endUrl)
                paragraph = paragraph.slice(videoInit + 8)

                return (
                    //     <iframe width="100%" height='300' src={paragraph} frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    <iframe width="100%" height='300' src={'https://www.youtube.com/embed/' + paragraph} frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen ></iframe >
                )
            } else if (pictureInit > -1) {
                paragraph = paragraph.slice(0, endUrl)
                paragraph = paragraph.slice(videoInit + 10);

                console.log(paragraph)

                return (
                   
                    <img src={paragraph} alt='image of option' />
                )
            }
        }
        else {
            return (<p key={index}>{paragraph}</p>)
        }




    } catch (e) {
        console.error(e)
    }
}


async function handleUploadImage(e, vnode) {
    let firstFile = e.target.files[0] // upload the first file only
    console.log(firstFile)
    await storage.ref(`photos/test/${firstFile.name}`).put(firstFile).then(doc => {
        console.dir(doc);
        console.log(doc.metadata.fullPath)


    })
    const imageHref = await storage.ref(`photos/test/${firstFile.name}`).getDownloadURL();

    console.log(imageHref)

    //add to text
    const { optionId } = vnode.attrs.option;
    const descriptionTextarea = document.getElementById(`optionDescription${optionId}`);
    vnode.state.description += `\n--imgSrc:${imageHref}***\n`
    descriptionTextarea.value += `\n--imgSrc:${imageHref}***\n`
    vnode.state.addPicture = false;
    m.redraw();
}