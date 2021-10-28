import m from "mithril";
import { DB } from "../config";
import { doc, getDoc, collection, query, onSnapshot, orderBy } from "firebase/firestore";
import store, { consequencesTop } from "../../../data/store";

export function listenToChatFeed() {

    try {

        if (store.listen.chatFeed == false) {

            const chatFeedRef = collection(DB, 'users', store.user.uid, 'messages')
            const q = query(chatFeedRef, orderBy("date", "asc"));
            const unsub = onSnapshot(q, chatDB => {
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

        const badgeCounterRef = doc(DB, 'users',store.user.uid, 'messagesCounter','counter' )
        return onSnapshot(badgeCounterRef, counterDB => {
            if (counterDB.exists) {
                let counter = counterDB.data().messages;

                navigator.setAppBadge(counter).catch(e => { console.error(e) })
            }
        })
    } else {
        return () => { };
    }
}