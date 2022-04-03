const board = document.querySelector( '.board' )
const articles = document.querySelectorAll( '.article' )
const sections = document.querySelectorAll( '.section' )
const modal = document.querySelector( ".modal" );
const searchBar = document.getElementById( "searchbar" );
const searchbarBtn = document.querySelector( ".searchbarBtn" );


let src, parentSrc, target, targetParent;

let listArray = localStorage.getItem( 'listArray' ) ? JSON.parse( localStorage.getItem( 'listArray' ) ) : [];


window.onload = async () => {
    await init()
    board.appendChild( btnEmptyStorage() );
    board.appendChild( Populate100() );
    searching( searchBar )
};


async function init() {
    if ( listArray && listArray.length > 0 ) {
        for ( const item in listArray ) prepareSection( listArray[ item ] )
        if ( listArray.length <= 2 ) prepareSection()
        if ( listArray.length > 2 ) {
            board.appendChild( newSectionBtn() )
        }
    } else {
        prepareSection()
    }

    modal.style.display = 'block'


    if ( listArray.length >= 4 ) {
        if ( searchBar ) {
            searchBar.style.display = 'block'
        }
    }

    searchbarBtn.addEventListener( 'click', ( e ) => {
        searchBar.value = ''
        e.target.style.display = 'none'
    } )
}

// Prepare Dom element   #############################

function prepareSection( item ) {
    const section = sectionEl()

    const header = headerEl();
    section.prepend( header );

    const input = inputEl();

    if ( item ) {
        section.dataset.id = item.id
        input.value = item.title
        // input.setAttribute( 'value', input.value );


    }

    header.prepend( input );

    const span = spanEl();
    header.append( span );

    const footer = footerEl();
    footer.classList.add( 'footer--section' )
    let button = null

    if ( input.value || item?.list?.length ) {
        button = newArticleBtn()
        footer.append( button );
    } else {
        button = newSectionBtn()
        footer.append( button );
    }
    if ( !input.value ) {
        button.disabled = true
    }


    section.appendChild( footer );

    const btn = document.querySelector( '.board > .addSection' )

    if ( btn ) {
        btn.parentNode.insertBefore( section, btn )
    } else {
        board.appendChild( section );
    }

    if ( item && item.list.length ) {
        for ( const article in item.list ) {
            // console.log( 'article: ', item.list[ article ] )
            prepareArticle( item.id, item.list[ article ].id )
        }
    }

    input.addEventListener( "focusout", sectionTitle );
    if ( !input.value ) {
        input.focus()
    } else {
        addDnDHandlers( section );
    };

}

function prepareArticle( sectionId, articleId ) {
    // console.log( ' === prepareArticle: ' )
    // console.log( ' sectionId: ', sectionId, '\n' )
    // console.log( ' articleId: ', articleId, '\n' )

    const item = getStoreItem( sectionId )
    // console.log( ' item: ', item, '\n' )
    const subItem = item.data.list.find( ( ar ) => ar.id == articleId )

    // console.log( ' subItem: ', subItem, '\n' )

    const section = document.querySelector( '[data-id="' + sectionId + '"]' );
    const article = articleEl()

    const header = headerEl();
    article.classList.add( 'title--article' )

    const input = inputEl();
    input.value = subItem ? subItem.title : ''
    input.setAttribute( "value", input.value );
    header.prepend( input );

    if ( subItem && subItem.id ) {
        article.dataset.id = subItem.id
    }

    const span = spanEl();
    header.append( span );
    span.addEventListener( 'click', editArticle )

    article.prepend( header );

    if ( sectionId ) {
        const header = section.querySelector( 'header' )
        header.after( article )
    }

    input.addEventListener( "focusout", articleTitle );
    if ( !input.value.length ) {
        input.focus()
    } else {
        addDnDHandlers( article );

    };
}


