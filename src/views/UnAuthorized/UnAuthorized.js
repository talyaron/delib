import m from 'mithril';

module.exports = {
    oninit:()=>{
       //TODO: make it a better page and ask to go to login
        m.route.set('/login')
    },
    view:()=>{
        return(<h1>Un authorized page or section</h1>)
    }
}

