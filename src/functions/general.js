import { truncate } from 'lodash';
import m from 'mithril';
import store from '../data/store';

function deep_value(obj, path, alternativeValue) {

    for (var i = 0, path = path.split('.'), len = path.length; i < len; i++) {

        if (obj.hasOwnProperty(path[i])) {
            obj = obj[path[i]];

        } else {
            return alternativeValue
        }
    };

    return obj;
};

function setWrapperHeight(headerId, wrapperId) {
    let header = document.getElementById(headerId);
    if (header != null) {
        let headerHeight = header.clientHeight;
        headerHeight += 10
        document
            .getElementById(wrapperId)
            .style
            .top = headerHeight + 'px';

    } else {
        console.error('No such header exists')
    }
}

function setWrapperFromFooter(footerId, wrapperId) {
    let footerHeight = document
        .getElementById(footerId)
        .clientHeight;
    document
        .getElementById(wrapperId)
        .style
        .marginBottom = footerHeight + 30 + 'px'
}

function returnUserRole(rolesObj, userUID) {
    if (rolesObj.hasOwnProperty(userUID)) {
        return rolesObj[userUID];
    } else {
        return false;
    }
}

function msToTime(initMilliseconds) {
    var milliseconds = parseInt((initMilliseconds % 1000) / 100),
        seconds = Math.floor((initMilliseconds / 1000) % 60),
        minutes = Math.floor((initMilliseconds / (1000 * 60)) % 60),
        hours = Math.floor((initMilliseconds / (1000 * 60 * 60)) % 24);

    hours = (hours < 10)
        ? "0" + hours
        : hours;
    minutes = (minutes < 10)
        ? "0" + minutes
        : minutes;
    seconds = (seconds < 10)
        ? "0" + seconds
        : seconds;

    return hours + ":" + minutes + ":" + seconds;
}

class Reference {
    constructor(path, type, collectionOrDoc) {
        //type can be 'array', 'string--', 'string/'
        let types = ['array', 'stringDash', 'stringSlash'];

        this.path = path;
        this.type = type;
        this.collectionOrDoc = collectionOrDoc;
        if (!types.includes(this.type)) {
            console.error(`Type ${this.type}, is not recognized by class Reference`)
            return
        }

        if (!(this.collectionOrDoc == 'collection' || this.collectionOrDoc == 'doc')) {
            console.error(`Please specify if 'collection' or 'doc'.  ${collectionOrDoc} was set in class Reference`);
            return;
        }
    }

    fromArrayToSring() {
        let refString = '';

        if (this.collectionOrDoc === 'collection') {

            //concatinate a path
            for (let i = 0; i < this.path.length; i++) {
                if (i == 0) {
                    refString += this.path[i]
                } else {
                    refString += '--' + this.path[i]
                }

            }
            return refString;

        } else {
            console.info('didnt created doc convertor yet');
            return false;
        }
    }
}

function createRefString(refArray, collectionOrDoc) {
    //conver array that represnet a Reference to sting Reference

}

function getRandomName() {
    return randomEl(adjectives) + randomEl(nouns)
}

function generateChatEntitiyId(ids) {
    //generate unique id from ids 
    try {
        const { groupId, questionId, subQuestionId, optionId } = ids;
        if (groupId === undefined) { throw 'Missing groupId in generateChatEntitiyId' }


        let entityChatId = `${groupId}`;
        if (questionId !== undefined) { entityChatId += `--${questionId}` };
        if (subQuestionId !== undefined) { entityChatId += `--${subQuestionId}` };
        if (optionId !== undefined) { entityChatId += `--${optionId}` };

        return entityChatId;
    } catch (e) {
        console.error(e)
    }
}

