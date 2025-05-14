let password = '0000'; // 원하는 비밀번호로 수정
let enteredPassword = '';

function checkPassword() {
  enteredPassword = document.getElementById('password').value;

  if (enteredPassword === password) {
    //포커스 해제해서 키보드 내려가게 함 
    document.activeElement.blur();

    //다음 프레임에 화면을 고정
    setTimeout(() => {
      document.getElementById('password-form').style.display = 'none';
      document.getElementById('password-form').innerHTML = ''; //html구조제거 
      document.getElementById('art-container').style.display = 'block';

      initializeArt();
    }, 50); //50~100ms사이 안전 
  } else {
    alert('Incorrect password');
  }
}

// 여기서부터는 원래 p5.js 코드
let bg;
let degree = 0;
let yoff = 0.0; // 2nd dimension of perlin noise
let dimension = 0.07;
let wave_up, wave_down;
let x_value = 0;
let curImg;
let angle = 0;
let preImg;
let starImg = [];
let starNum = 2;
let sound;
let theta = 0;
let tint_count = 0;
let imageReady = false;
let initFrame = null;
let artInitialized = false;
let lastTouchtime = 0;
let touchTimeout = 300; //ms ,  터치 종료로 간주할 시간 
let touch_chk = false;


function preload() {
  bg = loadImage("data/sea.jpg",
    () => { console.log('sea.jpg loaded successfully'); },
    () => { console.error('Failed to load sea.jpg'); }
  );

  for (let i = 0; i < starNum; i++) {
    starImg[i] = loadImage("data/star" + i + ".png",
      () => { console.log('star' + i + '.png loaded successfully'); },
      () => { console.error('Failed to load star' + i + '.png'); }
    );
  }

  sound = loadSound("data/wave.mp3",
    () => { console.log('wave.mp3 loaded successfully'); },
    () => { console.error('Failed to load wave.mp3'); }
  );
}

function initializeArt() {
  const cnv = createCanvas(windowWidth, windowHeight); // 원래 setup()의 createCanvas() 부분만 여기
  cnv.parent('art-container');
  cnv.position(0, 0); //좌표 틀어짐 방지 
  resizeCanvas(windowWidth, windowHeight); //강제 크기 재설정

  image(bg, 0, 0, width, height, 0, 0, bg.width, bg.height, COVER);
  wave_up = height / 3;
  wave_down = height / 2;
  noStroke();
  tint(255, 10);
  artInitialized = true;
  initFrame = frameCount;
  curImg = get();
  preImg = get();
}

function handleReleased() {
  sound.play();
}


function draw() {

  if (!artInitialized) return;

  if (!curImg && frameCount > initFrame + 1) {
    curImg = get();
    curImg.loadPixels();
    preImg = get();
    preImg.loadPixels();
    return; // 다음 프레임부터터 정상 작동동
  }

  if (!curImg || !curImg.width) return;
  if (!preImg || !preImg.width) return;

  curImg = get();
  curImg.loadPixels();

  if (tint_count < 10) {
    tint_count += 0.1;
    tint(255, tint_count);

    let xOffset = sin(angle) * random(10);
    let yOffset = cos(angle) * height / 6;
    angle += 0.05;

    image(preImg, 0 + xOffset, 0 - yOffset, preImg.width + xOffset, preImg.height + yOffset);

  } else {
    tint_count = 0;
  }

  noStroke();

  let b_x = int(random(0, curImg.width));
  let b_y = int(random(0, curImg.height));
  let b_loc = (b_x + b_y * curImg.width) * 4;
  let p_red = curImg.pixels[b_loc + 0];
  let p_green = curImg.pixels[b_loc + 1];
  let p_blue = curImg.pixels[b_loc + 2];
  let random_r = random(80, 200);
  fill(p_red, p_green, p_blue, 50);
  ellipse(b_x, b_y, random_r, random_r);

  if (mouseIsPressed) {
    tint_count = 0;
    let x = mouseX;
    let y = mouseY;
    let b_loc = (x + y * curImg.width) * 4;
    let p_red = preImg.pixels[b_loc + 0];
    let p_green = preImg.pixels[b_loc + 1];
    let p_blue = preImg.pixels[b_loc + 2];

    tint(255, 255);
    let randomStar = random(starImg);
    let randomR = random(30, 70);
    image(randomStar, x, y, randomR, randomR);

    blend(preImg, 0, 0, curImg.width, curImg.height, 0, 0, width, height, LIGHTEST);

    lastTouchtime = millis(); // 마지막 시간을 기록합니다. 
    touch_chk = true;
  }

  //터치종료후
  if (touch_chk && (millis() - lastTouchtime > touchTimeout)) {
    handleReleased(); // 터치가 끝난 것으로 간주합니다. 
    touch_chk = false;
  }
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(function (registration) {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch(function (error) {
      console.log('Service Worker registration failed:', error);
    });
}
