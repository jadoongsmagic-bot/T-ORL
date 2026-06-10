// 로컬스토리지 연동 및 상세 내용(content) 복원
let posts = JSON.parse(localStorage.getItem('torl_posts')) || [
    { 
        id: 1, 
        category: '수학', 
        title: '페르마의 마지막 정리 증명 과정 분석', 
        author: '익명의 피타고라스', 
        content: '앤드루 와일즈가 타원곡선과 모듈러성 정리를 사용하여 페르마의 마지막 정리를 증명한 과정을 고등 교육과정 수준에서 쉽게 풀어 분석해 보았습니다.', 
        likes: 13, 
        liked: false 
    },
    { 
        id: 2, 
        category: '과학', 
        title: '초전도체 마이스너 효과 실험 결과 공유', 
        author: '익명의 아인슈타인', 
        content: '로컬 실험실에서 진행한 상압 초전도 후보 물질의 자석 위 부상 실험 데이터입니다. 임계 온도에 도달했을 때 완벽한 반자성 효과를 관찰했습니다.', 
        likes: 24, 
        liked: false 
    }
];

let currentCategory = '수학';
let editingPostId = null; // 수정 중인 글의 ID 기억 변수

// 외부 클릭 시 모든 삼점 드롭다운 메뉴 닫기 규칙
window.addEventListener('click', function() {
    document.querySelectorAll('.more-dropdown').forEach(dd => dd.style.display = 'none');
});

function enterMainApp() {
    document.getElementById('intro-screen').style.display = 'none';
    document.querySelector('.app-container').style.display = 'flex';
    document.querySelector('.fab-group').style.display = 'block';
    renderPosts(currentCategory);
}

function backToIntro() {
    document.getElementById('intro-screen').style.display = 'flex';
    document.querySelector('.app-container').style.display = 'none';
    document.querySelector('.fab-group').style.display = 'none';
}

function selectCategory(category, element) {
    currentCategory = category;
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    renderPosts(currentCategory);
}

// 브라우저 차단 경고창 대신 부드러운 커스텀 모달 팝업 열기
function triggerArchiveAlert() {
    document.getElementById('modal-archive').style.display = 'flex';
}

// 카드 렌더링 (삼점 버튼 및 이벤트 완벽 복원)
function renderPosts(category) {
    const resultsArea = document.getElementById('results-area');
    if(!resultsArea) return;
    resultsArea.innerHTML = '';
    
    const filtered = posts.filter(p => p.category === category);
    
    if (filtered.length === 0) {
        resultsArea.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:#999; margin-top:40px;">등록된 연구 자료가 없습니다.</p>';
        return;
    }

    filtered.forEach(post => {
        const card = document.createElement('div');
        card.className = 'post-card';
        // 카드 자체를 클릭하면 상세 보기 모달 팝업이 뜹니다.
        card.onclick = () => openViewModal(post.id);
        
        card.innerHTML = `
            <span class="post-category">${post.category}</span>
            <!-- 삼점(⋮) 메뉴 버튼 구성 복원 -->
            <div class="more-container">
                <button class="more-btn" onclick="toggleDropdown(event, ${post.id})">⋮</button>
                <div id="dropdown-${post.id}" class="more-dropdown">
                    <button onclick="copyPost(event, ${post.id})">복사</button>
                    <button onclick="editPost(event, ${post.id})">수정</button>
                    <button onclick="deletePost(event, ${post.id})">삭제</button>
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

// 글 상세 보기 팝업 엔진
function openViewModal(id) {
    const post = posts.find(p => p.id === id);
    if(!post) return;
    document.getElementById('view-category').innerText = post.category;
    document.getElementById('view-title').innerText = post.title;
    document.getElementById('view-author').innerText = `By ${post.author}`;
    document.getElementById('view-content').innerText = post.content || "상세 연구 내용이 없습니다.";
    document.getElementById('modal-view').style.display = 'flex';
}

// 삼점 메뉴 열기/닫기 제어
function toggleDropdown(event, id) {
    event.stopPropagation(); // 카드 클릭 상세보기가 같이 실행되지 않도록 방지
    document.querySelectorAll('.more-dropdown').forEach(dd => {
        if(dd.id !== `dropdown-${id}`) dd.style.display = 'none';
    });
    const dd = document.getElementById(`dropdown-${id}`);
    if(dd) {
        dd.style.display = dd.style.display === 'block' ? 'none' : 'block';
    }
}

// 복사 기능
function copyPost(event, id) {
    event.stopPropagation();
    const post = posts.find(p => p.id === id);
    if(!post) return;
    const text = `[${post.category}] ${post.title}\nBy ${post.author}\n\n${post.content || ''}`;
    navigator.clipboard.writeText(text).then(() => {
        alert('📋 연구 기록이 클립보드에 복사되었습니다!');
    });
}

// 수정 기능 (작성 창을 재활용하여 진짜 수정이 이루어집니다)
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

// 삭제 기능
function deletePost(event, id) {
    event.stopPropagation();
    if(confirm('이 연구 기록을 정말 삭제하시겠습니까?')) {
        posts = posts.filter(p => p.id !== id);
        localStorage.setItem('torl_posts', JSON.stringify(posts));
        renderPosts(currentCategory);
    }
}

// 검색 엔진
function searchPosts() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = posts.filter(p => p.category === currentCategory);
    const cards = document.querySelectorAll('#results-area .post-card');
    
    filtered.forEach((post, index) => {
        if(cards[index]) {
            const match = post.title.toLowerCase().includes(query) || post.author.toLowerCase().includes(query);
            cards[index].style.display = match ? 'block' : 'none';
        }
    });
}

function toggleLike(event, postId) {
    event.stopPropagation(); // 카드 클릭 상세보기 방지
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
        renderPosts(currentCategory);
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
        // [수정 모드] 기존 데이터 갱신
        const post = posts.find(p => p.id === editingPostId);
        if (post) {
            post.title = title;
            post.author = author || '익명의 연구원';
            post.content = content;
        }
        editingPostId = null;
    } else {
        // [새 글 모드] 데이터 추가
        const newPost = {
            id: Date.now(),
            category: category,
            title: title,
            author: author || '익명의 연구원',
            content: content,
            likes: 0,
            liked: false
        };
        posts.unshift(newPost);
    }

    localStorage.setItem('torl_posts', JSON.stringify(posts));
    closeSpecificModal('modal-step2');
    currentCategory = category;
    
    document.querySelectorAll('.category-btn').forEach(btn => {
        if (btn.textContent === category) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    renderPosts(currentCategory);
}

