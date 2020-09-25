var store = {
    user: {},
    userTempName: '',
    userGroups: [],// groups the users is listeneing for
    current: {
        org: {
            title: 'שם הארגון'
        },
        team: {
            title: 'שם הקבוצה'
        }
    },
    orgs: [], //not used?
    teams: [], //not used?
    lastPage: "", //used to understand where the user was befrore login
    loginType: '',
    questions: {}, //list of questions. stored as {groupId:{questionId:{} }}
    groups: {}, //groups stored as {groupId:{group info}}
    options: [],//options in a given question. stored as subQuestionID:[options] 
    optionsVotes: {}, //store how the user voted on each option. stored as {optionId: -1 to 1}
    optionsLoc: {}, //options location. used for animations
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