// Title methods   #############################
const sectionTitle = ( e ) => {
    const section = e.target.parentNode.parentNode
    const id = section.dataset.id
    const val = e.target.value.trimStart()
    const boardBtn = document.querySelector( '.board > .addSection' )

    if ( val ) {
        if ( getStoreItem( id ) ) {
            let item = getStoreItem( id )
            item.data.title = val
            updateStoreItem( item )
        } else {
            const newId = id ? id : + Date.now()
            e.target.parentNode.parentNode.dataset.id = newId
            const item = { id: newId, title: val, list: [] }
            addStoreItem( item )
            if ( listArray.length < 4 ) prepareSection()
        }

        const addSectionBtn = section.querySelector( '.addSection' )
        if ( addSectionBtn ) {
            addSectionBtn.before( newArticleBtn() )
            addSectionBtn.remove()
        }
        if ( listArray.length == 4 ) {
            if ( !boardBtn ) {
                board.appendChild( newSectionBtn() )
            }
            if ( searchBar ) {
                searchBar.style.display = 'block'
            }
        }
        addDnDHandlers( section )
    }

    if ( !val && getStoreItem( id ) ) e.target.value = getStoreItem( id ).title

    if ( !val && !id && listArray.length == 3 ) {
        e.target.parentNode.parentNode.remove()
        if ( !boardBtn ) {
            board.appendChild( newSectionBtn() )
            board.querySelector( '.board > .addSection' ).disabled = false
        }
    }
}
const articleTitle = ( e ) => {

    // console.log( ' === val:', e )

    const section = e.target.closest( 'section' )
    const sectionId = section.dataset.id
    const articleId = e.target.parentNode.parentNode.dataset.id
    const val = e.target.value.trimStart()



    console.log( 'sectionId: ', sectionId )
    if ( val ) {

        e.target.setAttribute( "value", val );

        console.log( ' articleTitle val:', e.target )

        if ( getStoreItem( sectionId ) ) {
            console.log( ' === val:', val )

            let item = getStoreItem( sectionId ).data
            const article = item.list.find( ( ar ) => ar.id == articleId );
            if ( !article ) {
                const id = + Date.now()
                e.target.parentNode.parentNode.dataset.id = id
                item.list.push( { id: id, title: val, section: sectionId } )
                updateStoreItem( item )
            } else {
                const idx = item.list.findIndex( x => x.id == articleId );
                item.list[ idx ].title = val
                updateStoreItem( item )
            }
        }

        addDnDHandlers( e.target )
    }

    if ( section.querySelector( 'button' ) ) section.querySelector( 'button' ).disabled = false
    if ( !val && articleId ) e.target.value = getStoreItem( sectionId ).data.list.find( ( ar ) => ar.id == articleId ).title
    if ( !val && !articleId ) e.target.parentNode.parentNode.remove()
}

// DOM elements   #############################
function sectionEl() {
    const section = document.createElement( 'SECTION' );
    section.classList.add( 'section' )
    return section
}

function articleEl() {
    const article = document.createElement( 'ARTICLE' );
    article.classList.add( 'article' )
    return article
}

function headerEl() {
    const header = document.createElement( 'HEADER' );
    header.classList.add( 'header' )
    return header
}

function footerEl() {
    const footer = document.createElement( 'FOOTER' );
    footer.classList.add( 'footer' )
    return footer
}

function inputEl() {
    const input = document.createElement( 'INPUT' );
    input.placeholder = "Add Title..";
    input.setAttribute( 'type', 'text' );
    input.setAttribute( 'name', '' );
    input.setAttribute( 'value', '' );
    return input
}

function newSectionBtn() {
    const button = document.createElement( 'button' )
    button.innerText = '+ Add List'
    button.classList.add( 'addSection' )
    button.addEventListener( 'click', ( e ) => {
        last = [].slice.call( board.querySelectorAll( 'section' ) ).pop()
        if ( last.dataset.id ) {
            prepareSection()
        } else {
            last.querySelector( 'input' ).focus()
        }
    } )
    return button

}

