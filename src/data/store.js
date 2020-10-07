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
    feed: {}, //the feed,
    feed2:[], //new feed system
    feed2Info:{lastEntrance:0}, //used to store last entrence to feed. in miliseconds from 1970
    showFeed: false,
    numberOfNewMessages: 0,
    subscribed: {}, //subscribed entityes
    subscribe:{}, //subscribed entities - second trial (orderd as path eg: 'groups/groupId/questions/...':true)
    subQuestions: {},
    editEntity: false,

    push: []
}

module.exports = store; 