// 전역 변수 세팅 (브라우저 저장소인 로컬스토리지에서 데이터를 읽어오거나 비어있으면 기본 샘플 로드)
let posts = JSON.parse(localStorage.getItem('torl_posts')) || [
    {
        id: 1717000000001,
        category: '수학',
        title: '페르마의 마지막 정리 증명 과정 분석',
        author: '익명의 피타고라스',
        content: '앤드루 와일즈가 타원곡선과 모듈러성 정리를 사용하여 페르마의 마지막 정리를 증명한 과정을 고등 교육과정 수준에서 쉽게 풀어 분석해 보았습니다...',
        likes: 12,
        likedUsers: [],
        image: ''
    },
    {
        id: 1717000000002,
        category: '과학',
        title: '초전도체 마이스너 효과 실험 결과 공유',
        author: '익명의 아인슈타인',
        content: '로컬 실험실에서 진행한 상압 초전도 후보 물질의 자석 위 부상 실험 데이터입니다. 임계 온도에 도달했을 때 완벽한 반자성 효과를 관찰했습니다.',
        likes: 24,
        likedUsers: [],
        image: ''
    }
];

let currentCategory = '수학'; // 현재 보고 있는 카테고리
let currentSelectedPostId = null; // 상세 보기 중인 게시글 ID
let tempBase64Image = ""; // 사진 업로드용 임시 변수

// 앱 시작 시 초기 실행
window.onload = function() {
    renderPosts();
};

// 1단계: 인트로 화면에서 메인 앱으로 진입
function enterMainApp() {
    const intro = document.getElementById('intro-screen');
    intro.style.opacity = '0';
    setTimeout(() => {
        intro.style.display = 'none';
        document.getElementById('fabGroup').style.display = 'flex';
    }, 500);
}

// 카테고리 탭 변경
function changeCategory(category) {
    currentCategory = category;
    document.querySelectorAll('.subject-btn').forEach(btn => btn.classList.remove('active'));
    
    if(category === '수학') document.getElementById('tab-math').classList.add('active');
    if(category === '과학') document.getElementById('tab-science').classList.add('active');
    
    renderPosts();
}

// 화면에 카드 게시글 그리기 (렌더링)
function renderPosts() {
    const resultsArea = document.getElementById('results-area');
    resultsArea.innerHTML = '';
    
    // 현재 카테고리에 맞는 글만 필터링
    const filtered = posts.filter(post => post.category === currentCategory);
    
    if(filtered.length === 0) {
        resultsArea.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:#9a8e87; margin-top:40px;">등록된 연구 자료가 없습니다. 첫 글을 작성해 보세요!</p>`;
        return;
    }
    
    filtered.forEach(post => {
        const isLiked = post.likedUsers && post.likedUsers.includes('me') ? 'liked' : '';
        const thumbIcon = isLiked ? 'thumb_up' : 'thumb_up_off_alt';
        
        const card = document.createElement('div');
        card.className = 'post-card';
        card.onclick = () => openViewModal(post.id);
        
        card.innerHTML = `
            <div class="card-category">${post.category}</div>
            <div class="card-title">${post.title}</div>
            <div class="card-author">By ${post.author}</div>
            <div class="card-actions">
                <button class="like-btn ${isLiked}" onclick="toggleLike(event, ${post.id})">
                    <span class="material-icons" style="font-size:18px;">${thumbIcon}</span>
                    <span class="like-count">${post.likes}</span>
                </button>
            </div>
        `;
        resultsArea.appendChild(card);
    });
}

// 실시간 제목 검색 로직
function searchPosts() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.querySelectorAll('#results-area .post-card');
    
    cards.forEach((card, index) => {
        const filteredHTML = posts.filter(post => post.category === currentCategory);
        if(filteredHTML[index]) {
            const title = filteredHTML[index].title.toLowerCase();
            if(title.includes(query)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        }
    });
}

