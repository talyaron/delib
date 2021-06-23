var store = {
    user: {},
    userTempName: '',
    userGroups: [false],// groups the users is listeneing for
    userGroupsListen: false,
    userGroupsListners: {}, //these listners for the groups are used to unsubscribe if use do not listen to a group
    userGroupListen: {}, //used to store groups that the user listne toau
    current: {
        org: {
            title: 'שם הארגון'
        },
        team: {
            title: 'שם הקבוצה'
        },
        

    },
    orgs: [], //not used?
    teams: [], //not used?
    lastPage: "", //used to understand where the user was befrore login
    loginType: '',
    listen: {
        chatFeed: false
    },
    questions: {}, //list of questions. stored as {groupId:{questionId:{} }}
    reactions:{}, //list of reaction under a question {subQuestionId:[reactions]}
    reactionsNumber:{}, //number of current reactions per subQuestion {subQuestionId:number}
    groups: {}, //groups stored as {groupId:{group info}}
    groupListen: {}, //check if group is listened to
    groupsRegistered: {},
    registerGroupsListen: false,
    groupsUserTryToRegister: {},
    groupMembers: {}, //used to store members of groups. {groupId:[members]}
    groupSections:{}, //used to store group's titles {groupId:[titles]}
    groupSectionsListen:{}, //listen to groups titles. {groupId:[titles]}
    option: {}, //options information, stored in option:{optionId:{}}
    options: [],//options in a given question. stored as {subQuestionID:[options]} 
    optionsListen: {}, //used to store if there is a listner in subQuestion of option {subQuestionId:true}
    optionsVotes: {}, //store how the user voted on each option. stored as {optionId: -1 to 1}
    optionsConfirm:{}, //store the confirms of options. stored as {optionId:true/false}
    optionsLoc: {}, //options location. used for animations
    optionsDetails: {}, //vote on options by user
    optionNumberOfMessagesRead: {}, //store how many messages in option chat, the user has read.
    selectedOption:{}, // store the selected option of subquestion stored as: {subQuestionId:option}
    selectedOptionListen:{},
    consequences: {}, //store consequnces in theis format: {optionId:[]}
    consequencesListen: {}, //use to store if listen to consequences on spesific option
    consequencesTop: {}, //used to store top consequnces for an option format {optionId:[consequences]}
    consequencesTopListen: {}, //used to store top consequnces for an option (listner) format: {optionId:true}
    messagesShow: {}, // history of messages to show
    listenToMessages: {}, //store if user listen to notification {entityId:true}
    feedsUnsubscribe: {}, // used for feed unsubscribes
    feed: {}, //the feed,
    feed2: [], //new feed system
    feed2Info: { lastEntrance: 0 }, //used to store last entrence to feed. in miliseconds from 1970
    chatFeed: [], //used to show feed of chats
    chat: {}, //used to store chats {chatId:[messages]}
    chatLastRead: {}, //used to store last read of a message
    chatMessegesNotRead: {}, //used to store how many messages not read yet.
    chatFeedCounter: 0,
    showFeed: false,
    numberOfNewMessages: 0,
    subscribed: {}, //subscribed entityes
    subscribe: {}, //subscribed entities - second trial (orderd as path eg: 'groups/groupId/questions/...':true)
    subQuestions: {}, //sotred {subQuestionId:{data}}
    subQuestionsListners: {}, //check to see if listner was allready activates
    editEntity: false,
    documents:{}, //store documents in format {questionId:[sentences obj]} 
    documentListen:{}, //listen to documents
    push: []
}

module.exports = store; 