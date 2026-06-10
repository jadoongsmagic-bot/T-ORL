// 기본 데이터 설계 (유저 작성 여부 isMine과 보관 여부 archived 속성 포함)
let posts = JSON.parse(localStorage.getItem('torl_posts')) || [
    { 
        id: 1, 
        category: '수학', 
        title: '페르마의 마지막 정리 증명 과정 분석', 
        author: '익명의 피타고라스', 
        content: '앤드루 와일즈가 타원곡선과 모듈러성 정리를 사용하여 페르마의 마지막 정리를 증명한 과정을 고등 교육과정 수준에서 쉽게 풀어 분석해 보았습니다.', 
        likes: 14, 
        liked: false,
        archived: false,
        isMine: false
    },
    { 
        id: 2, 
        category: '과학', 
        title: '초전도체 마이스너 효과 실험 결과 공유', 
        author: '익명의 아인슈타인', 
        content: '로컬 실험실에서 진행한 상압 초전도 후보 물질의 자석 위 부상 실험 데이터입니다. 임계 온도에 도달했을 때 완벽한 반자성 효과를 관찰했습니다.', 
        likes: 24, 
        liked: false,
        archived: false,
        isMine: false
    }
];

// 데이터 하위 호환성 보정 시스템
posts = posts.map(p => {
    if (p.isMine === undefined) p.isMine = (p.id !== 1 && p.id !== 2);
    if (p.archived === undefined) p.archived = false;
    return p;
});

let viewMode = 'category'; // 'category' 또는 'archive'
let currentCategory = '수학';
let archiveTab = 'mine';   // 'mine'(쓴 글 보관함) 또는 'saved'(담은 글 보관함)
let editingPostId = null;

window.addEventListener('click', function() {
    document.querySelectorAll('.more-dropdown').forEach(dd => dd.style.display = 'none');
});

function enterMainApp() {
    document.getElementById('intro-screen').style.display = 'none';
    document.querySelector('.app-container').style.display = 'flex';
    document.querySelector('.fab-group').style.display = 'block';
    renderPosts();
}

function backToIntro() {
    document.getElementById('intro-screen').style.display = 'flex';
    document.querySelector('.app-container').style.display = 'none';
    document.querySelector('.fab-group').style.display = 'none';
}

function selectCategory(category, element) {
    viewMode = 'category';
    currentCategory = category;
    
    document.querySelectorAll('.category-btn, .menu-extra-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    
    document.getElementById('searchInput').value = '';
    renderPosts();
}

function selectArchiveView(element) {
    viewMode = 'archive';
    
    document.querySelectorAll('.category-btn, .menu-extra-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    
    document.getElementById('searchInput').value = '';
    renderPosts();
}

function setArchiveTab(tab) {
    archiveTab = tab;
    renderPosts();
}

// 데이터 매핑 및 통합 렌더링 엔진
function renderPosts() {
    const resultsArea = document.getElementById('results-area');
    const archiveTabsContainer = document.getElementById('archive-tabs-container');
    const mainTitle = document.getElementById('main-view-title');
    const mainSubtitle = document.getElementById('main-view-subtitle');
    const searchInput = document.getElementById('searchInput');
    
    if(!resultsArea) return;
    resultsArea.innerHTML = '';
    
    let displayPosts = [];
    
    if (viewMode === 'category') {
        archiveTabsContainer.style.display = 'none';
        mainTitle.innerText = "T-ORL";
        mainSubtitle.innerText = "Top Online Research Library";
        
        displayPosts = posts.filter(p => p.category === currentCategory);
    } else if (viewMode === 'archive') {
        archiveTabsContainer.style.display = 'inline-flex';
        mainTitle.innerText = "연구 보관함";
        mainSubtitle.innerText = "작성하신 소중한 연구 기록과 스크랩한 글들을 안전하게 보관 중입니다.";
        
        // 유저 피드백 반영: '쓴 글 보관함' 명칭 확정 적용
        archiveTabsContainer.innerHTML = `
            <button class="archive-tab-btn ${archiveTab === 'mine' ? 'active' : ''}" onclick="setArchiveTab('mine')">📝 쓴 글 보관함</button>
            <button class="archive-tab-btn ${archiveTab === 'saved' ? 'active' : ''}" onclick="setArchiveTab('saved')">📁 담은 글 보관함</button>
        `;
        
        if (archiveTab === 'mine') {
            displayPosts = posts.filter(p => p.isMine === true);
        } else {
            displayPosts = posts.filter(p => p.archived === true);
        }
    }
    
    // 실시간 다이렉트 검색 필터 필터링
    const query = searchInput.value.trim().toLowerCase();
    if (query) {
        displayPosts = displayPosts.filter(p => 
            p.title.toLowerCase().includes(query) || 
            p.author.toLowerCase().includes(query)
        );
    }

    if (displayPosts.length === 0) {
        let emptyMessage = '등록된 연구 자료가 없습니다.';
        if (viewMode === 'archive') {
            emptyMessage = (archiveTab === 'mine') ? '아직 직접 작성하신 글이 없습니다. 오른쪽 하단 ✏️ 버튼을 눌러 첫 글을 남겨보세요!' : '보관함에 담은 글이 없습니다. 카드의 삼점(⋮) 메뉴를 통해 마음에 드는 글을 담아보세요!';
        }
        resultsArea.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#999; margin-top:40px;">${emptyMessage}</p>`;
        return;
    }

    displayPosts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.onclick = () => openViewModal(post.id);
        
        const archiveMenuText = post.archived ? '⚠️ 보관함 해제' : '📁 보관함 저장';
        
        card.innerHTML = `
            <span class="post-category">${post.category}</span>
            <div class="more-container">
                <button class="more-btn" onclick="toggleDropdown(event, ${post.id})">⋮</button>
                <div id="dropdown-${post.id}" class="more-dropdown">
                    <button onclick="copyPost(event, ${post.id})">복사</button>
                    <button onclick="editPost(event, ${post.id})">수정</button>
                    <button onclick="toggleArchive(event, ${post.id})">${archiveMenuText}</button>
                    <button onclick="deletePost(event, ${post.id})" style="color:#ff4d4d;">삭제</button>
                </div>
            </div>
            <h3 class="post-title">${post.title}</h3>
            <p class="post-author">By ${post.author}</p>
            <button class="like-btn ${post.liked ? 'liked' : ''}" onclick="toggleLike(event, ${post.id})">
                <span class="like-icon">👍</span>
                <span class="like-count">${post.likes}</span>
            </button>
        `;
        resultsArea.appendChild(card);
    });
}

