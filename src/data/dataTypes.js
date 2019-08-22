import  DB  from '../functions/firebase/config';

class EntityModel {
    constructor(entity = '', groupId = '', questionId = '', subQuestionId = '', option = '', chat = false) {
        


        console.assert(typeof entity == 'string' || entity.length>0 , 'entity is not a string and must be declerd', entity);
        console.assert(typeof groupId == 'string' || questionId == '', 'groupId is not a string', groupId);
        console.assert(typeof questionId == 'string' || questionId == '', 'questionId is not a string', questionId);
        console.assert(typeof subQuestionId == 'string' || subQuestionId == '', 'subQuestionId is not a string', subQuestionId);
        console.assert(typeof option == 'string' || option == '', 'option is not a string', option);
        console.assert(typeof chat == 'boolean', 'chat is not a boolean', chat);

        if (entity.length > 0) this.entity = entity;
        if (groupId.length > 0) this.groupId = groupId;
        if (questionId.length > 0) this.questionId = questionId;
        if (subQuestionId.length > 0) this.subQuestionId = subQuestionId;
        if (option.length > 0) this.option = option;
        if (chat) this.chat = chat;

        console.dir(this)
    }

    get getRef() {
        
        switch (this.entity) {
            case 'group':
                return DB.collection('groups').doc(this.groupId);
            case 'question':
                return DB.collection('groups').doc(this.groupId).collection('questions').doc(this.questionId);
            case 'subQuestion':
                return DB.collection('groups').doc(this.groupId).collection('questions').doc(this.questionId).collection('subQuestions').doc(this.subQuestionId)
        }
    }   

}

module.exports = { EntityModel }