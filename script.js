
const board = document.body;
let listArray = localStorage.getItem( 'listArray' ) ? JSON.parse( localStorage.getItem( 'listArray' ) ) : [];

window.onload = () => {
    init()
    panel( board );

    board.appendChild( btnEmptyStorage() );
};

function init() {
    if ( listArray && listArray.length > 0 ) {
        for ( const item in listArray ) prepareSection( listArray[ item ] )
        if ( listArray.length <= 2 ) prepareSection()
        if ( listArray.length > 2 ) board.appendChild( sectionBtnAdd() );
    } else {
        prepareSection()
    }
}

// Prepare Dom element   #############################

function prepareSection( item ) {
    // console.log( ' === prepareSection Item: ', item, '\n' )
    const section = sectionEl()
    const title = sectionElHeader();
    title.classList.add( 'title--section' )
    section.prepend( title );

    const footer = sectionElFooter()
    section.appendChild( footer );

    if ( item ) {
        section.dataset.id = item.id
        title.value = item.title
    }

    title.addEventListener( "focusout", editSectionTitle );

    const btnAddList = board.querySelector( '.btn-AddList' )

    if ( btnAddList ) {
        btnAddList.parentNode.insertBefore( section, btnAddList )
    } else {
        board.appendChild( section );
    }

    if ( item && item.list.length ) {
        for ( const article in item.list ) {
            prepareArticle( item.id, item.list[ article ].id )
        }
    }
    if ( !title.value ) title.focus();
}
function prepareArticle( sectionId, articleId ) {
    const section = document.querySelector( '[data-id="' + sectionId + '"]' );
    const article = articleEl()
    const item = getStoreItem( sectionId )
    const subItem = item.list.find( ( ar ) => ar.id == articleId )
    const title = sectionElHeader();

    title.classList.add( 'title--article' )
    title.value = subItem ? subItem.title : ''
    if ( subItem && subItem.id ) {
        title.dataset.id = subItem.id
    }
    article.prepend( title );
    title.addEventListener( "focusout", editArticleTitle );

    if ( sectionId ) {
        const btn = section.querySelector( 'button' )
        btn.parentNode.insertBefore( article, btn )
    }

    if ( articleId ) section.querySelector( 'button' ).disabled = false
    title.focus()
}

// Title methods   #############################
const editSectionTitle = ( e ) => {
    const id = e.target.parentNode.dataset.id
    const val = e.target.value.trimStart()
    const btnAddList = board.querySelector( '.btn-AddList' )
    if ( val ) {
        if ( getStoreItem( id ) ) {
            let item = getStoreItem( id )
            item.title = val
            updateStoreItem( item )
        } else {
            const newId = id ? id : + Date.now()
            e.target.parentNode.dataset.id = newId
            const item = { id: newId, title: val, list: [] }
            addStoreItem( item )
            if ( listArray.length < 4 ) prepareSection()
        }
        if ( !btnAddList && listArray.length == 4 ) {
            board.appendChild( sectionBtnAdd() );
        }
        if ( btnAddList ) {
            btnAddList.disabled = false
        }
    }
    if ( !val && getStoreItem( id ) ) e.target.value = getStoreItem( id ).title
    if ( !val && !id && listArray.length == 3 ) {
        e.target.parentNode.remove()
        if ( btnAddList ) {
            btnAddList.removeAttribute( 'disabled' );
        } else {
            board.appendChild( sectionBtnAdd() );
        }
    }
}
const editArticleTitle = ( e ) => {
    const sectionId = e.target.parentNode.parentNode.dataset.id
    const articleId = e.target.dataset.id
    const val = e.target.value.trimStart()
    const btnAddCard = e.target.parentNode.parentNode.querySelector( '.btn-AddCard' )
    if ( val ) {
        if ( getStoreItem( sectionId ) ) {
            let item = getStoreItem( sectionId )
            const article = item.list.find( ( ar ) => ar.id == articleId );
            if ( !article ) {
                const id = + Date.now()
                e.target.dataset.id = id
                item.list.push( { id: id, title: val } )
                updateStoreItem( item )
            } else {
                const idx = item.list.findIndex( x => x.id == articleId );
                item.list[ idx ].title = val
                updateStoreItem( item )
            }
        }
    }
    if ( !val && articleId ) e.target.value = getStoreItem( sectionId ).list.find( ( ar ) => ar.id == articleId ).title
    if ( !val && !articleId ) e.target.remove()
    if ( btnAddCard ) btnAddCard.disabled = false
}

