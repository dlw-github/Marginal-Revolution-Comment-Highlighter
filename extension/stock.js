// Highlight comment if it was posted after time of last visit
// Catch error if comment is not displayed on page (for comments several layers deep)
function highlightComment(obj, last_visit) {
    var elem_id = 'blog-comment-' + obj['id'];
    var comment_date = new Date(obj['date']);

    if (last_visit < comment_date) {
        try {
            document.getElementById(elem_id).style.backgroundColor = '#DEE4E7';
            console.log('HIGHLIGHT - Author: ' + obj['author'] + ' Date: ' + obj['date']);
        }
        catch (err) {
            console.log('\tThis comment off page: Author' + obj['author'] + ' Date: ' + obj['date'] + ' ' + elem_id);
        }
    }
}


// Cycle recursively through comments JSON
// Stop where there are no child comments
function traverseJSON(obj, last_visit) {
    highlightComment(obj, last_visit);

    if (obj['children']) {
        for (let k in obj['children']) {
            traverseJSON(obj['children'][k], last_visit);
        }
    }
}


// Get time of last visit and list of page comments. 
// After highlighting new comments, update time of last visit
function findComments(last_visit) {
    console.log('SCRIPT START');
    var title = document.querySelector('.entry-title'); 
    console.log('Post title: ' + title.textContent);

    if (last_visit === 1) {
        var last_visit = localStorage.getItem('last_visit');
        last_visit = new Date(last_visit);
    }

    console.log('Last visit: ' + last_visit);

    var commentJSON = JSON.parse(document.querySelector('#comments > div > div').getAttribute('data-json'));
    for (var i = 0; i < commentJSON.length; i++) {
        traverseJSON(commentJSON[i], last_visit);
    }

    var timeNow = new Date();
    localStorage.setItem('last_visit', timeNow);
    console.log('Current time: ' + timeNow)

    handleLongThreads(last_visit);
}

// Some long comment threads are shown only after a link is clicked
// Add event listener for each long thread link 
function handleLongThreads(last_visit) {
    console.log('In handleLongThreads');
    var longThreads = document.querySelectorAll('.load-more');
    for (var i = 0; i < longThreads.length; i++) {
        var thread = longThreads[i];
        thread.addEventListener('click', function() {
            enterLongThread(thread, last_visit);
        });
    }
}


// If a long thread link is clicked, repeat highlight functions on newly shown comments
// If the user returns to the main post page, return to handleLongThreads
function enterLongThread(thread, last_visit) {
    console.log('CLICKED: ' + thread['children'][0]['href']);
    returnLink = document.querySelector('#comments > div > div > div > a');
    returnLink.addEventListener('click', function() {
        console.log('Returned to main');
        findComments(last_visit);
    });

    var commentJSON = JSON.parse(document.querySelector('#comments > div > div').getAttribute('data-json'));
    for (var i = 0; i < commentJSON.length; i++) {
        traverseJSON(commentJSON[i], last_visit);
    }
}


// Fire script after DOM has finished loading
// Send dummy parameter to distinguish between re-entering post page from its own comment thread
window.onload = function () {
    findComments(1);
}

