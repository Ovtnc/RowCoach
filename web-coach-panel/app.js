// Configuration
const API_BASE_URL = 'http://161.97.132.240:3000/api';

// State
let authToken = localStorage.getItem('authToken');
let coachName = localStorage.getItem('coachName');
let clubs = [];
let selectedClubId = localStorage.getItem('selectedClubId') || null;

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const registerScreen = document.getElementById('registerScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const logoutBtn = document.getElementById('logoutBtn');
const trainingForm = document.getElementById('trainingForm');
const trainingsListContent = document.getElementById('trainingsListContent');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const coachNameSpan = document.getElementById('coachName');
const userForm = document.getElementById('userForm');
const clubForm = document.getElementById('clubForm');
const clubSelectorHeader = document.getElementById('clubSelectorHeader');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
    setupTypeToggle();
});

function checkAuth() {
    if (authToken) {
        showDashboard();
    } else {
        showLogin();
    }
}

function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    logoutBtn.addEventListener('click', handleLogout);
    trainingForm.addEventListener('submit', handleAddTraining);
    editForm.addEventListener('submit', handleUpdateTraining);
    if (userForm) {
        userForm.addEventListener('submit', handleCreateUser);
    }
    if (clubForm) {
        clubForm.addEventListener('submit', handleCreateClub);
    }
    
    // Club selector change (header)
    if (clubSelectorHeader) {
        clubSelectorHeader.addEventListener('change', (e) => {
            selectedClubId = e.target.value;
            localStorage.setItem('selectedClubId', selectedClubId);
            loadTrainings();
            updateUserClubSelector();
        });
    }
    
    // Close modal
    document.querySelector('.close').addEventListener('click', closeEditModal);
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
}

function setupTypeToggle() {
    const trainingType = document.getElementById('trainingType');
    const ergoDataGroup = document.getElementById('ergoDataGroup');
    
    trainingType.addEventListener('change', () => {
        if (trainingType.value === 'ergo') {
            ergoDataGroup.style.display = 'block';
        } else {
            ergoDataGroup.style.display = 'none';
        }
    });

    const editType = document.getElementById('editType');
    const editErgoDataGroup = document.getElementById('editErgoDataGroup');
    
    editType.addEventListener('change', () => {
        if (editType.value === 'ergo') {
            editErgoDataGroup.style.display = 'block';
        } else {
            editErgoDataGroup.style.display = 'none';
        }
    });
}

// Auth Functions
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        }).catch(err => {
            console.error('Network error:', err);
            throw new Error('Backend sunucusuna bağlanılamadı. Lütfen backend\'in çalıştığından emin olun (port 3000).');
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({ error: 'Sunucu hatası' }));
            throw new Error(data.error || 'Giriş başarısız');
        }

        const data = await response.json();

        authToken = data.token;
        coachName = data.user.name;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('coachName', coachName);

        showDashboard();
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.add('active');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;
    const errorDiv = document.getElementById('registerError');
    const successDiv = document.getElementById('registerSuccess');

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email, 
                password, 
                name, 
                role,
                source: 'web' // Indicate this is from web panel
            }),
        }).catch(err => {
            console.error('Network error:', err);
            throw new Error('Backend sunucusuna bağlanılamadı. Lütfen backend\'in çalıştığından emin olun (port 3000).');
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({ error: 'Sunucu hatası' }));
            throw new Error(data.error || 'Kayıt başarısız');
        }

        const data = await response.json();

        // Auto login after registration
        authToken = data.token;
        coachName = data.user.name;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('coachName', coachName);

        successDiv.textContent = 'Kayıt başarılı! Yönlendiriliyorsunuz...';
        successDiv.classList.add('active');
        errorDiv.classList.remove('active');

        setTimeout(() => {
            showDashboard();
        }, 1500);
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.add('active');
        successDiv.classList.remove('active');
    }
}

function handleLogout() {
    authToken = null;
    coachName = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('coachName');
    showLogin();
}

