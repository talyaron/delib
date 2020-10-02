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

function concatenatePath(groupId, questionId, subQuestionId, optionId) {
    try {
        let subscriptionPath = 'groups/'
        if (groupId !== undefined) {
            subscriptionPath += `${groupId}`;
            if (questionId !== undefined) {
                subscriptionPath += `/questions/${questionId}`;
                if (subQuestionId !== undefined) {
                    subscriptionPath += `/subQuestions/${subQuestionId}`;
                    if (optionId !== undefined) {
                        subscriptionPath += `/options/${optionId}`
                    }
                }
            }
            return subscriptionPath
        } else {
            throw new Error(`No groupId was given ${groupId}`)
            
        }

        
    } catch (err) {
        console.error(err);
        return undefined;
    }
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
    concatenatePath
}