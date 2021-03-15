import m from "mithril";
import { DB } from "../config";
import store from "../../../data/store";

export function setZeroChatCounter(){
    try{
        DB
        .collection('users').doc(store.user.uid)
        .collection('messagesCounter').doc('counter')
        .set({messages:0})
        .catch(e=>{
            console.error(e)
        })
    }catch(e){
        console.error(e)
    }
}