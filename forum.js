// ============================================================
//  FORUM SCRIPT — Mystiks
//  Depends on: Firebase compat SDK (app + auth + database)
// ============================================================

// ──────────────────────────────────────────────
// STEP 1 — REPLACE WITH YOUR FIREBASE CONFIG
// Firebase Console → Project Settings → Your apps
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
// Init Firebase
// ──────────────────────────────────────────────
firebase.initializeApp(firebaseConfig);
var auth     = firebase.auth();
var db       = firebase.database();
var postsRef = db.ref('forum/posts');

// ──────────────────────────────────────────────
// State
// ──────────────────────────────────────────────
var currentUser     = null;   // Firebase user object, or null
var currentCategory = 'all';
var currentSort     = 'new';
var allPosts        = {};
var openReplies     = {};
var replyListeners  = {};

// ──────────────────────────────────────────────
// Auth state observer — drives all UI changes
// ──────────────────────────────────────────────
auth.onAuthStateChanged(function (user) {
    currentUser = user;

    var guestBar  = document.getElementById('authBarGuest');
    var userBar   = document.getElementById('authBarUser');
    var nameSpan  = document.getElementById('authBarName');
    var compose   = document.getElementById('forumCompose');
    var gate      = document.getElementById('forumGate');
    var authorFld = document.getElementById('postAuthor');

    if (user) {
        // ── Logged in ──
        var displayName = getUserDisplayName(user);

        guestBar.style.display = 'none';
        userBar.style.display  = 'flex';
        nameSpan.textContent   = displayName;

        compose.style.display = 'block';
        gate.style.display    = 'none';

        if (authorFld) authorFld.value = displayName;

        closeAuthModal();
        showToast('Signed in as ' + displayName);
    } else {
        // ── Logged out ──
        guestBar.style.display = 'flex';
        userBar.style.display  = 'none';

        compose.style.display = 'none';
        gate.style.display    = 'flex';
    }

    // Always re-render so reply boxes reflect auth state
    renderPosts();
});

function getUserDisplayName(user) {
    if (user.displayName) return user.displayName;
    // Fallback: part before @ in email
    return user.email ? user.email.split('@')[0] : 'Member';
}

// ──────────────────────────────────────────────
// Auth modal helpers
// ──────────────────────────────────────────────
function openAuthModal(tab) {
    switchAuthTab(tab || 'login');
    document.getElementById('authOverlay').classList.add('open');
}

function closeAuthModal(e) {
    // If called from overlay click, only close when clicking the backdrop itself
    if (e && e.target !== document.getElementById('authOverlay')) return;
    document.getElementById('authOverlay').classList.remove('open');
    clearAuthErrors();
}

function switchAuthTab(tab) {
    var isLogin = (tab === 'login');
    document.getElementById('authPanelLogin').style.display    = isLogin ? 'block' : 'none';
    document.getElementById('authPanelRegister').style.display = isLogin ? 'none'  : 'block';
    document.getElementById('tabLogin').classList.toggle('active',    isLogin);
    document.getElementById('tabRegister').classList.toggle('active', !isLogin);
    clearAuthErrors();
}

function clearAuthErrors() {
    ['loginError', 'regError'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) { el.textContent = ''; el.classList.remove('visible'); }
    });
}

function showAuthError(id, msg) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.classList.add('visible');
}

// ──────────────────────────────────────────────
// Register
// ──────────────────────────────────────────────
function doRegister() {
    var username = document.getElementById('regUsername').value.trim();
    var email    = document.getElementById('regEmail').value.trim();
    var password = document.getElementById('regPassword').value;

    if (!username) { showAuthError('regError', 'Choose a display name.'); return; }
    if (!email)    { showAuthError('regError', 'Enter your email.');       return; }
    if (password.length < 6) { showAuthError('regError', 'Password must be at least 6 characters.'); return; }

    var btn = document.getElementById('regBtn');
    btn.disabled = true;
    btn.textContent = 'Creating\u2026';

    auth.createUserWithEmailAndPassword(email, password)
        .then(function (cred) {
            // Save display name to Firebase Auth profile
            return cred.user.updateProfile({ displayName: username });
        })
        .then(function () {
            // Also save to database for reference
            var uid = auth.currentUser.uid;
            return db.ref('users/' + uid).set({
                username: username,
                email:    email,
                joinedAt: firebase.database.ServerValue.TIMESTAMP
            });
        })
        .catch(function (err) {
            showAuthError('regError', friendlyAuthError(err.code));
            btn.disabled = false;
            btn.textContent = 'Create Account';
        });
}

