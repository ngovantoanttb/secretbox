const app = document.getElementById('app');

const state = {
    currentScreen: 'greeting',
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
    q1: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 10%"></div></div>
            <h2>Câu hỏi 1 😈</h2>
            <p>Cái gì đen khi bạn mua nó, đỏ lúc bạn dùng nó và xám xịt khi bạn vứt nó đi?</p>
            <input type="text" id="answer" placeholder="Nhập câu trả lời..." autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkAnswer('than', 'q2', 'Đọc kỹ lại xem, vật gì đốt lên màu đỏ?', 'cuc than', 'than cui')">Trả lời</button>
        `
    },
    q2: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 20%"></div></div>
            <h2>Câu hỏi 2 🤯</h2>
            <p>Có một từ mà 100% người dân Việt Nam đều phát âm sai. Đó là từ gì?</p>
            <input type="text" id="answer" placeholder="Nhập từ..." autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkAnswer('sai', 'q3', 'Đơn giản lắm, nghĩ theo nghĩa đen nhé!')">Trả lời</button>
        `
    },
    q3: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 30%"></div></div>
            <h2>Câu hỏi 3 🕵️</h2>
            <p>Bà đó bả chết bả bay lên trời. Hỏi bà ấy chết năm bao nhiêu tuổi (nhập số)?</p>
            <input type="text" id="answer" placeholder="Nhập số..." autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkAnswer('73', 'q4', 'Hãy đọc lái chữ bả bay xem ra số mấy nhé!', 'bay ba')">Trả lời</button>
        `
    },
    q4: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 40%"></div></div>
            <h2>Câu hỏi 4 🔠</h2>
            <p>Từ nào trong tiếng Việt có 9 chữ 'h'?</p>
            <input type="text" id="answer" placeholder="Nhập từ..." autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkAnswer('chinh', 'q5', 'Nghĩ thử xem 9 h (chín h) ghép lại đọc là gì?', 'chu chinh')">Trả lời</button>
        `
    },
    q5: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 50%"></div></div>
            <h2>Câu hỏi 5 ➗</h2>
            <p>Một thợ mộc cưa khúc gỗ dài 10m thành các khúc 1m. Mỗi lần cưa mất 1 phút. Hỏi làm liên tục thì để cưa xong tốn bao nhiêu phút?</p>
            <input type="text" id="answer" placeholder="Nhập số..." autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkAnswer('9', 'q6', 'Nhát cưa cuối cùng là đứt luôn khúc cuối rồi, tính lại đi!', '9 phut', 'chin phut')">Trả lời</button>
        `
    },
    q6: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 60%"></div></div>
            <h2>Câu hỏi 6 🔎</h2>
            <p>Ba phòng: Phòng 1 đầy lửa, Phòng 2 đầy sát thủ, Phòng 3 có bầy sư tử nhịn đói 3 năm. Vào phòng nào an toàn nhất (nhập số)?</p>
            <input type="text" id="answer" placeholder="VD: 1, 2, 3..." autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkAnswer('3', 'q7', 'Sư tử nhịn đói 3 năm thì sao nhỉ?', 'phong 3')">Trả lời</button>
        `
    },
    q7: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 70%"></div></div>
            <h2>Câu hỏi 7 🎩</h2>
            <p>Cái gì rõ ràng thuộc về bạn, nhưng những người xung quanh bạn lại sử dụng nó nhiều hơn bạn?</p>
            <input type="text" id="answer" placeholder="Nhập câu trả lời..." autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkAnswer('ten', 'q8', 'Mọi người hay dùng cái đó để gọi bạn!', 'cai ten', 'ten cua ban')">Trả lời</button>
        `
    },
    q8: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 80%"></div></div>
            <h2>Câu hỏi 8 📐</h2>
            <p>Án mạng ở một ngôi nhà HÌNH TRÒN. Lời khai: Người hầu đang quét góc nhà. Đầu bếp đang thái thịt. Ai là hung thủ giả dối?</p>
            <input type="text" id="answer" placeholder="Nhập tên người..." autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkAnswer('nguoi hau', 'q9', 'Nhà hình tròn thì có CÁI GÓC nào không?', 'nguoi hau gai')">Trả lời</button>
        `
    },
    q9: {
        render: () => `
            <div class="progress-bar"><div class="progress" style="width: 90%"></div></div>
            <h2>Câu hỏi 9 🏆</h2>
            <p>Tháng nào trong năm có 28 ngày?</p>
            <input type="text" id="answer" placeholder="Trả lời..." autocomplete="off">
            <div class="error-msg">${state.error}</div>
            <button onclick="checkAnswer('12', 'q10', 'Người ta hỏi tháng nào có 28 ngày, chứ đâu hỏi tháng nào CHỈ CÓ 28 ngày?', 'tat ca', '12 thang', 'thang nao cung co')">Trả lời</button>
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
        changeScreen('q1');
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
