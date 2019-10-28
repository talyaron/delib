import m from 'mithril';
import set from 'lodash/set';
import get from 'lodash/get';
import omit from 'lodash/omit';
import values from 'lodash/values';

import './Groups.css';
import Group from './Group/Group';
import Header from '../Commons/Header/Header';
import Feed from '../Commons/Feed/Feed';


//functions
import { getUserGroups } from '../../functions/firebase/get/get';
import { restrictedPage } from '../../functions/logins';
import { createGroup } from '../../functions/firebase/set/set';
import { setWrapperHeight } from '../../functions/general';

import store from '../../data/store';

module.exports = {
    oninit: (vnode) => {
        store.lastPage = '/groups';
        sessionStorage.setItem('lastPage', store.lastPage);

        if (restrictedPage('/groups')) {
            getUserGroups('on', store.user.uid);
        }
    },
    oncreate: vnode => {
        setWrapperHeight('headerContainer', 'groupsWrapper');
    },
    onupdate: vnode => {
        setWrapperHeight('headerContainer', 'groupsWrapper');
        console.dir(store.userGroups)
    },
    onremove: vnode => {
        getUserGroups('off', store.user.uid);
    },
    view: (vnode) => {
        return (
            <div >
                <Header title='הקבוצות שלי' topic='דליב' upLevelUrl={false} />

                <div class='groupsWrapper' id='groupsWrapper'>
                    {
                        store.userGroups.map((group, key) => {

                            return <Group
                                route='/group/'
                                title={group.title}
                                description={group.description}
                                id={group.id}
                                key={key}
                                logo={group.logo}
                                />
                        })
                    }
                </div>
                <div class='fav' onclick={() => { m.route.set('/newgroup') }} >
                    <div>+</div>
                </div>
                <Feed />
            </div >
        )
    }
}

