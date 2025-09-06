// 전역 변수
let ideas = JSON.parse(localStorage.getItem('ideas')) || [];
let currentPlanner = localStorage.getItem('selectedPlanner') || null;
let isPlannerSelected = currentPlanner !== null;

// 기본 아이디어가 없으면 추가
if (ideas.length === 0) {
    ideas = [{
        id: 1,
        title: '나만의 포트폴리오 웹 사이트 만들기',
        description: '간단한 자기소개, 프로젝트, 연락처 정보를 소개하는 포트폴리오 웹 사이트. 모던한 디자인을 사용하고 반응형으로 제작.',
        tech: 'HTML, CSS, 바닐라 자바스크립트',
        createdAt: new Date().toISOString()
    }];
    localStorage.setItem('ideas', JSON.stringify(ideas));
}

// DOM 요소들
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');
const tabBtns = document.querySelectorAll('.tab-btn');
const plannerContents = document.querySelectorAll('.planner-content');
const promptCards = document.querySelectorAll('.prompt-card');
const ideasContainer = document.getElementById('ideas-container');
const addIdeaBtn = document.getElementById('add-idea-btn');
const ideaModal = document.getElementById('idea-modal');
const closeModalBtn = document.getElementById('close-modal');
const cancelBtn = document.getElementById('cancel-btn');
const ideaForm = document.getElementById('idea-form');
const navLogo = document.getElementById('nav-logo');
const resetBtn = document.getElementById('reset-planner-btn');
const resetModal = document.getElementById('reset-modal');
const closeResetModalBtn = document.getElementById('close-reset-modal');
const cancelResetBtn = document.getElementById('cancel-reset-btn');
const confirmResetBtn = document.getElementById('confirm-reset-btn');
const resetTabBtns = document.querySelectorAll('.reset-tab-btn');
const plannerSelectionModal = document.getElementById('planner-selection-modal');
const plannerOptions = document.querySelectorAll('.planner-option');
const selectedPlannerType = document.getElementById('selected-planner-type');

// 초기화
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupMainPageCards();
    setupPlannerSelection();
    setupPromptCards();
    setupIdeaModal();
    setupResetModal();
    setupNavLogo();
    setupDateInputs();
    loadIdeas();
    loadChecklistState();

    if (isPlannerSelected) {
        switchPlanner(currentPlanner);
        updatePlannerTypeDisplay();
        updateProgress();
    }
}

// 메인 페이지 카드 설정
function setupMainPageCards() {
    const menuCards = document.querySelectorAll('.menu-card');

    menuCards.forEach(card => {
        const sectionId = card.dataset.section;
        const menuBtn = card.querySelector('.menu-btn');

        // 카드 전체 클릭 이벤트
        card.addEventListener('click', () => {
            if (sectionId === 'planner' && !isPlannerSelected) {
                plannerSelectionModal.classList.add('active');
                return;
            }
            switchSection(sectionId);
            updateActiveNavButton(sectionId);
        });

        // 버튼 클릭 이벤트
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (sectionId === 'planner' && !isPlannerSelected) {
                plannerSelectionModal.classList.add('active');
                return;
            }
            switchSection(sectionId);
            updateActiveNavButton(sectionId);
        });
    });
}

function updateActiveNavButton(sectionId) {
    navBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === sectionId) {
            btn.classList.add('active');
        }
    });
}

// 플래너 선택 설정
function setupPlannerSelection() {
    plannerOptions.forEach(option => {
        option.addEventListener('click', () => {
            const plannerType = option.dataset.planner;
            selectPlanner(plannerType);
        });
    });
}

function selectPlanner(plannerType) {
    currentPlanner = plannerType;
    isPlannerSelected = true;

    // 로컬 스토리지에 저장
    localStorage.setItem('selectedPlanner', plannerType);

    // 플래너 전환
    switchPlanner(plannerType);
    updatePlannerTypeDisplay();
    updateProgress();

    // 모달 닫기
    plannerSelectionModal.classList.remove('active');

    // 플래너 섹션으로 이동
    switchSection('planner');
    updateActiveNavButton('planner');
}

