class EntityModel {
    constructor(groupId = '', questionId = '', subQuestion = '', option = '', chat = false) {

        console.assert(typeof groupId == 'string' || questionId == '', 'groupId is not a string', groupId);
        console.assert(typeof questionId == 'string' || questionId == '', 'questionId is not a string', questionId);
        console.assert(typeof subQuestion == 'string' || subQuestion == '', 'subQuestion is not a string', subQuestion);
        console.assert(typeof option == 'string' || option == '', 'option is not a string', option);
        console.assert(typeof chat == 'boolean', 'chat is not a boolean', chat);

        if (groupId.length > 0) this.groupId = groupId;
        if (questionId.length > 0) this.questionId = questionId;
        if (subQuestion.length > 0) this.subQuestion = subQuestion;
        if (option.length > 0) this.option = option;
        if (chat) this.chat = chat;
    }
}

module.exports = { EntityModel }