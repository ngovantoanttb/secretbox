const app = document.getElementById('app');

const state = {
    currentScreen: 'nameCheck',
    error: '',
    progress: 0
};

const agreeAudio = new Audio('./access/music/hbbd.mp3');
const rejectAudio = new Audio('./access/music/hbbd.mp3');

function playAgreeMusic() {
    agreeAudio.play().catch(e => console.log('Không thể phát nhạc:', e));
    changeScreen('gift');
}

function playRejectMusic() {
    rejectAudio.play().catch(e => console.log('Không thể phát nhạc:', e));
    changeScreen('rejected');
}

// Hàm loại bỏ dấu tiếng Việt để kiểm tra đáp án dễ hơn
function removeAccents(str) {
    return str.normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

const screens = {
    nameCheck: {
        render: () => `
            <h2>Xác nhận danh tính 🌸</h2>
            <p>Tên người đặc biệt trong hôm nay là gì?</p>
            <input type="text" id="answer" placeholder="Nhập tên..." autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkName()">Tiếp tục</button>
        `
    },
    dobCheck: {
        render: () => `
            <h2>Xin chào bạn Huyền! 👋</h2>
            <p>Mời bạn trả lời câu tiếp theo để xác nhận nhé.</p>
            <p>Bạn sinh ngày tháng năm nào?</p>
            <input type="text" id="answer" placeholder="VD: DD/MM/YYYY" autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkDob()">Tiếp tục</button>
        `
    },
    q1: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 10%"></div></div>
            <h2>Câu hỏi 1 (Dân gian) 🧩</h2>
            <p>Con gì đập thì sống, không đập thì chết?</p>
            <input type="text" id="answer" placeholder="Nhập câu trả lời..." autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkAnswer('con tim', 'q2', 'Sai rồi, hãy nhập lại xem nào!')">Trả lời</button>
        `
    },
    q2: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 20%"></div></div>
            <h2>Câu hỏi 2 (Cung Hoàng Đạo) ♈</h2>
            <p>Bạch Dương có biểu tượng là con gì?</p>
            <input type="text" id="answer" placeholder="Nhập câu trả lời..." autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkAnswer('con cuu', 'q3', 'Sai rồi, cung của mình mà không nhớ sao!')">Trả lời</button>
        `
    },
    q3: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 30%"></div></div>
            <h2>Câu hỏi 3 (Dân gian - Trí tuệ) 🧠</h2>
            <p>Vừa bằng hạt đỗ, ăn giỗ cả làng. (Là con gì?)</p>
            <input type="text" id="answer" placeholder="Nhập câu trả lời..." autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkAnswer('con ruồi', 'q4', 'Sai rồi, gợi ý là loài này hay bay quanh mâm cơm nhé!', 'ruoi')">Trả lời</button>
        `
    },
    q4: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 40%"></div></div>
            <h2>Câu hỏi 4 (Dân gian - Hại não) 🔥</h2>
            <p>Thân em nửa chuột nửa chim, ban ngày treo ngược, tối tìm mồi bay. (Là con gì?)</p>
            <input type="text" id="answer" placeholder="Nhập câu trả lời..." autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkAnswer('con dơi', 'q5', 'Chưa đúng! Loài này thường ngủ treo ngược trong hang nha!', 'doi')">Trả lời</button>
        `
    },
    q5: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 50%"></div></div>
            <h2>Câu hỏi 5 (Dân gian - Lươn lẹo) 👑</h2>
            <p>Chẳng lợp mà thành mái, chẳng cấy mà mọc đều, già thì trắng phau phau, non thì đen kin kít? (Là cái gì?)</p>
            <input type="text" id="answer" placeholder="Nhập câu trả lời..." autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkAnswer('mái tóc', 'q6', 'Sai rồi, cố suy nghĩ xem trên cơ thể có cái gì giống vậy!', 'toc')">Trả lời</button>
        `
    },
    q6: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 60%"></div></div>
            <h2>Câu hỏi 6 💡</h2>
            <p>Tôi có 3 quả táo, bạn lấy đi 2 quả. Vậy bạn có mấy quả?</p>
            <input type="text" id="answer" placeholder="Nhập số..." autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkAnswer('2', 'q7', 'Bài toán lớp 1 nha, đọc kĩ đề là bạn có mấy quả!', '2 qua')">Trả lời</button>
        `
    },
    q7: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 70%"></div></div>
            <h2>Câu hỏi 7 ⚖️</h2>
            <p>Bố của Mary có 4 cô con gái là: Nana, Nene, Nini. Tên cô gái thứ 4 là gì?</p>
            <input type="text" id="answer" placeholder="Nhập tên..." autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkAnswer('mary', 'q8', 'Dễ lắm, từ từ suy nghĩ là ra ngay.', 'ma ry')">Trả lời</button>
        `
    },
    q8: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 80%"></div></div>
            <h2>Câu hỏi 8 🔢</h2>
            <p>Số tiếp theo trong dãy số: 1, 1, 2, 3, 5, 8, ... là số nào?</p>
            <input type="text" id="answer" placeholder="Nhập số..." autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkAnswer('13', 'q9', 'Gợi ý: Tìm tổng 2 số liền trước.')">Trả lời</button>
        `
    },
    q9: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 90%"></div></div>
            <h2>Câu hỏi 9 🚂</h2>
            <p>Một tàu điện tốc hành chạy về hướng Nam, gió thổi về hướng Tây Bắc. Khói tàu bay về hướng nào?</p>
            <input type="text" id="answer" placeholder="Nhập từ..." autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkAnswer('không có khói', 'q10', 'Bị lừa rồi nhé! Đọc kỹ đó là tàu gì?', 'khong')">Trả lời</button>
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
    decision: {
        render: () => `
            <h2>Hoàn thành xuất sắc! 🎉</h2>
            <p>Xin chào, cảm ơn vì đã tham gia trò chơi này.</p>
            <p>Khi ấn vào mở quà thì đây là những điều t muốn nói với m. Hãy mở nó nhé!</p>
            <br>
            <button onclick="playAgreeMusic()">Đồng ý</button>
            <button class="secondary-btn" onclick="playRejectMusic()">Từ Chối</button>
        `
    },
    gift: {
        render: () => `
            <h2>Một món quà dành cho bạn! 🎉</h2>
            <p>Nhấn vào hộp quà bên dưới để xem t muốn nói gì nhé.</p>
            <div class="gift-box" onclick="changeScreen('letter')">🎁</div>
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
    rejected: {
        render: () => `
            <h2>😞</h2>
            <p>Tao rất tiếc.</p>
            <p>Xin cảm ơn vì đã tham gia.</p>
            <p>Chúc Huyền sinh nhật hạnh phúc!</p>
            <br>
            <button onclick="resetGame()">Quay lại trang đầu tiên</button>
        `
    }
};

function render() {
    app.innerHTML = screens[state.currentScreen].render();
    
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
    changeScreen('nameCheck');
}

function checkName() {
    const input = document.getElementById('answer');
    const userAnswer = removeAccents(input.value.trim().toLowerCase());
    
    if (userAnswer === 'huyen') {
        changeScreen('dobCheck');
    } else {
        state.error = 'Bạn không phải là người cần chúc! Hoặc hãy nhập lại tên cho đúng nhé.';
        render();
    }
}

function checkDob() {
    const input = document.getElementById('answer');
    const userAnswer = input.value.trim();
    
    if (userAnswer === '29/03/2006' || userAnswer === '29/3/2006') {
        changeScreen('q1');
    } else {
        state.error = 'Xin lỗi, bạn không phải là người đặc biệt trong hôm nay!';
        render();
    }
}

function checkAnswer(expectedResult, nextScreen, errorMsg, alternativeResult = null) {
    const input = document.getElementById('answer');
    const rawAnswer = input.value.trim().toLowerCase();
    const userAnswer = removeAccents(rawAnswer);
    const expected = removeAccents(expectedResult.toLowerCase());
    
    if (userAnswer === expected || (alternativeResult && userAnswer === alternativeResult)) {
        changeScreen(nextScreen);
    } else {
        state.error = errorMsg;
        render();
    }
}

// Bắt đầu ứng dụng
render();