function getIsChat() {

    //in the address add <entity>-chat for chat page
    try {
        const routeFirstElement = (m.route.get().split('/')[1]);
        let isChat = routeFirstElement.split('-')[1];
        if (isChat === 'chat') {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        console.error(e)
        return false;
    }
}

var adjectives = [
    "Happy",
    "adroit",
    "amatory",
    "animistic",
    "antic",
    "arcadian",
    "baleful",
    "bellicose",
    "bilious",
    "boorish",
    "calamitous",
    "caustic",
    "cerulean",
    "comely",
    "concomitant",
    "contumacious",
    "corpulent",
    "crapulous",
    "defamatory",
    "didactic",
    "dilatory",
    "dowdy",
    "efficacious",
    "effulgent",
    "egregious",
    "endemic",
    "equanimous",
    "execrable",
    "fastidious",
    "feckless",
    "fecund",
    "friable",
    "fulsome",
    "garrulous",
    "guileless",
    "gustatory",
    "heuristic",
    "histrionic",
    "hubristic",
    "incendiary",
    "insidious",
    "insolent",
    "intransigent",
    "inveterate",
    "invidious",
    "irksome",
    "jejune",
    "jocular",
    "judicious",
    "lachrymose",
    "limpid",
    "loquacious",
    "luminous",
    "mannered",
    "mendacious",
    "meretricious",
    "minatory",
    "mordant",
    "munificent",
    "nefarious",
    "noxious",
    "obtuse",
    "parsimonious",
    "pendulous",
    "pernicious",
    "pervasive",
    "petulant",
    "platitudinous",
    "precipitate",
    "propitious",
    "puckish",
    "querulous",
    "quiescent",
    "rebarbative",
    "recalcitant",
    "redolent",
    "rhadamanthine",
    "risible",
    "ruminative",
    "sagacious",
    "salubrious",
    "sartorial",
    "sclerotic",
    "serpentine",
    "spasmodic",
    "strident",
    "taciturn",
    "tenacious",
    "tremulous",
    "trenchant",
    "turbulent",
    "turgid",
    "ubiquitous",
    "uxorious",
    "verdant",
    "voluble",
    "voracious",
    "wheedling",
    "withering",
    "zealous"
];
var nouns = [
    "ninja",
    "chair",
    "pancake",
    "statue",
    "unicorn",
    "rainbows",
    "laser",
    "senor",
    "bunny",
    "captain",
    "nibblets",
    "cupcake",
    "carrot",
    "gnomes",
    "glitter",
    "potato",
    "salad",
    "toejam",
    "curtains",
    "beets",
    "toilet",
    "exorcism",
    "stick figures",
    "mermaid eggs",
    "sea barnacles",
    "dragons",
    "jellybeans",
    "snakes",
    "dolls",
    "bushes",
    "cookies",
    "apples",
    "ice cream",
    "ukulele",
    "kazoo",
    "banjo",
    "opera singer",
    "circus",
    "trampoline",
    "carousel",
    "carnival",
    "locomotive",
    "hot air balloon",
    "praying mantis",
    "animator",
    "artisan",
    "artist",
    "colorist",
    "inker",
    "coppersmith",
    "director",
    "designer",
    "flatter",
    "stylist",
    "leadman",
    "limner",
    "make-up artist",
    "model",
    "musician",
    "penciller",
    "producer",
    "scenographer",
    "set decorator",
    "silversmith",
    "teacher",
    "auto mechanic",
    "beader",
    "bobbin boy",
    "clerk of the chapel",
    "filling station attendant",
    "foreman",
    "maintenance engineering",
    "mechanic",
    "miller",
    "moldmaker",
    "panel beater",
    "patternmaker",
    "plant operator",
    "plumber",
    "sawfiler",
    "shop foreman",
    "soaper",
    "stationary engineer",
    "wheelwright",
    "woodworkers"
];

function randomEl(list) {
    var i = Math.floor(Math.random() * list.length);
    return list[i];
}

function loginIfNotRegisterd(back = 'login') {
    //see if logged in

    if (store.user.hasOwnProperty('isAnonymous')) {
        if (store.user.isAnonymous) {
            //need to login
            store.lastPage = `/${back}`;
            m
                .route
                .set('/loginGoogle');
        }
    } else {
        store.lastPage = `/${back}`;
        m
            .route
            .set('/loginGoogle');
    }
}

function setLastPage() {
    store.lastPage = m
        .route
        .get();
    sessionStorage.setItem('lastPage', store.lastPage)
}

function concatenateDBPath(groupId, questionId, subQuestionId, optionId, consequenceId) {
    try {
        let subscriptionPath = 'groups/'
        if (groupId !== undefined) {
            subscriptionPath += `${groupId}`;
            if (questionId !== undefined) {
                subscriptionPath += `/questions/${questionId}`;
                if (subQuestionId !== undefined) {
                    subscriptionPath += `/subQuestions/${subQuestionId}`;
                    if (optionId !== undefined) {
                        subscriptionPath += `/options/${optionId}`;
                        if (consequenceId != undefined) {
                            subscriptionPath += `/consequences/${consequenceId}`;
                        }
                    }
                }
            }
            return subscriptionPath
        } else {
            return '/groups'

        }


    } catch (err) {
        console.error(err);
        return undefined;
    }
}

function concatenateURL(groupId, questionId, subQuestionId, optionId) {
    try {
        let subscriptionPath = 'groups/'
        if (groupId !== undefined) {
            subscriptionPath = 'group/' + groupId;
            if (questionId !== undefined) {
                subscriptionPath = `question/${groupId}/${questionId}`;
                if (subQuestionId !== undefined) {
                    subscriptionPath = `/subquestions/${groupId}/${questionId}/${subQuestionId}`;
                    if (optionId !== undefined) {
                        subscriptionPath = `/option/${groupId}/${questionId}/${subQuestionId}/${optionId}`
                    }
                }
            }
            return subscriptionPath
        } else {
            return '/groups'

        }


    } catch (err) {
        console.error(err);
        return undefined;
    }
}

function uniqueId() {

    return 'xxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });

}


function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getRandomColorDark() {
    var letters = '56789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 11)];
    }
    return color;

}

function createIds(ids) {

    const outpuIds = {}
    for (const id in ids) {

        if (ids[id] !== undefined) {
            outpuIds[id] = ids[id];
        }
    }

    return outpuIds
}

function timeParse(time) {
    try {

        if (Object.prototype.toString.call(time) !== '[object Date]') throw new Error('Expected a Date object but got somthing else', time)

        return (
            ("0" + time.getHours()).slice(-2) + ":" +
            ("0" + time.getMinutes()).slice(-2)
        )

    } catch (e) {
        console.error(e)
    }
}

