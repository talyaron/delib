import m from 'mithril';
import './FeedItem.css';

//functions
import {timeParse} from '../../../functions/general'

module.exports = {
    view: vnode => {
        const { data, date, message, url, isNew, parentEntity, changeType ,changedEntity} = vnode.attrs.feedItem;
       
        if (parentEntity) {
            return (
                <div class={isNew ? 'feedItem feedItem--new' : 'feedItem'} onclick={() => { m.route.set(url) }}>

                    <h1>ב-{getEntityType(parentEntity.type)} {parentEntity.title} {getChangeType(changeType)} {getEntityType(changedEntity)} <span class='feedItem__title'>{data.title}</span></h1>
                    <p>{timeParse(new Date(date.seconds*1000))}</p>
                </div>
            )
        } else {
            return null
        }
    }
}

function getEntityType(type) {
    try {
        switch (type) {
            case 'group':
                return 'קבוצה';
            case 'question':
                return 'נושא'
            case 'subQuestion':
                return 'תת-שאלה'
            case 'option':
                return 'אפשרות'
            default:
                return 'ישות'
        }
    } catch (e) {
        console.error(e)
    }
}

function getChangeType(changeType) {
    try {
        switch (changeType) {
            case 'created':
                return 'נוצרה';
            case 'updated':
                return 'עודכנה'
            case 'deleted':
                return 'נחמקה'
            default:
                return 'נוצרה'
        }
    } catch (e) {
        console.error(e)
    }
}