// 모달 제어 시스템 관련 함수들
function openStep1() { document.getElementById('modal-step1').style.display = 'flex'; }
function openStep2(category) {
    closeSpecificModal('modal-step1');
    document.getElementById('modal-step2').style.display = 'flex';
    document.getElementById('write-modal-title').innerText = `${category} 연구 기록하기`;
    document.getElementById('modal-step2').dataset.category = category;
}
function closeSpecificModal(id) { 
    document.getElementById(id).style.display = 'none'; 
    if(id === 'modal-step2') clearWriteForm();
}
function closeModalOnBackdrop(e, id) { if(e.target.id === id) closeSpecificModal(id); }

// 작성자 입력칸 알림 팝업 토글
function togglePrivacyMemo(show) {
    document.getElementById('privacy-popup').style.display = show ? 'block' : 'none';
}

// 사진 첨부 엔진 (Base64 인코딩 가상 변환)
function processImageUpload(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            tempBase64Image = e.target.result;
            document.getElementById('imgPreviewNotification').style.display = 'inline';
        };
        reader.readAsDataURL(file);
    }
}

// 입력 폼 초기화
function clearWriteForm() {
    document.getElementById('authorInput').value = '';
    document.getElementById('titleInput').value = '';
    document.getElementById('contentInput').value = '';
    document.getElementById('imageFileEngine').value = '';
    document.getElementById('imgPreviewNotification').style.display = 'none';
    tempBase64Image = "";
}

// 새 연구 데이터 업로드 저장
function savePostData() {
    const author = document.getElementById('authorInput').value.trim() || '익명의 연구원';
    const title = document.getElementById('titleInput').value.trim();
    const content = document.getElementById('contentInput').value.trim();
    const category = document.getElementById('modal-step2').dataset.category;
    
    if(!title || !content) {
        alert('제목과 내용을 모두 작성해 주세요!');
        return;
    }
    
    const newPost = {
        id: Date.now(),
        category: category,
        title: title,
        author: author,
        content: content,
        likes: 0,
        likedUsers: [],
        image: tempBase64Image
    };
    
    posts.unshift(newPost); // 최신 글을 맨 앞으로
    saveAndRefresh();
    closeSpecificModal('modal-step2');
}

// 좋아요(따봉) 토글 기능
function toggleLike(event, id) {
    event.stopPropagation(); // 카드 클릭 상세 보기 창 열림 방지
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
    
    saveAndRefresh();
}

// 상세 페이지 조회 팝업 열기
function openViewModal(id) {
    const post = posts.find(p => p.id === id);
    if(!post) return;
    
    currentSelectedPostId = id;
    document.getElementById('viewTitle').innerText = post.title;
    document.getElementById('viewInfo').innerText = `과목: ${post.category} | 작성자: ${post.author}`;
    document.getElementById('viewBody').innerText = post.content;
    
    const imgFrame = document.getElementById('viewImageFrame');
    if(post.image) {
        imgFrame.src = post.image;
        imgFrame.style.display = 'block';
    } else {
        imgFrame.style.display = 'none';
    }
    
    document.getElementById('modal-view').style.display = 'flex';
}

// 상세조회 내부 더보기 메뉴 토글
function toggleMoreMenu(e) {
    e.stopPropagation();
    const menu = document.getElementById('moreMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

// 주소 복사하기 얼럿 기능
function copyToClipboard() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        alert('공유 링크 주소가 클립보드에 복사되었습니다!');
    });
    document.getElementById('moreMenu').style.display = 'none';
}

// 글 삭제 경고 모달 열기
function openDeleteAlert() {
    document.getElementById('moreMenu').style.display = 'none';
    document.getElementById('modal-warning').style.style.display = 'flex';
}

// 진짜 데이터 영구 삭제 실행
function executeDelete() {
    posts = posts.filter(p => p.id !== currentSelectedPostId);
    saveAndRefresh();
    document.getElementById('modal-warning').style.display = 'none';
    closeSpecificModal('modal-view');
}

// 데이터 영구 보관 로컬 스토리지 동기화 및 동적 새로고침 통합 함수
function saveAndRefresh() {
    localStorage.setItem('torl_posts', JSON.stringify(posts));
    renderPosts();
}

// 외부 클릭 시 컨텍스트 메뉴 닫기용 리스너
document.addEventListener('click', function() {
    const menu = document.getElementById('moreMenu');
    if(menu) menu.style.display = 'none';
});