// DOM elements   #############################
function sectionEl() {
    const section = document.createElement( 'section' );
    section.classList.add( 'section', 'droptarget' )
    section.setAttribute( "ondrop", "drop(event, this)" );
    section.setAttribute( "ondragover", "allowDrop(event)" );
    section.setAttribute( "draggable", "true" );
    section.setAttribute( "ondragstart", "drag(event)" );
    return section
}
function sectionElHeader() {
    const title = document.createElement( "INPUT" );
    title.setAttribute( "type", "text" );
    title.placeholder = "Add Title..";
    title.classList.add( 'title' )
    return title
}
function sectionElFooter() {
    const button = document.createElement( 'button' )
    button.innerText = '+ Add a card'
    button.classList.add( 'btn-AddCard' )
    button.addEventListener( 'click', ( e ) => {
        prepareArticle( e.target.parentNode.dataset.id, null )
        e.target.disabled = true
    } )
    return button
}
function sectionBtnAdd() {
    const button = document.createElement( 'button' )
    button.innerText = '+ Add Another List'
    button.classList.add( 'btn-AddList' )
    button.addEventListener( 'click', ( e ) => {
        e.target.disabled = true
        prepareSection()
    } )
    return button
}
function articleEl() {
    const article = document.createElement( 'article' );
    article.classList.add( 'article' )
    article.setAttribute( "ondrop", "drop(event, this)" );
    article.setAttribute( "ondragover", "allowDrop(event)" );
    article.setAttribute( "draggable", "true" );
    article.setAttribute( "ondragstart", "drag(event)" );
    return article
}

function btnEmptyStorage() {
    const button = document.createElement( 'button' )
    button.innerText = 'Empty Storage'
    button.classList.add( 'btn-emptyStorage' )
    button.addEventListener( 'click', () => {
        window.localStorage.clear();
        window.location.reload();
    } )
    return button
}

// localStorage   #############################
function getStoreItem( id ) {
    const localItem = listArray.find( ( item ) => item.id == id );
    return localItem
}
function updateStoreItem( item ) {
    const foundIndex = listArray.findIndex( x => x.id == item.id );
    listArray[ foundIndex ] = item;
    localStorage.setItem( 'listArray', JSON.stringify( listArray ) );
    listArray = JSON.parse( localStorage.getItem( 'listArray' ) )
}
function addStoreItem( item ) {
    listArray.push( item );
    localStorage.setItem( 'listArray', JSON.stringify( listArray ) );
    listArray = JSON.parse( localStorage.getItem( 'listArray' ) )
}
function deleteStoreItem( id ) {
    listArray = listArray.filter( item => item.id != id );
    localStorage.setItem( 'listArray', JSON.stringify( listArray ) );
    listArray = JSON.parse( localStorage.getItem( 'listArray' ) )
}



// ITEMS DRAGGABLE   #############################
function panel( target ) {
    target.classList.add( "board" );
    let current, sections = target.getElementsByTagName( "section" );

    for ( let i of sections ) {
        i.draggable = true;

        i.ondragstart = ( ev ) => {
            current = i;
            for ( let it of sections ) {
                if ( it != current ) { it.classList.add( "hint" ); }
            }
        };

        i.ondragenter = ( ev ) => {
            if ( i != current ) { i.classList.add( "active" ); }
        };

        i.ondragleave = () => i.classList.remove( "active" );

        i.ondragend = () => {
            for ( let it of sections ) {
                it.classList.remove( "hint" );
                it.classList.remove( "active" );
            }
        };

        i.ondragover = ( evt ) => evt.preventDefault();

        i.ondrop = ( evt ) => {
            evt.preventDefault();
            if ( i != current ) {
                let currentpos = 0, droppedpos = 0;
                for ( let it = 0; it < sections.length; it++ ) {
                    if ( current == sections[ it ] ) { currentpos = it; }
                    if ( i == sections[ it ] ) { droppedpos = it; }
                }
                if ( currentpos < droppedpos ) {
                    i.parentNode.insertBefore( current, i.nextSibling );
                } else {
                    i.parentNode.insertBefore( current, i );
                }
            }
        };
    }
}
