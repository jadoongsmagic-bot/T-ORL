let posts = JSON.parse(localStorage.getItem('torl_posts')) || [
    {
        id: 1717000000001,
        category: '수학',
        title: '페르마의 마지막 정리 증명 과정 분석',
        author: '익명의 피타고라스',
        content: '앤드루 와일즈가 타원곡선과 모듈러성 정리를 사용하여 페르마의 마지막 정리를 증명한 과정을 고등 교육과정 수준에서 쉽게 풀어 분석해 보았습니다...',
        likes: 12,
        likedUsers: []
    },
    {
        id: 1717000000002,
        category: '과학',
        title: '초전도체 마이스너 효과 실험 결과 공유',
        author: '익명의 아인슈타인',
        content: '로컬 실험실에서 진행한 상압 초전도 후보 물질의 자석 위 부상 실험 데이터입니다. 임계 온도에 도달했을 때 완벽한 반자성 효과를 관찰했습니다.',
        likes: 24,
        likedUsers: []
    }
];

let currentCategory = '수학'; 

window.onload = function() {
    renderPosts();
    autoBindSidebarButtons(); // HTML 변경 없이 돌아가기, 보관함 글자를 추적해서 기능을 심어주는 마법 기능
};

// 🪄 사이드바의 '돌아가기', '보관함' 기능 자동 연결 엔진
function autoBindSidebarButtons() {
    const allElements = document.getElementsByTagName('*');
    for (let el of allElements) {
        if (el.innerText && el.innerText.includes('돌아가기')) {
            el.style.cursor = 'pointer';
            el.onclick = function() { goBackToIntro(); };
        }
        if (el.innerText && el.innerText.includes('보관함')) {
            el.style.cursor = 'pointer';
            el.onclick = function() { openArchiveAlert(); };
        }
    }
}

function goBackToIntro() {
    const intro = document.getElementById('intro-screen');
    if (intro) {
        intro.style.display = 'flex';
        setTimeout(() => { intro.style.opacity = '1'; }, 10);
    } else {
        alert('메인 화면 리로드 중...');
        window.location.reload();
    }
}

function openArchiveAlert() {
    alert('🗂️ 연구 보관함 안내\n\n현재 작성하신 모든 연구 기록은 이미 실시간으로 이 기기(로컬 스토리지)에 100% 영구 안전 저장되고 있으며 메인 화면에 바로 나타납니다!\n\n따로 모아보는 별도의 전용 보관함 창 기능은 다음 업데이트 버전에 반영될 예정입니다.');
}

function enterMainApp() {
    const intro = document.getElementById('intro-screen');
    if(intro) {
        intro.style.opacity = '0';
        setTimeout(() => { intro.style.display = 'none'; }, 500);
    }
}

function changeCategory(category) {
    currentCategory = category;
    document.querySelectorAll('.subject-btn').forEach(btn => btn.classList.remove('active'));
    renderPosts();
}

function renderPosts() {
    const resultsArea = document.getElementById('results-area');
    if(!resultsArea) return;
    resultsArea.innerHTML = '';
    
    const filtered = posts.filter(post => post.category === currentCategory);
    
    if(filtered.length === 0) {
        resultsArea.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:#9a8e87; margin-top:40px;">등록된 연구 자료가 없습니다. 첫 글을 작성해 보세요!</p>`;
        return;
    }
    
    filtered.forEach(post => {
        const isLiked = post.likedUsers && post.likedUsers.includes('me') ? 'liked' : '';
        
        const card = document.createElement('div');
        card.className = 'post-card';
        
        card.innerHTML = `
            <div class="card-category">${post.category}</div>
            <div class="card-title">${post.title}</div>
            <div class="card-author">By ${post.author}</div>
            <div class="card-actions">
                <button class="like-btn ${isLiked}" onclick="toggleLike(event, ${post.id})">
                    <span class="like-count">👍 ${post.likes}</span>
                </button>
            </div>
        `;
        resultsArea.appendChild(card);
    });
}

function openStep1() { 
    const step1 = document.getElementById('modal-step1');
    if(step1) step1.style.display = 'flex'; 
}

function openStep2(category) {
    const step1 = document.getElementById('modal-step1');
    if(step1) step1.style.display = 'none';
    const step2 = document.getElementById('modal-step2');
    if(step2) {
        step2.style.display = 'flex';
        const modalTitle = document.querySelector('#modal-step2 h3');
        if(modalTitle) modalTitle.innerText = `${category} 연구 기록하기`;
        step2.dataset.category = category;
    }
}

function closeSpecificModal(id) { 
    const modal = document.getElementById(id);
    if(modal) modal.style.display = 'none'; 
}

function savePostData() {
    const authorInput = document.querySelector('#modal-step2 input[placeholder*="작성자"]');
    const titleInput = document.querySelector('#modal-step2 input[placeholder*="제목"]');
    const contentInput = document.querySelector('#modal-step2 textarea');
    const step2 = document.getElementById('modal-step2');
    
    const author = authorInput ? authorInput.value.trim() : '익명의 연구원';
    const title = titleInput ? titleInput.value.trim() : '';
    const content = contentInput ? contentInput.value.trim() : '';
    const category = step2 ? step2.dataset.category : '수학';
    
    if(!title || !content) {
        alert('제목과 내용을 모두 작성해 주세요!');
        return;
    }
    
    const newPost = {
        id: Date.now(),
        category: category,
        title: title,
        author: author || '익명의 연구원',
        content: content,
        likes: 0,
        likedUsers: []
    };
    
    posts.unshift(newPost);
    localStorage.setItem('torl_posts', JSON.stringify(posts));
    renderPosts();
    closeSpecificModal('modal-step2');
    
    if(authorInput) authorInput.value = '';
    if(titleInput) titleInput.value = '';
    if(contentInput) contentInput.value = '';
}

function toggleLike(event, id) {
    event.stopPropagation(); 
    const post = posts.find(p => p.id === id);
    if(!post) return;
    
    if(!post.likedUsers) post.likedUsers = [];
    
    if(post.likedUsers.includes('me')) {
        post.likedUsers = post.likedUsers.filter(u => u !== 'me');
        post.likes = Math.max(0, post.likes - 1);
    } else {
        post.likedUsers.push('me');
        post.likes += 1;
    }
    
    localStorage.setItem('torl_posts', JSON.stringify(posts));
    renderPosts();
}