function newArticleBtn() {
    const button = document.createElement( 'button' )
    button.innerText = '+ Add Card'
    button.classList.add( 'addArticle' )
    button.addEventListener( 'click', ( e ) => {
        e.target.disabled = true
        prepareArticle( e.target.parentNode.parentNode.dataset.id, null )
    } )
    return button
}

function spanEl() {
    const span = document.createElement( 'SPAN' );
    span.classList.add( 'menu' )
    return span
}

// Drag an Drop   #############################
function handleDragStart( e ) {
    src = e.target
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData( 'text/html', e.target.outerHTML );
    e.target.classList.add( "active" )
    if ( e.target.classList.contains( ( "section" ) ) ) {
        parentSrc = e.target.parentNode
    } else {
        parentSrc = e.target.classList.contains( '.article' ) ? e.target.parentNode : e.target.closest( ".article" ).parentNode
    }
}
function handleDragOver( e ) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
}
function handleDragEnter( e ) {
    if ( src.classList.contains( ( "section" ) ) ) {
        target = e.target.classList.contains( '.section' ) ? e.target : e.target.closest( ".section" )
        targetParent = parentSrc
        target.classList.add( 'over' )
    }
    if ( src.classList.contains( ( "article" ) ) ) {
        target = e.target.classList.contains( '.article' ) ? e.target : e.target.closest( ".article" )
        if ( target ) {
            targetParent = target.parentNode
        } else {
            target = e.target.closest( ".section" )
            targetParent = target
        }
        e.target.classList.add( 'over' )
    }
}
function handleDragLeave( e ) {
    e.target.classList.remove( 'over' )
}
function handleDragEnd() {
    if ( document.querySelector( '.active' ) ) document.querySelector( '.active' ).classList.remove( 'active' )
    if ( document.querySelector( '.over' ) ) document.querySelector( '.over' ).classList.remove( 'over' )
}
function handleDrop( e ) {
    e.stopPropagation()

    if ( targetParent.classList.contains( 'board' ) ) {
        console.log( '4::::: the section has been moved' )
        srcIdx = [ ...src.parentNode.children ].indexOf( src );
        targetIdx = [ ...target.parentNode.children ].indexOf( target );
        const fromIndex = srcIdx
        const toIndex = targetIdx
        const element = listArray.splice( fromIndex, 1 )[ 0 ];
        if ( srcIdx > targetIdx ) {
            src.after( target )
        } else {
            src.before( target )
        }
        listArray.splice( targetIdx, 0, element )

    } else {
        const prevSection = getStoreItem( parentSrc.dataset.id )
        const nextSection = getStoreItem( targetParent.dataset.id )
        const prevIdx = listArray[ prevSection.idx ].list.findIndex( ( e ) => e.id == src.dataset.id );

        const data = listArray[ prevSection.idx ].list[ prevIdx ]
        data.section = targetParent.dataset.id


        if ( target == targetParent ) {

            console.log( '1::::: article moved in section' )
            const header = targetParent.querySelector( 'header' )
            // header.insertAdjacentHTML( 'afterend', e.dataTransfer.getData( 'text/html' ) );
            // header.nextSibling.nextSibling.classList.remove( 'active' )
            // src.remove()
            header.after( src );


            listArray[ nextSection.idx ].list.push( data )
            listArray[ prevSection.idx ].list.splice( prevIdx, 1 );
            initStore( listArray )
        }

        if ( src.classList.contains( 'article' ) && target.classList.contains( 'article' ) ) {


            if ( parentSrc != targetParent ) {
                console.log( '=== 2 ::::: article moved before another article' )
                // target.insertAdjacentHTML( 'beforebegin', e.dataTransfer.getData( 'text/html' ) );
                // target.previousSibling.classList.remove( 'active' )
                // src.remove()
                target.before( src );
                // console.log( 'src: ', src )
                const nextId = listArray[ nextSection.idx ].list.findIndex( ( e ) => e.id == target.dataset.id );
                listArray[ nextSection.idx ].list.splice( nextId + 1, 0, data )
                listArray[ prevSection.idx ].list.splice( prevIdx, 1 );
            } else {
                console.log( '3::::: article moved after another article' )
                target.before( src );
                const nextId = listArray[ nextSection.idx ].list.findIndex( ( e ) => e.id == target.dataset.id );
                listArray[ nextSection.idx ].list.splice( nextId + 1, 0, data )
                listArray[ prevSection.idx ].list.splice( prevIdx, 1 );
            }

        }
    }

    initStore( listArray )

    console.log( '---------------------------' );
    console.log( 'src: ', src );
    console.log( 'parentSrc: ', parentSrc )
    console.log( '---------------------------' );
    console.log( 'target: ', target );
    console.log( 'targetParent: ', targetParent )

    if ( document.querySelector( '.active' ) ) document.querySelector( '.active' ).classList.remove( 'active' )
    if ( document.querySelector( '.over' ) ) document.querySelector( '.over' ).classList.remove( 'over' )
}

