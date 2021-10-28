import m from 'mithril';

module.exports.exitOut = (page, nextUrl) => {
    page.addEventListener('animationend', e => {
        if (e.animationName === 'zoomOutExit') {

            m.route.set(nextUrl)
        }

    })

    page.classList.add("zoomOutExit");
}

module.exports.enterIn = (page, nextUrl) => {

   
    page.addEventListener('animationend', e => {
        console.log(e.animationName)
        if (e.animationName === 'zoomJumpInStart') {
          
            page.classList.remove("zoomJumpInStart");
            m.route.set(nextUrl)
        }

    })

    page.classList.add("zoomJumpInStart");
}

module.exports.enterIn2ndPage = page => {

   
   

    page.addEventListener('animationend', e => {
       
        if (e.animationName === 'zoomJumpInEnd') {
      
            page.classList.remove("zoomJumpInEnd");

        }

    })

    page.classList.add("zoomJumpInEnd");
}