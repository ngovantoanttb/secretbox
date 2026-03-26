const app = document.getElementById('app');

const state = {
    currentScreen: 'greeting',
    error: '',
    progress: 0
};

const agreeAudio = new Audio('./access/music/hbbd.mp3');
const rejectAudio = new Audio('./access/music/tuchoi.mp3');

function playAgreeMusic() {
    agreeAudio.play().catch(e => console.log('Không thể phát nhạc:', e));
    changeScreen('gift');
}

function playRejectMusic() {
    rejectAudio.play().catch(e => console.log('Không thể phát nhạc:', e));
    changeScreen('rejected');
}

function playRejectEarlyMusic() {
    rejectAudio.play().catch(e => console.log('Không thể phát nhạc:', e));
    changeScreen('reject_questions');
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
            <h2>Xin chào bạn Huyền! 👋</h2>
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
            <p>Rất tiếc vì bạn không thể tham gia thử thách.</p>
            <br>
            <button onclick="resetGame()">Quay lại màn hình chính</button>
        `
    },
    q1: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 10%"></div></div>
            <h2>Câu hỏi 1 😈</h2>
            <p>Một cây gậy và một quả bóng giá 1.10 đô la. Cây gậy đắt hơn quả bóng 1.00 đô la. Quả bóng giá bao nhiêu xu?</p>
            <input type="text" id="answer" placeholder="Nhập số..." autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkAnswer('10', 'q2', 'Sai rồi! Gợi ý: Nếu bóng là 10 xu thì gậy là 1.10 đô, tổng sẽ là 1.20 đô mất.', 'nam', '5 xu', 'nam xu')">Trả lời</button>
        `
    },
    q2: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 20%"></div></div>
            <h2>Câu hỏi 2 🤯</h2>
            <p>Nếu bạn mất 5 phút để luộc chín 1 quả trứng, vậy bạn mất bao nhiêu phút để luộc chín 5 quả trứng cùng lúc?</p>
            <input type="text" id="answer" placeholder="Nhập số..." autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkAnswer('5', 'q3', 'Sai rồi! Gợi ý: Luộc cùng lúc trong 1 nồi thì thời gian vẫn vậy thôi.', '5 phut', 'nam', 'nam phut')">Trả lời</button>
        `
    },
    q3: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 30%"></div></div>
            <h2>Câu hỏi 3 🕵️</h2>
            <p>Bác sĩ đưa cho bạn 3 viên thuốc và dặn cứ 30 phút uống 1 viên. Hỏi sau bao nhiêu phút bạn sẽ uống hết số thuốc đó?</p>
            <input type="text" id="answer" placeholder="Nhập số..." autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkAnswer('60', 'q4', 'Sai rồi! Gợi ý: Viên đầu tiên bạn uống ngay lập tức ở phút thứ 0.', '60 phut', 'sau muoi', '1 tieng')">Trả lời</button>
        `
    },
    q4: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 40%"></div></div>
            <h2>Câu hỏi 4 🔠</h2>
            <p>Có hai người cha và hai người con đi câu cá. Họ câu được chính xác 3 con cá. Lúc về mỗi người xách 1 con. Vì sao?</p>
            <input type="text" id="answer" placeholder="Nhập câu trả lời..." autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkAnswer('3 nguoi', 'q5', 'Sai rồi! Gợi ý: Hãy nghĩ về các thế hệ trong cùng một gia đình.', 'co 3 nguoi', 'ong bo con', 'ong, bo, con')">Trả lời</button>
        `
    },
    q5: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 50%"></div></div>
            <h2>Câu hỏi 5 ➗</h2>
            <p>Một nông dân có 17 con cừu. Tất cả trừ 9 con đều chết. Hỏi người nông dân còn sống bao nhiêu con cừu?</p>
            <input type="text" id="answer" placeholder="Nhập số..." autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkAnswer('9', 'q6', 'Sai rồi! Gợi ý: Đọc kỹ lại câu hỏi, TẤT CẢ TRỪ 9 CON ĐỀU CHẾT.', '9 con', 'chin')">Trả lời</button>
        `
    },
    q6: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 60%"></div></div>
            <h2>Câu hỏi 6 🔎</h2>
            <p>Bạn đang chạy marathon và vượt qua người chạy cuối cùng. Bạn đang ở vị trí thứ mấy?</p>
            <input type="text" id="answer" placeholder="Nhập câu trả lời..." autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkAnswer('người cuối cùng', 'q7', 'Sai rồi! Gợi ý: Nếu bạn chạy sau người cuối cùng thì bạn mới là người cuối cùng chứ, sao mà vượt họ được!', 'khong co', 'vo ly', 'sai')">Trả lời</button>
        `
    },
    q7: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 70%"></div></div>
            <h2>Câu hỏi 7 🎩</h2>
            <p>Cái gì luôn luôn đến nhưng không bao giờ tới?</p>
            <input type="text" id="answer" placeholder="Trả lời..." autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkAnswer('ngay mai', 'q8', 'Sai rồi! Gợi ý: Dù bạn thức dậy vào ngày nào thì tên gọi của đối tượng đó cũng đã thay đổi.', 'thu tu ranh', 'tuong lai')">Trả lời</button>
        `
    },
    q8: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 80%"></div></div>
            <h2>Câu hỏi 8 📐</h2>
            <p>Trước khi đỉnh Everest được con người khám phá, ngọn núi nào cao nhất thế giới?</p>
            <input type="text" id="answer" placeholder="Trả lời..." autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkAnswer('everest', 'q9', 'Sai rồi! Gợi ý: Dù con người đã tìm ra nó hay chưa thì sự thật vẫn không đổi.', 'nui everest', 'dinh everest')">Trả lời</button>
        `
    },
    q9: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 90%"></div></div>
            <h2>Câu hỏi 9 🏆</h2>
            <p>Nếu bạn chỉ có một que diêm, và bước vào một căn phòng tối lạnh lẽo có một bếp dầu, một bếp củi và một ngọn nến. Bạn sẽ thắp cái nào đầu tiên?</p>
            <input type="text" id="answer" placeholder="Trả lời..." autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkAnswer('que diem', 'q10', 'Sai rồi! Gợi ý: Cần lửa để thắp những thứ kia thì bạn phải bật cái gì lên trước?', 'diem')">Trả lời</button>
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
            <p>Tôi rất tiếc.</p>
            <p>Xin cảm ơn vì đã tham gia.</p>
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
    changeScreen('greeting');
}

function checkName() {
    const input = document.getElementById('answer');
    const userAnswer = removeAccents(input.value.trim().toLowerCase());
    
    if (userAnswer === 'huyen') {
        changeScreen('dobCheck');
    } else {
        state.error = 'Bạn không phải là người đặc biệt hôm nay! Hãy nhập lại tên cho đúng nhé.';
        render();
    }
}

function checkDob() {
    const input = document.getElementById('answer');
    const userAnswer = input.value.trim();
    
    if (userAnswer === '29/03/2006' || userAnswer === '29/3/2006') {
        changeScreen('notification');
    } else {
        state.error = 'Xin lỗi, bạn không phải là người đặc biệt trong hôm nay!';
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

// Bắt đầu ứng dụng
render();