function addDnDHandlers( elem ) {
    if ( elem.draggable != true ) {
        elem.draggable = "true"
        elem.addEventListener( 'dragstart', handleDragStart, false );
        elem.addEventListener( 'dragenter', handleDragEnter, false )
        elem.addEventListener( 'dragover', handleDragOver, false );
        elem.addEventListener( 'dragleave', handleDragLeave, false );
        elem.addEventListener( 'drop', handleDrop, false );
        elem.addEventListener( 'dragend', handleDragEnd, false );
    }
}

// [ ...articles, ...sections ].forEach.call( [ ...articles, ...sections ], addDnDHandlers );


// localStorage   #############################
function getStoreItem( id ) {
    // const data = listArray.find( ( item ) => item.id == id );
    const idx = listArray.findIndex( ( e ) => e.id == id );
    const data = listArray[ idx ]

    if ( data && idx > -1 ) {
        return { data, idx }
    }
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
function initStore( store ) {
    localStorage.setItem( 'listArray', JSON.stringify( store ) );
    listArray = JSON.parse( localStorage.getItem( 'listArray' ) )
}


window.onstorage = () => {
    listArray = JSON.parse( window.localStorage.getItem( 'listArray' ) )
    console.log( listArray );
};

// Article edit

function editArticle( e ) {
    console.log( ' editArticle ' )

    const sectionId = e.target.closest( '.section' ).dataset.id
    const articleId = e.target.closest( '.article' ).dataset.id

    const closeButton = modal.querySelector( ".close-button" );
    const toggleModal = ( e ) => {
        if ( e.target === modal || e.target === closeButton ) {
            modal.classList.toggle( "show-modal" );
            modal.removeEventListener( "click", toggleModal );
            edit.removeEventListener( 'click', startEdit )
            save.removeEventListener( 'click', stopEdit )
            cancel.removeEventListener( 'click', stopEdit )
        }
    }

    // content
    const section = getStoreItem( sectionId )
    console.log( 'section: ', section.data.list )
    const idx = section.data.list.findIndex( ( e ) => e.id == articleId );
    // const article = section.data.list[ idx ]
    const article = section.data.list.find( ( ar, index ) => ar.id == articleId );
    console.log( 'article: ', article )

    const title = modal.querySelector( "input[name='title']" )
    title.value = article.title ? article.title : ''

    console.log( ' title.value: ', title.value )


    const subTitle = modal.querySelector( ".sub-title" )
    subTitle.innerText = section.data.title ? section.data.title : ''
    const description = modal.getElementsByTagName( 'textarea' )[ 0 ]
    description.value = article.description ? article.description : ''
    description.disabled = true
    // buttons
    const edit = modal.querySelector( ".edit" )
    const save = modal.querySelector( "li.save" )
    const cancel = modal.querySelector( "li.cancel" )


    modal.addEventListener( "click", toggleModal );

    title.addEventListener( 'focus', ( e ) => {
        stopEdit()
    } );

    title.addEventListener( 'focusout', ( e ) => {
        e.target.setAttribute( "value", title.value );
        if ( article.title != e.target.value ) updateStorage( { ...article, title: e.target.value } )
    } );

    const startEdit = () => {
        console.log( ' === startEdit ===' )
        edit.classList.add( 'hide' )
        description.classList.add( 'focus' )
        description.disabled = false
        description.focus()
    }

    const stopEdit = ( e ) => {
        // console.log( ' === stopEdit ===' )
        if ( e && e.target.classList.contains( 'save' ) ) {
            console.log( 'save: ' )
            if ( description.value != article.description ) updateStorage( { ...article, description: description.value } )
        }

        if ( e && e.target.classList.contains( 'cancel' ) ) {
            console.log( 'cancel: ', e.target )
            description.value = article.description ? article.description : ''
        }

        edit.classList.remove( 'hide' )
        description.classList.remove( 'focus' )
        description.disabled = true
    }

    edit.addEventListener( 'click', startEdit )
    save.addEventListener( 'click', stopEdit )
    cancel.addEventListener( 'click', stopEdit )

    function updateStorage( item ) {
        listArray[ section.idx ].list = listArray[ section.idx ].list.map( article => {
            if ( article.id == articleId ) {
                return { ...article, description: item.description, title: item.title };
            }
            return article
        } );
        updateStoreItem( listArray )
    }

    modal.classList.toggle( "show-modal" );
}


function searching( bar ) {

    bar.addEventListener( 'input', searchFor, false );

    function searchFor( e ) {
        if ( e.target.value.length > 2 ) {
            searchbarBtn.style.display = 'block'
            setTimeout( newSearch( e.target.value ), 1000 );
        }
    }

    function newSearch( word ) {
        console.log( 'word: ', word )
        const result = listArray.map( ( section ) => {
            return { ...section, list: section.list.filter( ( list ) => list.title.includes( word ) ) }
        } )

        const filtered = result.filter( article => {
            return article.list?.length;
        } );

        recreateDom( filtered )

        // ##########################
        //     const filtered = {
        //         sections: [],
        //         articles: []
        //     }
        //     listArray.map( ( section ) => {
        //         const { list, ...rest } = section;
        //         filtered.sections = [ ...new Set( [ ...filtered.sections, { list, ...rest } ] ) ];
        //         filtered.articles.push( ...section.list.filter( article => article.title.includes( word ) ) )
        //     } )
        //     recreateDom( filtered )
        // ##########################

    }

    function recreateDom( items ) {
        // console.log( items )
        board.replaceChildren()
        for ( const item in items ) prepareSection( items[ item ] )

    }
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

function Populate100() {
    const button = document.createElement( 'button' )
    button.innerText = 'Populate100'
    button.classList.add( 'btn-Populate100' )

    button.addEventListener( 'click', async () => {

        const sections = board.querySelectorAll( 'section' )
        const sectionID = sections[ 0 ].dataset.id


        if ( sectionID ) {
            const data = await fetch( 'https://jsonplaceholder.typicode.com/posts' )
                .then( ( response ) => response.json() )
                .then( ( json ) => json );

            data.map( post => {
                // console.log( 'post: ', post )
                const item = {
                    id: post.id,
                    title: post.title,
                    description: post.body,
                    section: sectionID
                }
                listArray[ 0 ].list.push( item );
                return appendArticle( item )
            } )

            function appendArticle( item ) {
                console.log( 'item: ', item )

                const article = articleEl();
                const header = headerEl();
                article.classList.add( 'title--article' );
                const input = inputEl();
                input.value = item.title ? item.title : '';
                header.prepend( input );
                article.dataset.id = item.id;
                const span = spanEl();
                header.append( span );
                article.prepend( header );
                const position = sections[ 0 ].querySelector( 'header' )
                position.after( article )
                input.addEventListener( "focusout", articleTitle );
                addDnDHandlers( article );
            }

            localStorage.setItem( 'listArray', JSON.stringify( listArray ) );
            listArray = JSON.parse( localStorage.getItem( 'listArray' ) )
        } else {
            alert( 'Please, add section title first' )
        }
    } )

    return button
}
