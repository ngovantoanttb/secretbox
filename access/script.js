const app = document.getElementById('app');

const state = {
    currentScreen: 'greeting',
    error: '',
    progress: 0,
    userName: '',
    isSpecialPerson: false
};

const agreeAudio = new Audio('./access/music/hbbd.mp3');
const rejectAudio = new Audio('./access/music/tuchoi.mp3');
const altMusicAudio = new Audio('./access/music/music.mp3');

// Preload hình ảnh các câu hỏi để tránh bị trễ khi tải
const preloadedImages = [];
for (let i = 1; i <= 10; i++) {
    const img = new Image();
    img.src = `./access/quest/${i}.png`;
    preloadedImages.push(img);
}

function playAgreeMusic() {
    agreeAudio.play().catch(e => console.log('Không thể phát nhạc:', e));
changeScreen('letter');
}

function playRejectMusic() {
    rejectAudio.play().catch(e => console.log('Không thể phát nhạc:', e));
    changeScreen('rejected');
}

function playRejectEarlyMusic() {
    rejectAudio.play().catch(e => console.log('Không thể phát nhạc:', e));
    changeScreen('reject_questions');
}

function playAltMusic() {
    altMusicAudio.play().catch(e => console.log('Không thể phát nhạc:', e));
    changeScreen('letter_alt');
}