function updatePlannerTypeDisplay() {
    const plannerNames = {
        'weekday': '5일 플래너',
        'weekend': '주말 플래너'
    };
    selectedPlannerType.textContent = plannerNames[currentPlanner];
}

// 날짜 입력 설정
function setupDateInputs() {
    const dateInputs = document.querySelectorAll('.date-input');

    dateInputs.forEach(input => {
        // 저장된 날짜 불러오기
        const savedDate = localStorage.getItem(`date_${input.id}`);
        if (savedDate) {
            input.value = savedDate;
        }

        // 날짜 변경 시 저장 및 자동 설정
        input.addEventListener('change', () => {
            localStorage.setItem(`date_${input.id}`, input.value);

            // 5일 플래너의 경우 첫날 날짜 설정 시 나머지 날짜 자동 설정
            if (input.id === 'day1-date' && input.value) {
                autoSetWeekdayDates(input.value);
            }
        });
    });
}

// 5일 플래너 날짜 자동 설정
function autoSetWeekdayDates(startDate) {
    const start = new Date(startDate);

    for (let i = 2; i <= 5; i++) {
        const nextDate = new Date(start);
        nextDate.setDate(start.getDate() + (i - 1));

        const dateString = nextDate.toISOString().split('T')[0];
        const input = document.getElementById(`day${i}-date`);

        if (input) {
            input.value = dateString;
            localStorage.setItem(`date_${input.id}`, dateString);
        }
    }
}

// 네비게이션 로고 설정
function setupNavLogo() {
    navLogo.addEventListener('click', () => {
        switchSection('home');
        updateActiveNavButton('home');
    });
}

// 네비게이션 설정
function setupNavigation() {
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const sectionId = btn.dataset.section;

            // 플래너 섹션으로 이동할 때 플래너가 선택되지 않았다면 선택 모달 표시
            if (sectionId === 'planner' && !isPlannerSelected) {
                plannerSelectionModal.classList.add('active');
                return;
            }

            switchSection(sectionId);
            updateActiveNavButton(sectionId);
        });
    });
}

function switchSection(sectionId) {
    sections.forEach(section => {
        section.classList.remove('active');
    });

    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// 플래너 탭 설정 (제거됨 - 이제 하나의 플래너만 선택 가능)

function switchPlanner(plannerType) {
    currentPlanner = plannerType;
    plannerContents.forEach(content => {
        content.classList.remove('active');
    });

    const targetPlanner = document.getElementById(`${plannerType}-planner`);
    if (targetPlanner) {
        targetPlanner.classList.add('active');
    }

    // 진행 상황 업데이트
    setTimeout(() => {
        updateProgress();
    }, 100);
}

// 프롬프트 카드 설정
function setupPromptCards() {
    const promptItems = document.querySelectorAll('.prompt-item');

    promptItems.forEach(item => {
        const copyBtn = item.querySelector('.copy-btn');

        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const prompt = item.dataset.prompt;
            copyToClipboard(prompt);
            showCopyFeedback(copyBtn);
        });

        // 아이템 전체 클릭으로도 복사 가능
        item.addEventListener('click', () => {
            const prompt = item.dataset.prompt;
            copyToClipboard(prompt);
            showCopyFeedback(copyBtn);
        });
    });
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        // 폴백: 텍스트 영역 사용
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

function showCopyFeedback(btn) {
    const originalText = btn.textContent;
    btn.textContent = '복사됨!';
    btn.style.background = '#4CAF50';

    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '#1a1a1a';
    }, 2000);
}

// 아이디어 모달 설정
function setupIdeaModal() {
    addIdeaBtn.addEventListener('click', () => {
        openModal();
    });

    closeModalBtn.addEventListener('click', () => {
        closeModal();
    });

    cancelBtn.addEventListener('click', () => {
        closeModal();
    });

    // 모달 외부 클릭으로 닫기
    ideaModal.addEventListener('click', (e) => {
        if (e.target === ideaModal) {
            closeModal();
        }
    });

    // ESC 키로 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && ideaModal.classList.contains('active')) {
            closeModal();
        }
    });

    // 폼 제출 처리
    ideaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveIdea();
    });
}