function showLogin() {
    loginScreen.classList.add('active');
    registerScreen.classList.remove('active');
    dashboardScreen.classList.remove('active');
    loginForm.reset();
    document.getElementById('loginError').classList.remove('active');
}

function showRegister() {
    loginScreen.classList.remove('active');
    registerScreen.classList.add('active');
    dashboardScreen.classList.remove('active');
    registerForm.reset();
    document.getElementById('registerError').classList.remove('active');
    document.getElementById('registerSuccess').classList.remove('active');
}

// Page Navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.add('active');
    }
    
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Find and activate corresponding nav item
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((item, index) => {
        const pages = ['createClub', 'createUser', 'createTraining', 'trainingsList', 'myClubs'];
        if (pages[index] === pageId) {
            item.classList.add('active');
        }
    });
    
    // Load data if needed
    if (pageId === 'trainingsList') {
        loadTrainings();
    } else if (pageId === 'myClubs') {
        loadMyClubs();
    }
}

// Global functions for onclick handlers
window.showLogin = showLogin;
window.showRegister = showRegister;
window.showPage = showPage;

async function showDashboard() {
    loginScreen.classList.remove('active');
    registerScreen.classList.remove('active');
    dashboardScreen.classList.add('active');
    coachNameSpan.textContent = coachName || 'Antrenör';
    await loadClubs();
    showPage('createClub'); // Default to create club page
}

// Club Functions
async function loadClubs() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Kullanıcı bilgileri yüklenemedi');
        }

        const data = await response.json();
        clubs = data.user.clubs || [];
        
        // Update club selector
        updateClubSelector();
        
        // If no club selected and clubs exist, select first one
        if (!selectedClubId && clubs.length > 0) {
            selectedClubId = clubs[0]._id || clubs[0].id;
            localStorage.setItem('selectedClubId', selectedClubId);
        }
    } catch (error) {
        console.error('Error loading clubs:', error);
    }
}