// Hàm loại bỏ dấu tiếng Việt để kiểm tra đáp án dễ hơn
function removeAccents(str) {
    return str.normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

const screens = {
    greeting: {
        render: () => `
            <h2>Chào Mừng! 🎈</h2>
            <p>Hòm thư bí mật này chứa đựng những điều đặc biệt.</p>
            <p>Hãy ấn nút bên dưới để bắt đầu nhé!</p>
            <br>
            <button onclick="changeScreen('nameCheck')">Bắt đầu</button>
        `
    },
    nameCheck: {
        render: () => `
            <h2>Xác nhận danh tính 🌸</h2>
            <p>Hãy nhập tên của bạn vào đây</p>
            <input type="text" id="answer" placeholder="Nhập tên..." autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkName()">Tiếp tục</button>
        `
    },
    dobCheck: {
        render: () => `
            <h2>Xin chào bạn ${state.userName}! 👋</h2>
            <p>Mời bạn trả lời câu tiếp theo để xác nhận nhé.</p>
            <p>Bạn sinh ngày tháng năm nào?</p>
            <input type="text" id="answer" placeholder="VD: DD/MM/YYYY" autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkDob()">Tiếp tục</button>
        `
    },
    notification: {
        render: () => `
            <h2>Thông báo 📢</h2>
            <p>Để nhận được phần quà, bạn cần tham gia trả lời loạt câu hỏi thử thách nhé!</p>
            <br>
            <button onclick="changeScreen('q1')">Bắt đầu tham gia</button>
            <button class="secondary-btn" onclick="playRejectEarlyMusic()">Từ chối</button>
        `
    },
    reject_questions: {
        render: () => `
            <h2>Cảm ơn bạn đã ghé qua! 👋</h2>
            <p>Rất tiếc vì bạn không thể tham gia thử thách. Chúc bạn ngày tốt lành</p>
            <br>
            <button onclick="resetGame()">Quay lại màn hình chính</button>
        `
    },
    q1: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 10%"></div></div>
            <h2>Câu hỏi 1 😈</h2>
            <p>Hình nào khác với hình còn lại?</p>
            <img src="./access/quest/1.png" alt="Câu hỏi 1" class="question-img">
            <div class="error-msg">${state.error}</div>
            <div class="options-grid">
                <button class="option-btn" onclick="checkChoice('A', 'C', 'q2', 'Sai rồi! Hãy thử lại nhé.')">A</button>
                <button class="option-btn" onclick="checkChoice('B', 'C', 'q2', 'Sai rồi! Hãy thử lại nhé.')">B</button>
                <button class="option-btn" onclick="checkChoice('C', 'C', 'q2', 'Đúng rồi! Bạn thật tinh mắt.')">C</button>
                <button class="option-btn" onclick="checkChoice('D', 'C', 'q2', 'Sai rồi! Hãy thử lại nhé.')">D</button>
                <button class="option-btn" onclick="checkChoice('E', 'C', 'q2', 'Sai rồi! Hãy thử lại nhé.')">E</button>
            </div>
        `
    },
    q2: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 20%"></div></div>
            <h2>Câu hỏi 2 🤯</h2>
            <p>Cho hình bên trái. Hình bên trái còn thiếu hình nào trong số các hình sau?</p>
            <img src="./access/quest/2.png" alt="Câu hỏi 2" class="question-img">
            <div class="error-msg">${state.error}</div>
            <div class="options-grid">
                <button class="option-btn" onclick="checkChoice('A', 'B', 'q3', 'Sai rồi! Hãy thử lại nhé.')">A</button>
                <button class="option-btn" onclick="checkChoice('B', 'B', 'q3', 'Đúng rồi! Bạn thật tinh mắt.')">B</button>
                <button class="option-btn" onclick="checkChoice('C', 'B', 'q3', 'Sai rồi! Hãy thử lại nhé.')">C</button>
                <button class="option-btn" onclick="checkChoice('D', 'B', 'q3', 'Sai rồi! Hãy thử lại nhé.')">D</button>
                <button class="option-btn" onclick="checkChoice('E', 'B', 'q3', 'Sai rồi! Hãy thử lại nhé.')">E</button>
            </div>
        `
    },
    q3: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 30%"></div></div>
            <h2>Câu hỏi 3 🕵️</h2>
            <p>Số còn thiếu ở chỗ dấu chấm hỏi là số nào?</p>
            <img src="./access/quest/3.png" alt="Câu hỏi 3" class="question-img">
            <div class="error-msg">${state.error}</div>
            <div class="options-grid">
                <button class="option-btn" onclick="checkChoice('A', 'B', 'q4', 'Sai rồi! Hãy thử lại nhé.')">A</button>
                <button class="option-btn" onclick="checkChoice('B', 'B', 'q4', 'Đúng rồi! Bạn thật tinh mắt.')">B</button>
                <button class="option-btn" onclick="checkChoice('C', 'B', 'q4', 'Sai rồi! Hãy thử lại nhé.')">C</button>
                <button class="option-btn" onclick="checkChoice('D', 'B', 'q4', 'Sai rồi! Hãy thử lại nhé.')">D</button>
            </div>
        `
    },
    q4: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 40%"></div></div>
            <h2>Câu hỏi 4 🔠</h2>
            <p>Cho hình bên trái. Hình bên trái còn thiếu hình nào trong số các hình sau (bên phải)?</p>
            <img src="./access/quest/4.png" alt="Câu hỏi 4" class="question-img">
            <div class="error-msg">${state.error}</div>
            <div class="options-grid">
                <button class="option-btn" onclick="checkChoice('A', 'D', 'q5', 'Sai rồi! Hãy thử lại nhé.')">A</button>
                <button class="option-btn" onclick="checkChoice('B', 'D', 'q5', 'Sai rồi! Hãy thử lại nhé.')">B</button>
                <button class="option-btn" onclick="checkChoice('C', 'D', 'q5', 'Sai rồi! Hãy thử lại nhé.')">C</button>
                <button class="option-btn" onclick="checkChoice('D', 'D', 'q5', 'Đúng rồi! Bạn thật tinh mắt.')">D</button>
                <button class="option-btn" onclick="checkChoice('E', 'D', 'q5', 'Sai rồi! Hãy thử lại nhé.')">E</button>
                <button class="option-btn" onclick="checkChoice('F', 'D', 'q5', 'Sai rồi! Hãy thử lại nhé.')">F</button>
            </div>
        `
    },
    q5: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 50%"></div></div>
            <h2>Câu hỏi 5 ➗</h2>
            <p>Hình lục giác nào trong số các hình A, B, C, D và E có thể thêm vào một dấu chấm sao cho cả hai dấu chấm đáp ứng được cùng điều kiện như hai dấu chấm trong hình lục giác bên trái?</p>
            <img src="./access/quest/5.png" alt="Câu hỏi 5" class="question-img">
            <div class="error-msg">${state.error}</div>
            <div class="options-grid">
                <button class="option-btn" onclick="checkChoice('A', 'D', 'q6', 'Sai rồi! Hãy thử lại nhé.')">A</button>
                <button class="option-btn" onclick="checkChoice('B', 'D', 'q6', 'Sai rồi! Hãy thử lại nhé.')">B</button>
                <button class="option-btn" onclick="checkChoice('C', 'D', 'q6', 'Sai rồi! Hãy thử lại nhé.')">C</button>
                <button class="option-btn" onclick="checkChoice('D', 'D', 'q6', 'Đúng rồi! Bạn thật tinh mắt.')">D</button>
                <button class="option-btn" onclick="checkChoice('E', 'D', 'q6', 'Sai rồi! Hãy thử lại nhé.')">E</button>
            </div>
        `
    },
    q6: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 60%"></div></div>
            <h2>Câu hỏi 6 🔎</h2>
            <p>Số nào sẽ thay vào dấu chấm hỏi trong hình bên dưới?</p>
            <img src="./access/quest/6.png" alt="Câu hỏi 6" class="question-img">
            <div class="error-msg">${state.error}</div>
            <div class="options-grid">
                <button class="option-btn" onclick="checkChoice('A', 'A', 'q7', 'Đúng rồi! Bạn thật tinh mắt.')">A</button>
                <button class="option-btn" onclick="checkChoice('B', 'A', 'q7', 'Sai rồi! Hãy thử lại nhé.')">B</button>
                <button class="option-btn" onclick="checkChoice('C', 'A', 'q7', 'Sai rồi! Hãy thử lại nhé.')">C</button>
                <button class="option-btn" onclick="checkChoice('D', 'A', 'q7', 'Sai rồi! Hãy thử lại nhé.')">D</button>
            </div>
        `
    },
    q7: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 70%"></div></div>
            <h2>Câu hỏi 7 🎩</h2>
            <p>Nhóm hình bên trái còn thiếu hình nào trong số các hình bên phải?</p>
            <img src="./access/quest/7.png" alt="Câu hỏi 7" class="question-img">
            <div class="error-msg">${state.error}</div>
            <div class="options-grid">
                <button class="option-btn" onclick="checkChoice('A', 'C', 'q8', 'Sai rồi! Hãy thử lại nhé.')">A</button>
                <button class="option-btn" onclick="checkChoice('B', 'C', 'q8', 'Sai rồi! Hãy thử lại nhé.')">B</button>
                <button class="option-btn" onclick="checkChoice('C', 'C', 'q8', 'Đúng rồi! Bạn thật tinh mắt.')">C</button>
                <button class="option-btn" onclick="checkChoice('D', 'C', 'q8', 'Sai rồi! Hãy thử lại nhé.')">D</button>
            </div>
        `
    },
    q8: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 80%"></div></div>
            <h2>Câu hỏi 8 📐</h2>
            <p>Điền vào dấu chấm hỏi số thích hợp</p>
            <img src="./access/quest/8.png" alt="Câu hỏi 8" class="question-img">
            <div class="error-msg">${state.error}</div>
            <div class="options-grid">
                <button class="option-btn" onclick="checkChoice('A', 'B', 'q9', 'Sai rồi! Hãy thử lại nhé.')">A</button>
                <button class="option-btn" onclick="checkChoice('B', 'B', 'q9', 'Đúng rồi! Bạn thật tinh mắt.')">B</button>
                <button class="option-btn" onclick="checkChoice('C', 'B', 'q9', 'Sai rồi! Hãy thử lại nhé.')">C</button>
                <button class="option-btn" onclick="checkChoice('D', 'B', 'q9', 'Sai rồi! Hãy thử lại nhé.')">D</button>
            </div>
        `
    },
    q9: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 90%"></div></div>
            <h2>Câu hỏi 9 🏆</h2>
            <p>Hình còn thiếu là hình nào?</p>
            <img src="./access/quest/9.png" alt="Câu hỏi 9" class="question-img">
            <div class="error-msg">${state.error}</div>
            <div class="options-grid">
                <button class="option-btn" onclick="checkChoice('A', 'D', '${state.isSpecialPerson ? 'q10' : 'q10_alt'}', 'Sai rồi! Hãy thử lại nhé.')">A</button>
                <button class="option-btn" onclick="checkChoice('B', 'D', '${state.isSpecialPerson ? 'q10' : 'q10_alt'}', 'Sai rồi! Hãy thử lại nhé.')">B</button>
                <button class="option-btn" onclick="checkChoice('C', 'D', '${state.isSpecialPerson ? 'q10' : 'q10_alt'}', 'Sai rồi! Hãy thử lại nhé.')">C</button>
                <button class="option-btn" onclick="checkChoice('D', 'D', '${state.isSpecialPerson ? 'q10' : 'q10_alt'}', 'Đúng rồi! Bạn thật tinh mắt.')">D</button>
            </div>
        `
    },
    q10: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 100%"></div></div>
            <h2>Câu hỏi 10 😊</h2>
            <p>Thời gian chúng ta bắt đầu một mối quan hệ là ngày nào?</p>
            <input type="text" id="answer" placeholder="VD: DD/MM/YYYY" autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkAnswer('01/01/2018', 'decision', 'Sai rồi, không có gợi ý đâu nhé!')">Hoàn thành</button>
        `
    },
    q10_alt: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 100%"></div></div>
            <h2>Câu hỏi 10 😊</h2>
            <p>Số nào sẽ là số thay thế cho dấu chấm hỏi?</p>
            <img src="./access/quest/10.png" alt="Câu hỏi 10" class="question-img">
            <div class="error-msg">${state.error}</div>
            <div class="options-grid">
                <button class="option-btn" onclick="checkChoice('A', 'D', 'decision_alt', 'Sai rồi! Hãy thử lại nhé.')">A</button>
                <button class="option-btn" onclick="checkChoice('B', 'D', 'decision_alt', 'Sai rồi! Hãy thử lại nhé.')">B</button>
                <button class="option-btn" onclick="checkChoice('C', 'D', 'decision_alt', 'Sai rồi! Hãy thử lại nhé.')">C</button>
                <button class="option-btn" onclick="checkChoice('D', 'D', 'decision_alt', 'Đúng rồi! Bạn thật tinh mắt.')">D</button>
            </div>
        `
    },
    decision: {
        render: () => `
            <h2>Hoàn thành xuất sắc! 🎉</h2>
            <p>Xin chào, cảm ơn vì đã tham gia trò chơi này.</p>
            <p>Khi ấn vào mở quà thì đây là những điều t muốn nói với m. Hãy mở nó nhé!</p>
            <br>
            <button onclick="changeScreen('gift')">Đồng ý</button>
            <button class="secondary-btn" onclick="playRejectMusic()">Từ Chối</button>
        `
    },
    decision_alt: {
        render: () => `
            <h2>Hoàn thành xuất sắc! 🎉</h2>
            <p>Xin chúc mừng bạn đã vượt qua tất cả câu hỏi.</p>
            <p>Bạn có muốn nhận một phần quà nhỏ từ tớ không?</p>
            <br>
            <button onclick="changeScreen('gift_alt')">Đồng ý</button>
            <button class="secondary-btn" onclick="playRejectMusic()">Từ chối</button>
        `
    },
    gift: {
        render: () => `
            <h2>Một món quà dành cho bạn! 🎉</h2>
            <p>Nhấn vào hộp quà bên dưới để xem t muốn nói gì nhé.</p>
            <div class="gift-box" onclick="playAgreeMusic()">🎁</div>
        `
    },
    letter: {
        render: () => `
            <h2>Chúc Mừng Sinh Nhật Huyền! 🎂</h2>
            <div class="letter">
                <p>Gửi Huyền,</p>
                <p>Chúc em người yêu cũ của anh có một ngày sinh nhật vui vẻ nhé. Xin lỗi vì không đủ dũng cảm để nhắn chúc sinh nhật em một cách đàng hoàng. Anh sẽ không còn buồn, không còn khóc về chuyện tình cảm của mình nữa và cũng không còn hi vọng mọi chuyện sẽ trở lại như trước.

