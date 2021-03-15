import m from "mithril";
import { DB } from "../config";
import store, { consequencesTop } from "../../../data/store";

export function listenToChatFeed() {

    try {

        if (store.listen.chatFeed == false) {
            DB.collection('users').doc(store.user.uid).collection('messages')
                .orderBy("date", "asc")
                .onSnapshot(chatDB => {
                    let unreadMessagesCouner = 0;
                    const messages = [];
                    chatDB.forEach(newMessageDB => {


                        messages.push(newMessageDB.data());

                        unreadMessagesCouner += newMessageDB.data().msgDifference;
                    })


                    store.chatFeed = messages;

                    store.chatFeedCounter = unreadMessagesCouner;

                    m.redraw()
                })

            store.listen.chatFeed = true;
        }

    } catch (e) {
        console.error(e)
    }
}

export function listenToBageMessages() {
    if ("setAppBadge" in navigator && "clearAppBadge" in navigator) {

        return DB.collection('users').doc(store.user.uid).collection('messagesCounter').doc('counter').onSnapshot(counterDB => {
            if (counterDB.exists) {
                let counter = counterDB.data().messages;
            
                navigator.setAppBadge(counter).catch(e => { console.error(e) })
            }
        })
    } else {
        return () => { };
    }
}