function openModal() {
    ideaModal.classList.add('active');
    document.getElementById('idea-title').focus();
}

function closeModal() {
    ideaModal.classList.remove('active');
    ideaForm.reset();

    // 수정 모드 초기화
    delete ideaModal.dataset.editId;
    document.querySelector('#idea-modal .modal-header h3').textContent = '새 아이디어 추가';
}

function saveIdea() {
    const title = document.getElementById('idea-title').value.trim();
    const description = document.getElementById('idea-description').value.trim();
    const tech = document.getElementById('idea-tech').value.trim();

    if (!title || !description) {
        alert('제목과 설명을 모두 입력해주세요.');
        return;
    }

    const editId = ideaModal.dataset.editId;

    if (editId) {
        // 수정 모드
        const ideaIndex = ideas.findIndex(idea => idea.id == editId);
        if (ideaIndex !== -1) {
            ideas[ideaIndex] = {
                ...ideas[ideaIndex],
                title,
                description,
                tech
            };
        }
    } else {
        // 새 아이디어 추가
        const newIdea = {
            id: Date.now(),
            title,
            description,
            tech,
            createdAt: new Date().toISOString()
        };
        ideas.unshift(newIdea);
    }

    saveIdeasToStorage();
    renderIdeas();
    closeModal();
}

// 리셋 모달 설정
function setupResetModal() {
    resetBtn.addEventListener('click', () => {
        openResetModal();
    });

    closeResetModalBtn.addEventListener('click', () => {
        closeResetModal();
    });

    cancelResetBtn.addEventListener('click', () => {
        closeResetModal();
    });

    // 리셋 모달 외부 클릭으로 닫기
    resetModal.addEventListener('click', (e) => {
        if (e.target === resetModal) {
            closeResetModal();
        }
    });

    // 리셋 탭 버튼 설정
    resetTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            resetTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // 리셋 확인 버튼
    confirmResetBtn.addEventListener('click', () => {
        const selectedPlanner = document.querySelector('.reset-tab-btn.active').dataset.resetPlanner;
        resetPlanner(selectedPlanner);
        closeResetModal();
    });
}

function openResetModal() {
    resetModal.classList.add('active');
    // 현재 플래너를 기본 선택으로 설정
    resetTabBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.resetPlanner === currentPlanner) {
            btn.classList.add('active');
        }
    });
}

function closeResetModal() {
    resetModal.classList.remove('active');
}

function resetPlanner(plannerType) {
    // 모든 체크박스 초기화
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        localStorage.removeItem(`checkbox_${checkbox.id}`);
    });

    // 모든 날짜 초기화
    const dateInputs = document.querySelectorAll('.date-input');
    dateInputs.forEach(input => {
        input.value = '';
        localStorage.removeItem(`date_${input.id}`);
    });

    // 플래너 전환
    switchPlanner(plannerType);
    updatePlannerTypeDisplay();

    // 진행 상황 업데이트
    updateProgress();
}

// 아이디어 렌더링
function loadIdeas() {
    renderIdeas();
}