function setBrowserUniqueId() {
    // check a unique id for each brawser, for notifications identification, in no exists, it create such id. 
    //the function return the unique id

    try {

        let deviceUniqueId = localStorage.getItem('deviceUniqueId');
        if (deviceUniqueId === null) {
            const id = uniqueId();
            localStorage.setItem('deviceUniqueId', id);
            deviceUniqueId = id;
        }

        return deviceUniqueId;


    } catch (e) {
        console.error(e)
    }
}

function getEntityId(ids) {

    try {

        const { groupId, questionId, subQuestionId, optionId } = ids;

        let entityId = '';
        if (groupId !== undefined) { entityId = groupId };
        if (questionId !== undefined) { entityId = questionId };
        if (subQuestionId !== undefined) { entityId = subQuestionId };
        if (optionId !== undefined) { entityId = optionId };

        return entityId

    } catch (e) {
        console.error(e)
    }
}

function randomizeArray(a) {
    "use strict";
    a = [...a]
    var i, t, j;
    for (i = a.length - 1; i > 0; i -= 1) {
        t = a[i];
        j = Math.floor(Math.random() * (i + 1));
        a[i] = a[j];
        a[j] = t;
    }

    return [...a];

};

function calcOpacity(value) {
    const levelOpacity = .6;

    return ((value * 0.01) * levelOpacity) + (1 - levelOpacity)
}

const percentColors = [
    { pct: 0.0, color: { r: 0xff, g: 0x00, b: 0 } },
    { pct: 0.5, color: { r: 0xff, g: 0xff, b: 0 } },
    { pct: 1.0, color: { r: 0x00, g: 0xff, b: 0 } }];

function getColorForPercentage(pct) {

    for (var i = 1; i < percentColors.length - 1; i++) {
        if (pct < percentColors[i].pct) {
            break;
        }
    }
    var lower = percentColors[i - 1];
    var upper = percentColors[i];
    var range = upper.pct - lower.pct;
    var rangePct = (pct - lower.pct) / range;
    var pctLower = 1 - rangePct;
    var pctUpper = rangePct;
    var color = {
        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
    };
    if (pct > 0.4 && pct < 0.6) { return 'white' };

    return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
    // or output as hex if preferred
};

function changeTextToArray(text) {
    try {
        if (text === undefined) {
            return [];

        } else if (typeof text !== 'string') {
            throw `text is not a string. text = ${text} `;

        } else {
            return text.split("\n");
        }
    } catch (e) {
        console.error(e);
        return []
    }
}

function convertParagraphsToVisual(paragraph, index) {
  
    try {
        if (typeof paragraph !== 'string') { throw new Error(`Paragraph ${index + 1} is not a string: ${paragraph}`) }



        const videoRexExp = new RegExp('--video:');
        const httpRegExp = new RegExp('http://');
        const httpsRegExp = new RegExp('https://');

        const endUrl = paragraph.indexOf('***');
        const videoInit = paragraph.indexOf('--video');
        const pictureInit = paragraph.indexOf('--imgSrc');



        if (endUrl > -1) {
            if (videoInit > -1) {
                paragraph = paragraph.slice(0, endUrl)
                paragraph = paragraph.slice(videoInit + 8)

                return (
                    //     <iframe width="100%" height='300' src={paragraph} frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    <iframe key={index} width="100%" height='300' src={'https://www.youtube.com/embed/' + paragraph} frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen ></iframe >
                )
            } else if (pictureInit > -1) {
                paragraph = paragraph.slice(0, endUrl)
                paragraph = paragraph.slice(videoInit + 10);
              


                return (

                    <img key={index} src={paragraph} alt='image of option' />
                )
            }
        }
        else if (httpRegExp.test(paragraph) || httpsRegExp.test(paragraph)) {

            const arr = paragraph.split(' ')
            
            return arr.map((word,i)=>{
                if (httpRegExp.test(word) || httpsRegExp.test(word)) {
                    return(<a key={i} href={word} target='_blank'>{word} </a>)
                } else {
                    return(<span key={i}>{word} </span>)
                }
            })
           

        } else {
            return (<p key={index}>{paragraph}</p>)
        }




    } catch (e) {
        console.error(e)
    }
}

function getFirstUrl() {
    let url = m.route.get();
    url = url.split('/')

    return url[1];
}

module.exports = {
    Reference,
    createRefString,
    msToTime,
    deep_value,
    setWrapperHeight,
    setWrapperFromFooter,
    returnUserRole,
    getRandomName,
    loginIfNotRegisterd,
    setLastPage,
    concatenateDBPath,
    concatenateURL,
    uniqueId,
    getRandomColor,
    getRandomColorDark,
    generateChatEntitiyId,
    getIsChat,
    createIds,
    timeParse,
    setBrowserUniqueId,
    getEntityId,
    randomizeArray,
    calcOpacity,
    getColorForPercentage,
    changeTextToArray,
    convertParagraphsToVisual,
    getFirstUrl
}