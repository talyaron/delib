import m from 'mithril';
import FLIP from '../../functions/FLIP';
import store from '../../data/store';

module.exports = {
    oninit: vnode => {
        store.lastPage = '/team';
        sessionStorage.setItem('lastPage', store.lastPage);  
    },
    view: vnode => {
        let data = vnode.attrs.data;
        return (

            m('', {}, [
                m('div', { style: { display: 'flex', 'overflow': 'hidden' } },
                    m(FLIP, {
                        move: (vnodeChild, flip) => {
                            console.log('move()', vnodeChild, flip)
                            let flipBounding = flip.boundingClients[vnodeChild.key]
                            let diff = flipBounding.deltaX
                            let anim = [
                                { transform: 'translate3d(' + diff + 'px,0,0)' },
                                { transform: 'translate3d(0,0,0)' },
                            ]

                            var waapi = vnodeChild.dom.animate(anim, {
                                duration: 1000,
                            })
                            waapi.onfinish = (e) => {
                                console.log('finished')
                            }

                        }
                    },
                        listItem(data)
                    )
                )
            ])

        )

        function listItem(strData) {
            var letterKeysDD = FLIP.letterKeysSS(strData)
            return Array.from(letterKeys).map((dataItem, i) => {
                return m('div', { key: dataItem.key }, dataItem.letter);
            })
        }
    }
}

var values = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
]
var currentIndex = 0