function renderIdeas() {
    if (ideas.length === 0) {
        ideasContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #666;">
                <h3>아직 저장된 아이디어가 없습니다</h3>
                <p>새 아이디어를 추가해보세요!</p>
            </div>
        `;
        return;
    }

    ideasContainer.innerHTML = ideas.map(idea => `
        <div class="idea-card">
            <h3>${escapeHtml(idea.title)}</h3>
            <p>${escapeHtml(idea.description)}</p>
            ${idea.tech ? `<span class="idea-tech">${escapeHtml(idea.tech)}</span>` : ''}
            <div class="idea-actions">
                <button class="edit-btn" onclick="editIdea(${idea.id})">수정</button>
                <button class="delete-btn" onclick="deleteIdea(${idea.id})">삭제</button>
            </div>
        </div>
    `).join('');
}

function editIdea(id) {
    const idea = ideas.find(idea => idea.id === id);
    if (!idea) return;

    // 모달의 폼에 기존 데이터 채우기
    document.getElementById('idea-title').value = idea.title;
    document.getElementById('idea-description').value = idea.description;
    document.getElementById('idea-tech').value = idea.tech || '';

    // 수정 모드로 설정
    ideaModal.dataset.editId = id;

    // 모달 제목 변경
    document.querySelector('#idea-modal .modal-header h3').textContent = '아이디어 수정';

    // 모달 열기
    ideaModal.classList.add('active');
    document.getElementById('idea-title').focus();
}

function deleteIdea(id) {
    if (confirm('정말로 이 아이디어를 삭제하시겠습니까?')) {
        ideas = ideas.filter(idea => idea.id !== id);
        saveIdeasToStorage();
        renderIdeas();
    }
}

// 로컬 스토리지 관리
function saveIdeasToStorage() {
    localStorage.setItem('ideas', JSON.stringify(ideas));
}

// 체크리스트 상태 관리
function loadChecklistState() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        const savedState = localStorage.getItem(`checkbox_${checkbox.id}`);
        if (savedState === 'true') {
            checkbox.checked = true;
        }

        checkbox.addEventListener('change', () => {
            localStorage.setItem(`checkbox_${checkbox.id}`, checkbox.checked);
            updateProgress();
        });
    });
}

// 진행 상황 업데이트
function updateProgress() {
    const activePlanner = document.querySelector('.planner-content.active');
    if (!activePlanner) return;

    const checkboxes = activePlanner.querySelectorAll('input[type="checkbox"]');
    const totalCount = checkboxes.length;
    const completedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // 진행률 표시 업데이트
    document.getElementById('progress-percentage').textContent = `${percentage}%`;
    document.getElementById('completed-count').textContent = completedCount;
    document.getElementById('total-count').textContent = totalCount;
    document.getElementById('progress-fill').style.width = `${percentage}%`;
}

// 유틸리티 함수
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 반응형 네비게이션 (모바일)
function setupMobileNavigation() {
    const navMenu = document.querySelector('.nav-menu');
    const navContainer = document.querySelector('.nav-container');

    // 모바일에서 네비게이션 메뉴 토글
    if (window.innerWidth <= 768) {
        // 모바일 네비게이션 로직 추가 가능
    }
}

// 윈도우 리사이즈 이벤트
window.addEventListener('resize', () => {
    setupMobileNavigation();
});

// 페이지 로드 시 모바일 네비게이션 설정
setupMobileNavigation();

// 키보드 접근성 개선
document.addEventListener('keydown', (e) => {
    // Tab 키로 네비게이션 시 포커스 표시
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
});

// 성능 최적화: 디바운스 함수
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 스크롤 이벤트 최적화
const debouncedScrollHandler = debounce(() => {
    // 스크롤 관련 로직이 있다면 여기에 추가
}, 100);

window.addEventListener('scroll', debouncedScrollHandler);

// 에러 처리
window.addEventListener('error', (e) => {
    console.error('애플리케이션 오류:', e.error);
});

// 서비스 워커 등록 (PWA 지원을 위해)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // 서비스 워커 파일이 있다면 등록
        // navigator.serviceWorker.register('/sw.js');
    });
}

// 데이터 내보내기/가져오기 기능 (추가 기능)
function exportData() {
    const data = {
        ideas: ideas,
        checklists: getChecklistData(),
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-coding-planner-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function getChecklistData() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const data = {};
    checkboxes.forEach(checkbox => {
        data[checkbox.id] = checkbox.checked;
    });
    return data;
}

// 전역 함수로 내보내기 (HTML에서 사용)
window.deleteIdea = deleteIdea;
window.editIdea = editIdea;
window.exportData = exportData;
