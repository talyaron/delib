import m from 'mithril';
import {get} from 'lodash';


import './Groups.css';
import Group from './Group/Group';
import Header from '../Commons/Header/Header';
import Feed from '../Commons/Feed/Feed';
import Spinner from '../Commons/Spinner/Spinner';
import CreateNewEntity from '../Commons/CreateNewEntity/CreateNewEntity';
import NavBottom from '../Commons/NavBottom/NavBottom'


//functions

import { getRandomColor } from '../../functions/general';

import store from '../../data/store';

module.exports = {
    oninit: (vnode) => {
        store.lastPage = '/groups';
        sessionStorage.setItem('lastPage', store.lastPage);
    },
    view: () => {

        return (
            <div class='page page__grid'>
                <Header name='דליב - קבוצות' topic='דליב' upLevelUrl={false} notifications={false} />

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
                            isShowNewGroup()?<CreateNewEntity entity='קבוצות' func={() => { m.route.set('/newgroup') }} />:null

                    }
                </div>
                <NavBottom />
                {isShowNewGroup() ?
                    <div class='fav' onclick={() => { m.route.set('/newgroup') }} >
                        <div>+</div>
                    </div>
                    : null
                }
                <Feed />
            </div >
        )

        function isShowNewGroup() {
            try{
            const {isAnonymous} = store.user;
            if(isAnonymous === undefined) return false;
            if(isAnonymous === true) return false;
            return true;
           
            }catch(e){
                console.error(e);
                return false;
            }
        }
    }
}

