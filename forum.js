// ============================================================
//  FORUM SCRIPT — Mystiks
// ============================================================

// ──────────────────────────────────────────────
// ──────────────────────────────────────────────
var firebaseConfig = {
    apiKey:            "AIzaSyAix_VPeKebp8H6OEjiYDnLHBXFjD2fAJs",
    authDomain:        "mystiksriddex.firebaseapp.com",
    databaseURL:       "https://mystiksriddex-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId:         "mystiksriddex",
    storageBucket:     "mystiksriddex.firebasestorage.app",
    messagingSenderId: "669968540193",
    appId:             "1:669968540193:web:00e4b9bf5369647ba7f960"
};

// ──────────────────────────────────────────────
// Init
// ──────────────────────────────────────────────
firebase.initializeApp(firebaseConfig);
var db       = firebase.database();
var postsRef = db.ref('forum/posts');

var currentCategory = 'all';
var currentSort     = 'new';
var allPosts        = {};
var openReplies     = {};   // postId -> bool
var replyListeners  = {};   // postId -> listener handle

// ──────────────────────────────────────────────
// Character counter
// ──────────────────────────────────────────────
document.getElementById('postBody').addEventListener('input', function () {
    var len = this.value.length;
    document.getElementById('charCount').textContent = len + ' / 1800';
});

// ──────────────────────────────────────────────
// Submit a new post
// ──────────────────────────────────────────────
function submitPost() {
    var author   = (document.getElementById('postAuthor').value.trim()  || 'Anonymous');
    var category = document.getElementById('postCategory').value;
    var subject  = document.getElementById('postSubject').value.trim();
    var body     = document.getElementById('postBody').value.trim();

    if (!subject) { showToast('Add a subject before posting.'); return; }
    if (!body)    { showToast('Your message is empty.');        return; }

    var btn = document.getElementById('submitPostBtn');
    btn.disabled    = true;
    btn.textContent = 'Posting\u2026';

    var newPost = {
        author:   author,
        category: category,
        subject:  subject,
        body:     body,
        score:    0,
        replies:  0,
        ts:       firebase.database.ServerValue.TIMESTAMP
    };

    postsRef.push(newPost, function (err) {
        if (err) {
            showToast('Failed to post. Check your connection.');
        } else {
            document.getElementById('postAuthor').value  = '';
            document.getElementById('postSubject').value = '';
            document.getElementById('postBody').value    = '';
            document.getElementById('charCount').textContent = '0 / 1800';
            showToast('Your message has been received.');
        }
        btn.disabled    = false;
        btn.textContent = 'Post';
    });
}

// ──────────────────────────────────────────────
// Real-time listener on posts
// ──────────────────────────────────────────────
postsRef.on('value', function (snapshot) {
    allPosts = snapshot.val() || {};
    renderPosts();
});

// ──────────────────────────────────────────────
// Category / sort switching
// ──────────────────────────────────────────────
function switchCategory(cat, btn) {
    currentCategory = cat;
    document.querySelectorAll('.forum-tab').forEach(function (t) {
        t.classList.remove('active');
    });
    btn.classList.add('active');
    renderPosts();
}

function setSort(sort, btn) {
    currentSort = sort;
    document.querySelectorAll('.forum-sort-btn').forEach(function (b) {
        b.classList.remove('active');
    });
    btn.classList.add('active');
    renderPosts();
}