// ──────────────────────────────────────────────
// Login
// ──────────────────────────────────────────────
function doLogin() {
    var email    = document.getElementById('loginEmail').value.trim();
    var password = document.getElementById('loginPassword').value;

    if (!email)    { showAuthError('loginError', 'Enter your email.');    return; }
    if (!password) { showAuthError('loginError', 'Enter your password.'); return; }

    var btn = document.getElementById('loginBtn');
    btn.disabled = true;
    btn.textContent = 'Signing in\u2026';

    auth.signInWithEmailAndPassword(email, password)
        .catch(function (err) {
            showAuthError('loginError', friendlyAuthError(err.code));
            btn.disabled = false;
            btn.textContent = 'Sign In';
        });
}

// ──────────────────────────────────────────────
// Sign out
// ──────────────────────────────────────────────
function signOut() {
    auth.signOut().then(function () {
        showToast('Signed out.');
    });
}

// ──────────────────────────────────────────────
// Friendly Firebase error messages
// ──────────────────────────────────────────────
function friendlyAuthError(code) {
    var map = {
        'auth/email-already-in-use':    'That email is already registered.',
        'auth/invalid-email':           'That email address is invalid.',
        'auth/weak-password':           'Password is too weak.',
        'auth/user-not-found':          'No account found with that email.',
        'auth/wrong-password':          'Incorrect password.',
        'auth/invalid-credential':      'Incorrect email or password.',
        'auth/too-many-requests':       'Too many attempts. Try again later.',
        'auth/network-request-failed':  'Network error. Check your connection.'
    };
    return map[code] || 'Something went wrong. Please try again.';
}

// ──────────────────────────────────────────────
// Keyboard shortcut: Esc closes modal
// ──────────────────────────────────────────────
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAuthModal();
});

// ──────────────────────────────────────────────
// Character counter
// ──────────────────────────────────────────────
document.getElementById('postBody').addEventListener('input', function () {
    document.getElementById('charCount').textContent = this.value.length + ' / 1800';
});

