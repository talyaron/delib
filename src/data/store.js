var store = {
    user: {},
    userTempName: '',
    userGroups: [],
    current: {
        org: {
            title: 'שם הארגון'
        },
        team: {
            title: 'שם הקבוצה'
        }
    },
    orgs: [],
    teams: [],
    lastPage: "",
    loginType: '',
    questions: {}, //list of questions in groupPage
    groups: {}, //groups name
    options: [],//options in a given question
    optionsVotes: {},
    optionsLoc: {},
    optionsDetails: {}, //vote on options by user
    messagesShow: {}, // history of messages to show
    feedsUnsubscribe: {}, // used for feed unsubscribes
    feed: {}, //the feed
    showFeed: false,
    numberOfNewMessages: 0,
    subscribed: {}, //subscribed entityes
    subQuestions: {},
    editEntity: false,

    push: []
}

module.exports = store; 