// ──────────────────────────────────────────────
// Render post list
// ──────────────────────────────────────────────
function renderPosts() {
    var container = document.getElementById('forumPosts');

    // Convert to array
    var entries = Object.keys(allPosts).map(function (id) {
        return { id: id, data: allPosts[id] };
    });

    // Filter by category
    if (currentCategory !== 'all') {
        entries = entries.filter(function (e) {
            return e.data.category === currentCategory;
        });
    }

    // Sort
    if (currentSort === 'new') {
        entries.sort(function (a, b) { return (b.data.ts || 0) - (a.data.ts || 0); });
    } else {
        entries.sort(function (a, b) { return (b.data.score || 0) - (a.data.score || 0); });
    }

    // Update count label
    document.getElementById('postCountLabel').textContent =
        entries.length + (entries.length === 1 ? ' thread' : ' threads');

    if (entries.length === 0) {
        container.innerHTML =
            '<div class="forum-empty">' +
            '<div class="forum-empty-icon">&#128123;</div>' +
            '<p>No threads here yet. Be the first to speak.</p>' +
            '</div>';
        return;
    }

    // Build HTML and inject
    var html = '';
    entries.forEach(function (entry) {
        html += buildPostHTML(entry.id, entry.data);
    });
    container.innerHTML = html;

    // Re-attach reply panels that were open before the re-render
    Object.keys(openReplies).forEach(function (pid) {
        if (openReplies[pid]) {
            var panel = document.getElementById('replies-' + pid);
            if (panel) {
                panel.classList.add('open');
                loadReplies(pid);
            }
        }
    });
}

// ──────────────────────────────────────────────
// Build a single post's HTML string
// ──────────────────────────────────────────────
var categoryLabels = {
    encounters: 'Encounters',
    theories:   'Theories',
    locations:  'Locations',
    support:  'Support',
    misc:       'Misc'
};

function buildPostHTML(id, post) {
    var preview    = (post.body || '').substring(0, 160) +
                     (post.body && post.body.length > 160 ? '\u2026' : '');
    var timeStr    = post.ts ? formatTime(post.ts) : '';
    var catLabel   = categoryLabels[post.category] || post.category || '';
    var replyCount = post.replies || 0;

    return (
        '<div class="forum-post" id="post-' + id + '">' +

            // ── Vote column
            '<div class="forum-post-vote">' +
                '<button class="vote-btn" onclick="vote(\'' + id + '\', 1)" title="Upvote">&#9650;</button>' +
                '<span class="vote-score" id="score-' + id + '">' + (post.score || 0) + '</span>' +
                '<button class="vote-btn" onclick="vote(\'' + id + '\', -1)" title="Downvote">&#9660;</button>' +
            '</div>' +

            // ── Post body
            '<div class="forum-post-body">' +
                '<div class="forum-post-meta-top">' +
                    '<span class="forum-tag-pill">' + escHtml(catLabel) + '</span>' +
                '</div>' +
                '<p class="forum-post-subject" onclick="toggleReplies(\'' + id + '\')">' +
                    escHtml(post.subject || '(untitled)') +
                '</p>' +
                '<p class="forum-post-preview">' + escHtml(preview) + '</p>' +
                '<div class="forum-post-footer">' +
                    '<span class="forum-post-author">by <span>' + escHtml(post.author || 'Anonymous') + '</span></span>' +
                    '<span class="forum-post-time">' + escHtml(timeStr) + '</span>' +
                    '<button class="reply-toggle-btn" onclick="toggleReplies(\'' + id + '\')">' +
                        'Replies (' + replyCount + ')' +
                    '</button>' +
                '</div>' +
            '</div>' +

            // ── Reply count column
            '<div class="forum-reply-count">' +
                '<span class="rcount-num" id="rcount-' + id + '">' + replyCount + '</span>' +
                '<span class="rcount-label">replies</span>' +
            '</div>' +

            // ── Inline replies panel (hidden by default)
            '<div class="forum-replies-panel" id="replies-' + id + '">' +
                '<div class="forum-replies-inner">' +
                    '<div id="reply-list-' + id + '"><div class="forum-loading">Loading\u2026</div></div>' +
                    '<div class="forum-reply-compose">' +
                        '<input type="text" id="reply-input-' + id + '" placeholder="Your reply\u2026" maxlength="600" />' +
                        '<input type="text" id="reply-author-' + id + '" placeholder="Name" maxlength="40" style="max-width:130px" />' +
                        '<button class="forum-reply-send" onclick="submitReply(\'' + id + '\')">Reply</button>' +
                    '</div>' +
                '</div>' +
            '</div>' +

        '</div>'
    );
}

