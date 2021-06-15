export const cssForCarousel = (vnode) => {
    try {
        const { pages } = vnode.state;
        if (!pages) throw 'no vnode.state.pages on page';
        const numberOfPages = pages.length;
        const minimalColWidth = 400;
        const screenWidth = window.innerWidth;

        let pagesPerScreen = Math.floor(screenWidth / minimalColWidth);
        if (pagesPerScreen < 1) pagesPerScreen = 1;
        if (pagesPerScreen > numberOfPages) pagesPerScreen = numberOfPages

        const colWidth = screenWidth / pagesPerScreen;

        return `repeat(${numberOfPages}, ${colWidth}px)`
    } catch (e) {
        console.error(e);
        return `repeat(1, 100vw)`;
    }
}