function openViewModal(id) {
    const post = posts.find(p => p.id === id);
    if(!post) return;
    document.getElementById('view-category').innerText = post.category;
    document.getElementById('view-title').innerText = post.title;
    document.getElementById('view-author').innerText = `By ${post.author}`;
    document.getElementById('view-content').innerText = post.content || "상세 연구 내용이 없습니다.";
    document.getElementById('modal-view').style.display = 'flex';
}

function toggleDropdown(event, id) {
    event.stopPropagation();
    document.querySelectorAll('.more-dropdown').forEach(dd => {
        if(dd.id !== `dropdown-${id}`) dd.style.display = 'none';
    });
    const dd = document.getElementById(`dropdown-${id}`);
    if(dd) {
        dd.style.display = dd.style.display === 'block' ? 'none' : 'block';
    }
}

function copyPost(event, id) {
    event.stopPropagation();
    const post = posts.find(p => p.id === id);
    if(!post) return;
    const text = `[${post.category}] ${post.title}\nBy ${post.author}\n\n${post.content || ''}`;
    navigator.clipboard.writeText(text).then(() => {
        alert('📋 연구 기록이 클립보드에 복사되었습니다!');
    });
}

function editPost(event, id) {
    event.stopPropagation();
    const post = posts.find(p => p.id === id);
    if(!post) return;
    
    editingPostId = id;
    openStep2(post.category);
    
    document.getElementById('write-modal-title').innerText = `${post.category} 연구 수정하기`;
    document.getElementById('authorInput').value = post.author;
    document.getElementById('titleInput').value = post.title;
    document.getElementById('contentInput').value = post.content || '';
}

// 담은 글 보관함 담기 / 해제 토글 컨트롤러
function toggleArchive(event, id) {
    event.stopPropagation();
    const post = posts.find(p => p.id === id);
    if (post) {
        post.archived = !post.archived;
        localStorage.setItem('torl_posts', JSON.stringify(posts));
        alert(post.archived ? '📁 해당 연구를 [담은 글 보관함]에 추가했습니다!' : '⚠️ 보관함에서 연구를 해제했습니다.');
        renderPosts();
    }
}

function deletePost(event, id) {
    event.stopPropagation();
    if(confirm('이 연구 기록을 정말 삭제하시겠습니까?')) {
        posts = posts.filter(p => p.id !== id);
        localStorage.setItem('torl_posts', JSON.stringify(posts));
        renderPosts();
    }
}

function searchPosts() {
    renderPosts();
}

function toggleLike(event, postId) {
    event.stopPropagation();
    const post = posts.find(p => p.id === postId);
    if (post) {
        if (post.liked) {
            post.likes = Math.max(0, post.likes - 1);
            post.liked = false;
        } else {
            post.likes++;
            post.liked = true;
        }
        localStorage.setItem('torl_posts', JSON.stringify(posts));
        renderPosts();
    }
}

function openStep1() {
    document.getElementById('modal-step1').style.display = 'flex';
}

function openStep2(category) {
    closeSpecificModal('modal-step1');
    const modal2 = document.getElementById('modal-step2');
    modal2.style.display = 'flex';
    if(!editingPostId) {
        document.getElementById('write-modal-title').innerText = `${category} 연구 기록하기`;
    }
    modal2.dataset.category = category;
}

function closeSpecificModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    if(modalId === 'modal-step2') {
        editingPostId = null;
        document.getElementById('authorInput').value = '';
        document.getElementById('titleInput').value = '';
        document.getElementById('contentInput').value = '';
    }
}

function closeModalOnBackdrop(e, id) {
    if(e.target.id === id) closeSpecificModal(id);
}

function savePostData() {
    const modal2 = document.getElementById('modal-step2');
    const category = modal2.dataset.category || '수학';
    const author = document.getElementById('authorInput').value.trim();
    const title = document.getElementById('titleInput').value.trim();
    const content = document.getElementById('contentInput').value.trim();

    if (!title || !content) {
        alert("제목과 연구 내용을 모두 입력해 주세요!");
        return;
    }

    if (editingPostId) {
        const post = posts.find(p => p.id === editingPostId);
        if (post) {
            post.title = title;
            post.author = author || '익명의 연구원';
            post.content = content;
        }
        editingPostId = null;
    } else {
        // 새로 업로드하는 글은 유저가 작성한 글(isMine: true)로 분류 판정 명시
        const newPost = {
            id: Date.now(),
            category: category,
            title: title,
            author: author || '익명의 연구원',
            content: content,
            likes: 0,
            liked: false,
            archived: false,
            isMine: true
        };
        posts.unshift(newPost);
    }

    localStorage.setItem('torl_posts', JSON.stringify(posts));
    closeSpecificModal('modal-step2');
    
    if (viewMode === 'category') {
        currentCategory = category;
        document.querySelectorAll('.category-btn').forEach(btn => {
            if (btn.textContent === category) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    }
    
    renderPosts();
}
