import m from 'mithril';
import set from 'lodash/set';
import get from 'lodash/get';
import omit from 'lodash/omit';
import values from 'lodash/values';

import './Groups.css';
import Group from './Group/Group';
import Header from '../Commons/Header/Header';
import Feed from '../Commons/Feed/Feed';
import Spinner from '../Commons/Spinner/Spinner';
import CreateNewEntity from '../Commons/CreateNewEntity/CreateNewEntity'


//functions
import { getUserGroups } from '../../functions/firebase/get/get';
import { restrictedPage } from '../../functions/logins';
import { setWrapperHeight, getRandomColor } from '../../functions/general';

import store from '../../data/store';

module.exports = {
    oninit: (vnode) => {
        store.lastPage = '/groups';
        sessionStorage.setItem('lastPage', store.lastPage);

        if (restrictedPage('/groups')) {
            getUserGroups(store.user.uid);
        }

    },
    oncreate: () => {
        setWrapperHeight('headerContainer', 'groupsWrapper');
    },
    onupdate: () => {
        setWrapperHeight('headerContainer', 'groupsWrapper');

    },
    onremove: () => {

    },
    view: () => {
        console.log(store.userGroups)
        return (
            <div >
                <Header title='הקבוצות שלי' topic='דליב' upLevelUrl={false} />

                <div class='groupsWrapper' id='groupsWrapper'>
                    {store.userGroups[0] === false ?
                        <Spinner />
                        :

                        store.userGroups.length > 0 ?
                            store.userGroups.map((group, key) => {

                                return <Group
                                    route='/group/'
                                    title={group.title}
                                    description={group.description}
                                    groupColor={group.groupColor || getRandomColor()}
                                    id={group.id}
                                    key={key}
                                    logo={group.logo}
                                />
                            })
                            :
                            <CreateNewEntity entity='קבוצות' func={() => { m.route.set('/newgroup') }    } />

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

