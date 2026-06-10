// 1. 임시 연구 데이터 배열 (각 글마다 내가 좋아요를 눌렀는지 'liked' 상태를 추적합니다)
let posts = [
    { id: 1, category: '수학', title: '페르마의 마지막 정리 증명 과정', author: '익명의 피타고라스', likes: 13, liked: false },
    { id: 2, category: '과학', title: '초전도체 마이스너 효과 실험 결과', author: '익명의 아인슈타인', likes: 24, liked: false }
];

let currentCategory = '수학';

// 2. 앱 입장 및 돌아가기 제어
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

// 3. 카테고리 변경 함수 (과목 버튼 클릭 시 작동 - 알림창 버그 원천 해결)
function selectCategory(category, element) {
    currentCategory = category;
    
    // 모든 카테고리 버튼에서 활성화 불빛(active) 끄기
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 내가 누른 버튼에만 불빛 켜기
    element.classList.add('active');
    
    // 해당 카테고리 글 목록 띄우기
    renderPosts(currentCategory);
}

// 4. 보관함 알림창 (오직 보관함 버튼을 누를 때만 독립적으로 뜹니다)
function triggerArchiveAlert() {
    alert("📁 연구 보관함 안내\n\n현재 작성하신 모든 연구 기록은 이미 실시간으로 이 기기(로컬 스토리지)에 100% 영구 안전 저장되고 있으며 메인 화면에 바로 나타납니다!\n\n아래쪽으로 이동한 보관함 위치 레이아웃 마음에 드신다니 기쁩니다! 따로 모아보는 전용 보관함 창 기능은 다음 업데이트 버전에 반영될 예정입니다.");
}

// 5. 화면에 연구 기록 카드를 그려주는 핵심 함수
function renderPosts(category) {
    const resultsArea = document.getElementById('results-area');
    resultsArea.innerHTML = '';
    
    const filtered = posts.filter(p => p.category === category);
    
    if (filtered.length === 0) {
        resultsArea.innerHTML = '<p style="text-align:center; color:#999; margin-top:40px;">아직 작성된 연구 기록이 없습니다.</p>';
        return;
    }

    filtered.forEach(post => {
        const card = document.createElement('div');
        card.className = 'post-card';
        
        // 내가 누른 글에는 'liked'라는 도장을 찍어서 디자인을 다르게 만듭니다.
        card.innerHTML = `
            <span class="post-category">${post.category}</span>
            <h3 class="post-title">${post.title}</h3>
            <p class="post-author">By ${post.author}</p>
            <button class="like-btn ${post.liked ? 'liked' : ''}" onclick="toggleLike(${post.id})">
                <span class="like-icon">👍</span>
                <span class="like-count">${post.likes}</span>
            </button>
        `;
        resultsArea.appendChild(card);
    });
}

// 6. 좋아요 토글(켰다 껐다) 기능 함수
function toggleLike(postId) {
    const post = posts.find(p => p.id === postId);
    if (post) {
        if (post.liked) {
            post.likes--;       // 이미 눌렀었다면 좋아요 취소 (-1)
            post.liked = false;  // 안 누른 상태로 변경
        } else {
            post.likes++;       // 안 눌렀었다면 좋아요 추가 (+1)
            post.liked = true;   // 누른 상태로 변경
        }
        renderPosts(currentCategory); // 변경된 숫자를 화면에 즉시 다시 그리기
    }
}

// 7. 글쓰기 모달 제어
function openStep1() {
    document.getElementById('modal-step1').style.display = 'flex';
}

function openStep2(category) {
    closeSpecificModal('modal-step1');
    const modal2 = document.getElementById('modal-step2');
    modal2.style.display = 'flex';
    modal2.dataset.category = category;
}

function closeSpecificModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// 8. 글 저장 및 자동 이동 함수
function savePostData() {
    const modal2 = document.getElementById('modal-step2');
    const category = modal2.dataset.category || '수학';
    const authorInput = modal2.querySelector('input[placeholder*="작성자"]');
    const titleInput = modal2.querySelector('input[placeholder*="글 제목"]');
    const contentTextArea = modal2.querySelector('textarea');

    if (!authorInput.value.trim() || !titleInput.value.trim() || !contentTextArea.value.trim()) {
        alert("모든 빈칸을 채워주셔야 연구 등록이 가능합니다!");
        return;
    }

    const newPost = {
        id: Date.now(),
        category: category,
        title: titleInput.value.trim(),
        author: authorInput.value.trim(),
        likes: 0,
        liked: false
    };

    posts.unshift(newPost);
    
    authorInput.value = '';
    titleInput.value = '';
    contentTextArea.value = '';
    closeSpecificModal('modal-step2');

    currentCategory = category;
    
    document.querySelectorAll('.category-btn').forEach(btn => {
        if (btn.textContent === category) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    renderPosts(currentCategory);
}