async function loadMyClubs() {
    const clubsListContent = document.getElementById('clubsListContent');
    if (!clubsListContent) return;

    clubsListContent.innerHTML = '<div class="loading">Yükleniyor...</div>';

    try {
        // Load clubs from profile
        const profileResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        }).catch(err => {
            console.error('Network error loading profile:', err);
            throw new Error('Backend sunucusuna bağlanılamadı. Lütfen backend\'in çalıştığından emin olun (port 3000).');
        });

        if (!profileResponse.ok) {
            const errorData = await profileResponse.json().catch(() => ({ error: 'Sunucu hatası' }));
            throw new Error(errorData.error || 'Klüpler yüklenemedi');
        }

        const profileData = await profileResponse.json();
        const clubIds = profileData.user?.clubs || [];

        if (clubIds.length === 0) {
            clubsListContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🏢</div>
                    <p>Henüz klüp oluşturmadınız</p>
                </div>
            `;
            return;
        }

        // Load full club details with invitation codes
        const clubsWithDetails = await Promise.all(
            clubIds.map(async (clubId) => {
                try {
                    const clubIdValue = clubId._id || clubId.id || clubId;
                    const clubResponse = await fetch(`${API_BASE_URL}/clubs/${clubIdValue}`, {
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Content-Type': 'application/json',
                        },
                    }).catch(err => {
                        console.error('Network error loading club:', err);
                        throw new Error('Backend sunucusuna bağlanılamadı. Lütfen backend\'in çalıştığından emin olun (port 3000).');
                    });

                    if (!clubResponse.ok) {
                        const errorData = await clubResponse.json().catch(() => ({ error: 'Sunucu hatası' }));
                        console.error('Error loading club:', errorData);
                        return null;
                    }

                    const clubData = await clubResponse.json();
                    return clubData.club;
                } catch (error) {
                    console.error('Error loading club details:', error);
                    return null;
                }
            })
        );

        const validClubs = clubsWithDetails.filter(club => club !== null);

        if (validClubs.length === 0) {
            clubsListContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🏢</div>
                    <p>Klüp bilgileri yüklenemedi</p>
                </div>
            `;
            return;
        }

        clubsListContent.innerHTML = validClubs.map(club => `
            <div class="club-card">
                <div class="club-card-header">
                    <div>
                        <h3 class="club-card-title">${club.name || 'İsimsiz Klüp'}</h3>
                        ${club.description ? `<p class="club-card-description">${club.description}</p>` : ''}
                        ${club.location ? `<p class="club-card-location">📍 ${club.location}</p>` : ''}
                    </div>
                    <div class="club-badges">
                        ${club.isPublic ? '<span class="badge badge-public">Herkese Açık</span>' : '<span class="badge badge-private">Özel</span>'}
                    </div>
                </div>
                <div class="invitation-code-section">
                    <div class="invitation-code-label">Davet Kodu:</div>
                    <div class="invitation-code-container">
                        <code class="invitation-code">${club.invitationCode || 'Yükleniyor...'}</code>
                        <button class="btn btn-copy" onclick="copyInvitationCode('${club.invitationCode}', this)">
                            <span class="copy-icon">📋</span>
                            <span class="copy-text">Kopyala</span>
                        </button>
                    </div>
                    <div class="invitation-code-hint">Bu kodu paylaşarak kullanıcılar klübe katılabilir</div>
                </div>
                <div class="club-stats">
                    <div class="stat-item">
                        <span class="stat-label">Üyeler:</span>
                        <span class="stat-value">${club.members?.length || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Antrenörler:</span>
                        <span class="stat-value">${club.coaches?.length || 0}</span>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading clubs:', error);
        let errorMessage = error.message || 'Bilinmeyen bir hata oluştu';
        
        // Provide more helpful error messages
        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
            errorMessage = 'Backend sunucusuna bağlanılamadı. Lütfen backend\'in çalıştığından emin olun (port 3000).';
        }
        
        clubsListContent.innerHTML = `
            <div class="error-message active">
                Klüpler yüklenirken bir hata oluştu: ${errorMessage}
            </div>
        `;
    }
}

function copyInvitationCode(code, button) {
    if (!code || code === 'Yükleniyor...') return;

    navigator.clipboard.writeText(code).then(() => {
        const originalText = button.querySelector('.copy-text').textContent;
        button.querySelector('.copy-text').textContent = 'Kopyalandı!';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.querySelector('.copy-text').textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Copy failed:', err);
        alert('Kopyalama başarısız. Davet kodu: ' + code);
    });
}

// Make copyInvitationCode available globally
window.copyInvitationCode = copyInvitationCode;

function updateClubSelector() {
    // Update header selector
    if (clubSelectorHeader) {
        clubSelectorHeader.innerHTML = '';
        
        if (clubs.length === 0) {
            clubSelectorHeader.innerHTML = '<option value="">Klüp bulunamadı</option>';
        } else {
            clubs.forEach(club => {
                const option = document.createElement('option');
                option.value = club._id || club.id;
                option.textContent = club.name;
                if (selectedClubId === (club._id || club.id)) {
                    option.selected = true;
                }
                clubSelectorHeader.appendChild(option);
            });
        }
    }
    
    updateUserClubSelector();
}

function updateUserClubSelector() {
    const selector = document.getElementById('userClubId');
    if (!selector) return;
    
    selector.innerHTML = '';
    
    if (clubs.length === 0) {
        selector.innerHTML = '<option value="">Klüp bulunamadı</option>';
        return;
    }
    
    clubs.forEach(club => {
        const option = document.createElement('option');
        option.value = club._id || club.id;
        option.textContent = club.name;
        selector.appendChild(option);
    });
}

// Club Functions
async function handleCreateClub(e) {
    e.preventDefault();
    const errorDiv = document.getElementById('clubFormError');
    const successDiv = document.getElementById('clubFormSuccess');

    const clubData = {
        name: document.getElementById('clubName').value,
        description: document.getElementById('clubDescription').value,
        location: document.getElementById('clubLocation').value,
        isPublic: document.getElementById('clubIsPublic').checked,
    };

    try {
        const response = await fetch(`${API_BASE_URL}/clubs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(clubData),
        }).catch(err => {
            console.error('Network error:', err);
            throw new Error('Backend sunucusuna bağlanılamadı.');
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({ error: 'Sunucu hatası' }));
            throw new Error(data.error || 'Klüp oluşturulamadı');
        }

        successDiv.textContent = 'Klüp başarıyla oluşturuldu!';
        successDiv.classList.add('active');
        errorDiv.classList.remove('active');
        
        clubForm.reset();
        
        // Reload clubs
        await loadClubs();
        
        setTimeout(() => {
            successDiv.classList.remove('active');
        }, 3000);
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.add('active');
        successDiv.classList.remove('active');
    }
}

