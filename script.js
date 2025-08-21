// ゲームの要素を取得
const introScreen = document.getElementById('introScreen');
const gameScreen = document.getElementById('gameScreen');
const videoElement = document.getElementById('videoElement');
const canvasElement = document.getElementById('canvasElement');
const messageElement = document.getElementById('message');
const foundCountElement = document.getElementById('foundCount');
const puzzleImage = document.getElementById('puzzleImage');
// 最終メッセージ要素を追加
const finalMessageText = document.getElementById('finalMessageText');


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
            if (foundQRs.hasOwnProperty(qrData)) {
                if (!foundQRs[qrData]) {
                    // 未発見のQRコードだった場合
                    foundQRs[qrData] = true;
                    foundCount++;
                    
                    // 「ヒントが解放されました」と表示
                    messageElement.textContent = `ヒントが解放されました`;
                    // 4秒後にメッセージをクリア
                    // setTimeout(() => {
                    //     messageElement.textContent = '';
                    // }, 4000); 

                    foundCountElement.textContent = foundCount;

                    // QRコードに対応する画像に更新
                    if (qrImages[qrData]) {
                      puzzleImage.src = qrImages[qrData];
                    }

                    if (foundCount === totalQRs) {
                        // すべてのQRコードを発見したらQRスキャンを停止し、次の画面へ
                        if (videoElement.srcObject) {
                            const tracks = videoElement.srcObject.getTracks();
                            tracks.forEach(track => track.stop());
                            videoElement.srcObject = null;
                            videoElement.style.display = 'none'; // ビデオ要素を非表示に
                        }
                        
                        puzzleImage.src = './nazo3.jpeg'; // nazo3.jpegを表示
                        foundCountElement.style.display = 'none'; // QR進捗を非表示に
                        finalMessageText.style.display = 'block'; // 最終メッセージを表示
                    }
                } else {
                    // すでに発見済みのQRコードだった場合
                    messageElement.textContent = "登録済みのQRコードです";
                }
            } else {
                // 合致しないQRコードだった場合
                messageElement.textContent = "もう一度読み込んでください";
            }
        }
    }
    requestAnimationFrame(tick);
}