// ──────────────────────────────────────────────
// Submit a new post (requires auth)
// ──────────────────────────────────────────────
function submitPost() {
    if (!currentUser) { openAuthModal('login'); return; }

    var author   = getUserDisplayName(currentUser);
    var category = document.getElementById('postCategory').value;
    var subject  = document.getElementById('postSubject').value.trim();
    var body     = document.getElementById('postBody').value.trim();

    if (!subject) { showToast('Add a subject before posting.'); return; }
    if (!body)    { showToast('Your message is empty.');        return; }

    var btn = document.getElementById('submitPostBtn');
    btn.disabled = true;
    btn.textContent = 'Posting\u2026';

    postsRef.push({
        author:   author,
        uid:      currentUser.uid,
        category: category,
        subject:  subject,
        body:     body,
        score:    0,
        replies:  0,
        ts:       firebase.database.ServerValue.TIMESTAMP
    }, function (err) {
        if (err) {
            showToast('Failed to post. Check your connection.');
        } else {
            document.getElementById('postSubject').value = '';
            document.getElementById('postBody').value    = '';
            document.getElementById('charCount').textContent = '0 / 1800';
            showToast('Your message has been received.');
        }
        btn.disabled = false;
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
    document.querySelectorAll('.forum-tab').forEach(function (t) { t.classList.remove('active'); });
    btn.classList.add('active');
    renderPosts();
}

function setSort(sort, btn) {
    currentSort = sort;
    document.querySelectorAll('.forum-sort-btn').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    renderPosts();
}

// ──────────────────────────────────────────────
// Render post list
// ──────────────────────────────────────────────
function renderPosts() {
    var container = document.getElementById('forumPosts');
    if (!container) return;

    var entries = Object.keys(allPosts).map(function (id) {
        return { id: id, data: allPosts[id] };
    });

    if (currentCategory !== 'all') {
        entries = entries.filter(function (e) { return e.data.category === currentCategory; });
    }

    if (currentSort === 'new') {
        entries.sort(function (a, b) { return (b.data.ts || 0) - (a.data.ts || 0); });
    } else {
        entries.sort(function (a, b) { return (b.data.score || 0) - (a.data.score || 0); });
    }

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

    // Detach all existing reply listeners before wiping the DOM.
    // Without this, stale handles in replyListeners block re-attachment
    // after the DOM nodes are replaced.
    Object.keys(replyListeners).forEach(function (pid) {
        db.ref('forum/replies/' + pid).off('value', replyListeners[pid]);
    });
    replyListeners = {};

    var html = '';
    entries.forEach(function (e) { html += buildPostHTML(e.id, e.data); });
    container.innerHTML = html;

    // Re-open any panels that were open before the re-render
    Object.keys(openReplies).forEach(function (pid) {
        if (openReplies[pid]) {
            var panel = document.getElementById('replies-' + pid);
            if (panel) { panel.classList.add('open'); loadReplies(pid); }
        }
    });
}

// ──────────────────────────────────────────────
// Build a single post HTML
// ──────────────────────────────────────────────
var categoryLabels = {
    encounters: 'Encounters',
    theories:   'Theories',
    locations:  'Locations',
    artifacts:  'Artifacts',
    misc:       'Misc'
};

var preview    = (post.body || '').substring(0, 1800) +
                 (post.body && post.body.length > 1800 ? '\u2026' : '');
    var timeStr    = post.ts ? formatTime(post.ts) : '';
    var catLabel   = categoryLabels[post.category] || post.category || '';
    var replyCount = post.replies || 0;

    // Reply area: composer if logged in, gate if not
    var replyArea;
    if (currentUser) {
        replyArea =
            '<div class="forum-reply-compose">' +
                '<input type="text" id="reply-input-' + id + '" placeholder="Your reply\u2026" maxlength="600" />' +
                '<button class="forum-reply-send" onclick="submitReply(\'' + id + '\')">Reply</button>' +
            '</div>';
    } else {
        replyArea =
            '<div class="reply-gate">' +
                '<span>Sign in to reply.</span>' +
                '<button class="reply-gate-link" onclick="openAuthModal(\'login\')">Sign In</button>' +
            '</div>';
    }

    return (
        '<div class="forum-post" id="post-' + id + '">' +

            '<div class="forum-post-vote">' +
                '<button class="vote-btn" onclick="vote(\'' + id + '\', 1)" title="Upvote">&#9650;</button>' +
                '<span class="vote-score" id="score-' + id + '">' + (post.score || 0) + '</span>' +
                '<button class="vote-btn" onclick="vote(\'' + id + '\', -1)" title="Downvote">&#9660;</button>' +
            '</div>' +

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

            '<div class="forum-reply-count">' +
                '<span class="rcount-num" id="rcount-' + id + '">' + replyCount + '</span>' +
                '<span class="rcount-label">replies</span>' +
            '</div>' +

            '<div class="forum-replies-panel" id="replies-' + id + '">' +
                '<div class="forum-replies-inner">' +
                    '<div id="reply-list-' + id + '"><div class="forum-loading">Loading\u2026</div></div>' +
                    replyArea +
                '</div>' +
            '</div>' +

        '</div>'
    );
}

// ──────────────────────────────────────────────
// Toggle replies panel
// ──────────────────────────────────────────────
function toggleReplies(pid) {
    var panel = document.getElementById('replies-' + pid);
    if (!panel) return;

    if (panel.classList.contains('open')) {
        panel.classList.remove('open');
        openReplies[pid] = false;
        // Detach and remove so loadReplies can attach a fresh listener on next open
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
// Load replies in real time
// ──────────────────────────────────────────────
function loadReplies(pid) {
    // Always attach a fresh listener (stale ones were cleaned in renderPosts)
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
                        ' &#160;&#183;&#160; ' + escHtml(formatTime(r.ts)) +
                    '</div>' +
                    '<p class="forum-reply-text">' + escHtml(r.text || '') + '</p>' +
                '</div>';
        });
        list.innerHTML = html;
    });
}

// ──────────────────────────────────────────────
// Submit a reply (requires auth)
// ──────────────────────────────────────────────
function submitReply(pid) {
    if (!currentUser) { openAuthModal('login'); return; }

    var input = document.getElementById('reply-input-' + pid);
    if (!input) return;

    var text = input.value.trim();
    if (!text) { showToast('Write something first.'); return; }

    db.ref('forum/replies/' + pid).push({
        author: getUserDisplayName(currentUser),
        uid:    currentUser.uid,
        text:   text,
        ts:     firebase.database.ServerValue.TIMESTAMP
    }, function (err) {
        if (!err) {
            input.value = '';
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
// Vote (requires auth)
// ──────────────────────────────────────────────
function vote(pid, delta) {
    if (!currentUser) { openAuthModal('login'); return; }
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
    setTimeout(function () { t.classList.remove('show'); }, 3200);
}