// Training Functions
async function loadTrainings() {
    if (!trainingsListContent) return;
    
    trainingsListContent.innerHTML = '<div class="loading">Yükleniyor...</div>';

    if (!selectedClubId) {
        trainingsListContent.innerHTML = '<div class="empty-state"><p>Lütfen bir klüp seçin</p></div>';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/trainings/coach?clubId=${selectedClubId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Antrenmanlar yüklenemedi');
        }

        const trainings = await response.json();
        displayTrainings(trainings);
    } catch (error) {
        if (trainingsListContent) {
            trainingsListContent.innerHTML = `<div class="error-message active">${error.message}</div>`;
        }
    }
}

function displayTrainings(trainings) {
    if (!trainingsListContent) return;
    
    if (trainings.length === 0) {
        trainingsListContent.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📅</div>
                <p>Henüz antrenman eklenmemiş</p>
            </div>
        `;
        return;
    }

    trainingsListContent.innerHTML = trainings.map(training => {
        const date = new Date(training.date);
        const typeLabels = {
            water: '🌊 Su',
            ergo: '🏋️ Ergo',
            custom: '📝 Özel'
        };

        return `
            <div class="training-card">
                <div class="training-info">
                    <div class="training-title">${training.title}</div>
                    <div class="training-meta">
                        <span>📅 ${formatDate(date)}</span>
                        <span class="training-type">${typeLabels[training.type]}</span>
                    </div>
                    ${training.description ? `<p style="margin-top: 8px; color: var(--text-secondary);">${training.description}</p>` : ''}
                    ${training.distance ? `<span style="font-size: 14px; color: var(--text-tertiary);">Mesafe: ${training.distance}m</span>` : ''}
                </div>
                <div class="training-actions">
                    <button class="btn btn-secondary btn-icon" onclick="openEditModal('${training._id}')">✏️</button>
                    <button class="btn btn-danger btn-icon" onclick="deleteTraining('${training._id}')">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

async function handleAddTraining(e) {
    e.preventDefault();
    const errorDiv = document.getElementById('formError');
    const successDiv = document.getElementById('formSuccess');

    if (!selectedClubId) {
        errorDiv.textContent = 'Lütfen bir klüp seçin';
        errorDiv.classList.add('active');
        return;
    }

    const training = {
        title: document.getElementById('trainingTitle').value,
        description: document.getElementById('trainingDescription').value,
        date: document.getElementById('trainingDate').value,
        type: document.getElementById('trainingType').value,
        clubId: selectedClubId,
        distance: document.getElementById('trainingDistance').value ? parseInt(document.getElementById('trainingDistance').value) : undefined,
        duration: document.getElementById('trainingDuration').value ? parseFloat(document.getElementById('trainingDuration').value) * 60 : undefined,
        ergoDataId: document.getElementById('ergoDataId').value || undefined,
    };

    try {
        const response = await fetch(`${API_BASE_URL}/trainings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(training),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Antrenman eklenemedi');
        }

        successDiv.textContent = 'Antrenman başarıyla eklendi!';
        successDiv.classList.add('active');
        errorDiv.classList.remove('active');
        
        trainingForm.reset();
        document.getElementById('ergoDataGroup').style.display = 'none';
        
        setTimeout(() => {
            successDiv.classList.remove('active');
        }, 3000);

        loadTrainings();
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.add('active');
        successDiv.classList.remove('active');
    }
}

function openEditModal(trainingId) {
    fetch(`${API_BASE_URL}/trainings/coach`, {
        headers: {
            'Authorization': `Bearer ${authToken}`,
        },
    })
    .then(res => res.json())
    .then(trainings => {
        const training = trainings.find(t => t._id === trainingId);
        if (!training) return;

        const date = new Date(training.date);
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);

        document.getElementById('editId').value = training._id;
        document.getElementById('editTitle').value = training.title;
        document.getElementById('editDate').value = localDate;
        document.getElementById('editType').value = training.type;
        document.getElementById('editDescription').value = training.description || '';
        document.getElementById('editDistance').value = training.distance || '';
        document.getElementById('editDuration').value = training.duration ? (training.duration / 60) : '';
        document.getElementById('editErgoDataId').value = training.ergoDataId || '';

        if (training.type === 'ergo') {
            document.getElementById('editErgoDataGroup').style.display = 'block';
        } else {
            document.getElementById('editErgoDataGroup').style.display = 'none';
        }

        editModal.classList.add('active');
    })
    .catch(error => {
        alert('Antrenman bilgileri yüklenemedi: ' + error.message);
    });
}

function closeEditModal() {
    editModal.classList.remove('active');
    editForm.reset();
}

async function handleUpdateTraining(e) {
    e.preventDefault();
    const trainingId = document.getElementById('editId').value;

    const training = {
        title: document.getElementById('editTitle').value,
        description: document.getElementById('editDescription').value,
        date: document.getElementById('editDate').value,
        type: document.getElementById('editType').value,
        distance: document.getElementById('editDistance').value ? parseInt(document.getElementById('editDistance').value) : undefined,
        duration: document.getElementById('editDuration').value ? parseFloat(document.getElementById('editDuration').value) * 60 : undefined,
        ergoDataId: document.getElementById('editErgoDataId').value || undefined,
    };

    try {
        const response = await fetch(`${API_BASE_URL}/trainings/${trainingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(training),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Antrenman güncellenemedi');
        }

        closeEditModal();
        loadTrainings();
        alert('Antrenman başarıyla güncellendi!');
    } catch (error) {
        alert('Hata: ' + error.message);
    }
}

async function deleteTraining(trainingId) {
    if (!confirm('Bu antrenmanı silmek istediğinize emin misiniz?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/trainings/${trainingId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Antrenman silinemedi');
        }

        loadTrainings();
        alert('Antrenman başarıyla silindi!');
    } catch (error) {
        alert('Hata: ' + error.message);
    }
}

// User Functions
async function handleCreateUser(e) {
    e.preventDefault();
    const errorDiv = document.getElementById('userFormError');
    const successDiv = document.getElementById('userFormSuccess');

    const userData = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        password: document.getElementById('userPassword').value,
        role: document.getElementById('userRole').value,
        clubId: document.getElementById('userClubId').value,
    };

    if (!userData.clubId) {
        errorDiv.textContent = 'Lütfen bir klüp seçin';
        errorDiv.classList.add('active');
        successDiv.classList.remove('active');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Kullanıcı oluşturulamadı');
        }

        successDiv.textContent = 'Kullanıcı başarıyla oluşturuldu!';
        successDiv.classList.add('active');
        errorDiv.classList.remove('active');
        
        userForm.reset();
        
        setTimeout(() => {
            successDiv.classList.remove('active');
        }, 3000);
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.add('active');
        successDiv.classList.remove('active');
    }
}

function formatDate(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const trainingDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (trainingDate.getTime() === today.getTime()) {
        return 'Bugün ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    }

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (trainingDate.getTime() === tomorrow.getTime()) {
        return 'Yarın ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    }

    return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

