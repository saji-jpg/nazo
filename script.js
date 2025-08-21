// ゲームの要素を取得
const introScreen = document.getElementById('introScreen');
const gameScreen = document.getElementById('gameScreen');
const finalPuzzleScreen = document.getElementById('finalPuzzleScreen');
const completionScreen = document.getElementById('completionScreen');
const videoElement = document.getElementById('videoElement');
const canvasElement = document.getElementById('canvasElement');
const messageElement = document.getElementById('message');
const foundCountElement = document.getElementById('foundCount');
const finalPuzzleInput = document.getElementById('finalPuzzleInput');
const finalMessage = document.getElementById('finalMessage');
// 画像要素を追加
const puzzleImage = document.getElementById('puzzleImage');


// ゲームの状態を管理する変数
let foundQRs = {
    'qr1': false,
    'qr2': false,
    'qr3': false
};
const totalQRs = Object.keys(foundQRs).length;
let foundCount = 0;

// QRコードと対応する画像パス
const qrImages = {
  'qr1': './nazo1.jpeg',
  'qr2': './nazo2.jpeg',
  'qr3': './nazo3.jpeg'
};

// 初期画面表示
showScreen('introScreen');

// 画面切り替え関数
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.style.display = 'none';
    });
    document.getElementById(screenId).style.display = 'block';
}

// ゲーム開始
async function startGame() {
    showScreen('gameScreen');
    try {
        // カメラを起動
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        videoElement.srcObject = stream;
        videoElement.play();
        requestAnimationFrame(tick);
    } catch (err) {
        console.error("カメラの起動に失敗しました: ", err);
        messageElement.textContent = "カメラが見つかりません。QRコードスキャンはできません。";
    }
}

// カメラ映像からQRコードを検出
function tick() {
    if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
        const canvas = canvasElement.getContext('2d');
        canvas.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
            const qrData = code.data.trim();
            if (foundQRs.hasOwnProperty(qrData) && !foundQRs[qrData]) {
                // 未発見のQRコードだった場合
                foundQRs[qrData] = true;
                foundCount++;
                messageElement.textContent = `${foundCount}つ目の古の印「${qrData}」を発見しました！`;
                foundCountElement.textContent = foundCount;

                // QRコードに対応する画像に更新
                if (qrImages[qrData]) {
                  puzzleImage.src = qrImages[qrData];
                }

                if (foundCount === totalQRs) {
                    // すべてのQRコードを発見したら最終謎へ
                    setTimeout(() => {
                        showScreen('finalPuzzleScreen');
                    }, 1500); // 1.5秒後に画面を切り替え
                }
            } else if (foundQRs.hasOwnProperty(qrData) && foundQRs[qrData]) {
                messageElement.textContent = "その古の印は、すでに手に入れています。";
            } else {
                messageElement.textContent = "これは古の印ではありません。";
            }
        }
    }
    requestAnimationFrame(tick);
}

// 最終謎の正解判定
function checkFinalAnswer() {
    const answer = finalPuzzleInput.value.trim().toLowerCase();
    const correctAnswer = 'まぶた'; // 答えは「まぶた」
    if (answer === correctAnswer) {
        finalMessage.textContent = "正解！あなたは真実の扉を開きました。";
        finalMessage.style.color = '#8bc34a';
        setTimeout(() => {
            showScreen('completionScreen');
        }, 1500);
    } else {
        finalMessage.textContent = "残念、違うようです。もう一度よく考えてみましょう。";
        finalMessage.style.color = '#ff5722';
    }
}