// ──────────────────────────────────────────────
// Toggle replies panel open / closed
// ──────────────────────────────────────────────
function toggleReplies(pid) {
    var panel = document.getElementById('replies-' + pid);
    if (!panel) return;

    if (panel.classList.contains('open')) {
        panel.classList.remove('open');
        openReplies[pid] = false;
        // Detach Firebase listener to avoid leaks
        if (replyListeners[pid]) {
            db.ref('forum/replies/' + pid).off('value', replyListeners[pid]);
            delete replyListeners[pid];
        }
    } else {
        panel.classList.add('open');
        openReplies[pid] = true;
        loadReplies(pid);
    }
}

// ──────────────────────────────────────────────
// Load replies in real time for a post
// ──────────────────────────────────────────────
function loadReplies(pid) {
    if (replyListeners[pid]) return; // already listening

    var ref = db.ref('forum/replies/' + pid);
    replyListeners[pid] = ref.on('value', function (snap) {
        var list = document.getElementById('reply-list-' + pid);
        if (!list) return;

        var replies = snap.val();
        if (!replies) {
            list.innerHTML =
                '<p style="font-family:\'IBM Plex Mono\',monospace;font-size:10.5px;' +
                'color:var(--muted);letter-spacing:0.1em;margin:0 0 10px">No replies yet.</p>';
            return;
        }

        var arr = Object.keys(replies).map(function (k) { return replies[k]; });
        arr.sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); });

        var html = '';
        arr.forEach(function (r) {
            html +=
                '<div class="forum-reply-item">' +
                    '<div class="forum-reply-author-line">' +
                        '<span>' + escHtml(r.author || 'Anonymous') + '</span>' +
                        ' &nbsp;&#183;&nbsp; ' +
                        escHtml(formatTime(r.ts)) +
                    '</div>' +
                    '<p class="forum-reply-text">' + escHtml(r.text || '') + '</p>' +
                '</div>';
        });
        list.innerHTML = html;
    });
}

// ──────────────────────────────────────────────
// Submit a reply to a post
// ──────────────────────────────────────────────
function submitReply(pid) {
    var input  = document.getElementById('reply-input-'  + pid);
    var aInput = document.getElementById('reply-author-' + pid);
    if (!input) return;

    var text   = input.value.trim();
    var author = (aInput && aInput.value.trim()) || 'Anonymous';
    if (!text) { showToast('Write something first.'); return; }

    db.ref('forum/replies/' + pid).push({
        author: author,
        text:   text,
        ts:     firebase.database.ServerValue.TIMESTAMP
    }, function (err) {
        if (!err) {
            input.value = '';
            // Increment reply counter on the parent post
            db.ref('forum/posts/' + pid + '/replies').transaction(function (cur) {
                return (cur || 0) + 1;
            });
            showToast('Reply posted.');
        } else {
            showToast('Failed to post reply.');
        }
    });
}

// ──────────────────────────────────────────────
// Vote on a post
// ──────────────────────────────────────────────
function vote(pid, delta) {
    db.ref('forum/posts/' + pid + '/score').transaction(function (cur) {
        return (cur || 0) + delta;
    });
}

// ──────────────────────────────────────────────
// Utilities
// ──────────────────────────────────────────────
function escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatTime(ts) {
    if (!ts) return '';
    var now  = Date.now();
    var diff = Math.floor((now - ts) / 1000);
    if (diff < 60)    return 'just now';
    if (diff < 3600)  return Math.floor(diff / 60)   + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600)  + 'h ago';
    var d = new Date(ts);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function showToast(msg) {
    var t = document.getElementById('forum-toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 3000);
}