Điều quan trọng nhất là em phải thật hạnh phúc và thành công, và gặp được một người tốt hơn anh, yêu thương em nhiều hơn anh.

</p>
                <p>Cảm ơn em, người từng là tất cả của anh...<span class="heart">❤️</span></p>
            </div>
            <br>
            <button onclick="resetGame()">Quay lại trang đầu tiên</button>
        `
    },
    gift_alt: {
        render: () => `
            <h2>Bạn Đã Hoàn Thành! 🎉</h2>
            <p>Nhấn vào hộp quà bên dưới để xem phần thưởng nhé.</p>
            <div class="gift-box" onclick="playAltMusic()">🎁</div>
        `
    },
    letter_alt: {
        render: () => `
            <h2>Chúc Mừng Sinh Nhật ${state.userName}! 🎂</h2>
            <div class="letter">
                <p>Gửi ${state.userName},</p>
                <p>Hôm nay là ngày đặc biệt của cậu. Nhưng tớ không đủ can đảm để nói trực tiếp với cậu. Thôi thì chúc cậu sinh nhật vui vẻ bên gia đình và bạn bè. Chúc cậu tuổi mới ý nghĩa, hạnh phúc học giỏi, đạt được những gì cậu mong muốn. Mọi thứ hoàn toàn xứng đáng với nỗ lực của cậu, hãy luôn hết mình với đam mê của mình và hãy giữ gìn sức khỏe nhé, cuối cùng chúc cậu hạnh phúc bên người cậu thương.</p>
                <p>Happy Birthday! <span class="heart">🎈🎁</span></p>
            </div>
            <br>
            <button onclick="resetGame()">Quay lại trang đầu tiên</button>
        `
    },
    rejected: {
        render: () => `
            <h2>😞</h2>
            <p>Tôi rất tiếc khi bạn từ chối.</p>
            <p>Xin cảm ơn vì đã tham gia. Chúc bạn có một ngày tốt lành.</p>
            <br>
            <button onclick="resetGame()">Quay lại trang đầu tiên</button>
        `
    }
};

function render() {
    let screenHtml = screens[state.currentScreen].render();
    
    // Thêm lightbox vào cuối mỗi giao diện
    screenHtml += `
        <div id="lightbox" class="lightbox" onclick="closeLightbox()">
            <img id="lightbox-img" src="">
        </div>
    `;
    
    app.innerHTML = screenHtml;
    
    // Gắn sự kiện click cho ảnh câu hỏi
    const questionImgs = app.querySelectorAll('.question-img');
    questionImgs.forEach(img => {
        img.addEventListener('click', function() {
            openLightbox(this.src);
        });
    });

    // Thêm event listener cho phím Enter
    const input = document.getElementById('answer');
    if (input) {
        input.focus();
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                const buttons = app.querySelectorAll('button');
                if (buttons.length > 0) {
                    buttons[0].click();
                }
            }
        });
    }
}

function changeScreen(newScreen) {
    app.style.animation = 'none';
    app.offsetHeight; // trigger reflow
    app.style.animation = 'fadeIn 0.5s ease-in-out';
    
    state.currentScreen = newScreen;
    state.error = '';
    render();
}

function resetGame() {
    agreeAudio.pause();
    agreeAudio.currentTime = 0;
    rejectAudio.pause();
    rejectAudio.currentTime = 0;
    altMusicAudio.pause();
    altMusicAudio.currentTime = 0;
    changeScreen('greeting');
}

function checkName() {
    const input = document.getElementById('answer');
    const rawAnswer = input.value.trim();
    
    if (rawAnswer === '') {
        state.error = 'Vui lòng nhập tên của bạn.';
        render();
        return;
    }
    
    state.userName = rawAnswer;
    changeScreen('dobCheck');
}

function checkDob() {
    const input = document.getElementById('answer');
    const userAnswer = input.value.trim();
    const normalizedName = removeAccents(state.userName.toLowerCase());
    
    const isHuyen = normalizedName === 'huyen';
    const isExactDob = userAnswer === '29/03/2006' || userAnswer === '29/3/2006';
    const isMarch29 = userAnswer.startsWith('29/03') || userAnswer.startsWith('29/3');
    
    if (isHuyen && isExactDob) {
        state.isSpecialPerson = true;
        changeScreen('notification');
    } else if (isMarch29) {
        state.isSpecialPerson = false;
        changeScreen('notification');
    } else {
        state.error = `Xin lỗi ${state.userName}, bạn không phải là người có sinh nhật trong hôm nay!`;
        render();
    }
}

function checkAnswer(expectedResult, nextScreen, errorMsg, ...alternativeResults) {
    const input = document.getElementById('answer');
    const rawAnswer = input.value.trim().toLowerCase();
    const userAnswer = removeAccents(rawAnswer);
    const expected = removeAccents(expectedResult.toLowerCase());
    const normalizedAlts = alternativeResults.map(a => removeAccents(a.toLowerCase()));
    
    if (userAnswer === expected || normalizedAlts.includes(userAnswer)) {
        changeScreen(nextScreen);
    } else {
        state.error = errorMsg;
        render();
    }
}

function checkChoice(userChoice, expectedChoice, nextScreen, errorMsg) {
    if (userChoice === expectedChoice) {
        changeScreen(nextScreen);
    } else {
        state.error = errorMsg;
        render();
    }
}

function openLightbox(imgSrc) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    if (lightbox && lightboxImg) {
        lightboxImg.src = imgSrc;
        lightbox.classList.add('active');
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
    }
}

// Bắt đầu ứng dụng
render();

// --- CHẶN F12 & CHUỘT PHẢI ---
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    window.location.reload();
});

document.addEventListener('keydown', function(e) {
    // Chặn F12
    if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        window.location.reload();
    }
    // Chặn Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        window.location.reload();
    }
    // Chặn Ctrl+U (Xem mã nguồn)
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        window.location.reload();
    }
});
