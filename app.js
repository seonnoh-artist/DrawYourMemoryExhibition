let password = '9042'; // 원하는 비밀번호로 수정
let enteredPassword = '';
let startHour = 10; // 전시 시간 설정 
let endHour = 20;

function checkPassword() {
  enteredPassword = document.getElementById('password').value;

  if (enteredPassword === password) {
    //포커스 해제해서 키보드 내려가게 함 
    document.activeElement.blur();

    //다음 프레임에 화면을 고정
    setTimeout(() => {
      //첫 화면의 패스워드 및 설정시간 폼을 없앤다. 
      document.getElementById('password-form').style.display = 'none';
      document.getElementById('password-form').innerHTML = ''; //html구조제거 
      document.getElementById('time-setting-form').style.display = 'none';
      document.getElementById('time-setting-form').innerHTML = ''; //html구조제거 

      document.getElementById('art-container').style.display = 'block';

      sound.play();
      sound.stop();  // 아이폰에서 재생을 위해 꼼수 

      initializeArt();
    }, 50); //50~100ms사이 안전 
  } else {
    alert('Incorrect password');
  }
}

function loadExhibitionTime() {
  const savedStart = localStorage.getItem('startHour');
  const savedEnd = localStorage.getItem('endHour');
  if (savedStart !== null) startHour = parseInt(savedStart);
  if (savedEnd !== null) endHour = parseInt(savedEnd);

  document.getElementById('start-hour').value = startHour;
  document.getElementById('end-hour').value = endHour;
}

function saveExhibitionTime() {
  const s = parseInt(document.getElementById('start-hour').value);
  const e = parseInt(document.getElementById('end-hour').value);


  if (s < e) {
    startHour = s;
    endHour = e;
    localStorage.setItem('startHour', startHour);
    localStorage.setItem('endHour', endHour);
    alert('전시 시간이 ' + startHour + '-' + endHour + '시로 저장되었습니다.');
  } else {
    alert('전시 시간 설정이 잘못되었습니다다.');
  }
}

function changeHour(type, delta) {
  const input = document.getElementById(`${type}-hour`);
  let val = parseInt(input.value || '0') + delta;
  if (val < 0) val = 24;
  if (val > 24) val = 0;
  input.value = val;
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
let initFrame = null;
let artInitialized = false;
let lastTouchtime = 0;
let touchTimeout = 300; //ms ,  터치 종료로 간주할 시간 
let touch_chk = false;
let exhibition_chk = false;
let isFading = false;
let errMsg = '';


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

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);  //창 크기가 바뀌었을때 
}

function initializeArt() {     // 2025.8.12  f11 시 캔버스 화면 잘리는 부분.. 강제로 100더해서 맞춰줌. (임시방편)
  const cnv = createCanvas(windowWidth, windowHeight+100); // 원래 setup()의 createCanvas() 부분만 여기
  cnv.parent('art-container');
  cnv.position(0, 0); //좌표 틀어짐 방지 
  resizeCanvas(windowWidth, windowHeight+100); //강제 크기 재설정

  image(bg, 0, 0, width, height, 0, 0, bg.width, bg.height, COVER);
  wave_up = height / 3;
  wave_down = height / 2;
  noStroke();
  tint(255, 10);
  artInitialized = true;
  initFrame = frameCount;
  curImg = get();
  curImg.loadPixels();
  preImg = get();
  preImg.loadPixels();
}

function handleReleased() {
  if(getAudioContext().state !=='running'){
    getAudioContext().resume();  //오디오를 활성화 
  }
  if (!sound || isFading || sound.isPlaying()) return;

  try {
    sound.setVolume(1);
    sound.play().then(() => {
      isFading = true;

      let fadeInterval = setInterval(() => {
        let currentVolume = sound.getVolume();
        if (currentVolume > 0.01) {
          sound.setVolume(currentVolume - 0.01);
        } else {
          clearInterval(fadeInterval);
          sound.stop();
          sound.setVolume(1);
          isFading = false;
        }
      }, 200);
    }).catch((e) => {
      console.error("Sound play error:", e);
      isFading = false;
    });

  } catch (e) {
    console.error("Sound error on handleReleased:", e);    
    errMsg = "sound err";
    errLog();    
    isFading = false;
  }
}

function errLog() {
  /*
  fill(0);
  ellipse(width / 2, height / 2, 300, 300);
  fill(255, 255, 255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text(errMsg, width / 2, height / 2);*/
}
/*5.29 프레임 수정 60->30, 이미지 수정 sea.jpg 원본 .프레임 카운터 30 부분 주석처리*/
function draw() {

  /*
  fill(255);
  textSize(20);
  text("satrtHour: " + startHour, 100, 200);
  text("endHour: " + endHour, 100, 250);*/

  errMsg = frameRate().toFixed(1);
  errLog();

  if (!artInitialized) return;

  if (!curImg || !curImg.pixels) {
    curImg = get();
    curImg.loadPixels();
    preImg = get();
    preImg.loadPixels();
    return; // 다음 프레임부터터 정상 작동동
  }

  if (!curImg || !curImg.width) return;
  if (!preImg || !preImg.width) return;

  if (frameCount % 30 === 0) {  // 가끔 부른다....메모리 누수때문에.
    curImg = null;  // 메모리 제거 
    curImg = get();
    curImg.loadPixels();
  }

  // 전시 시간 설정  10시~22시
  let now = hour();

  if (now >= startHour && now < endHour) {
    if (!exhibition_chk) { image(bg, 0, 0, width, height, 0, 0, bg.width, bg.height, COVER); }
    exhibition_chk = true;
    frameRate(50);
  } else {
    exhibition_chk = false;
    background(0, 0, 0);  // 전력을 가장 낮춘다. 
    fill(255, 255, 255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text('전시 시간이 아닙니다.', width / 2, height / 2);
    frameRate(1);
    return;
  }

  /*
  //테스트용   
  let now = minute() % 2;

  if (now >= 0 && now < 1) {
    if (!exhibition_chk) { image(bg, 0, 0, width, height, 0, 0, bg.width, bg.height, COVER); }
    exhibition_chk = true;
    frameRate(60);
  } else {
    exhibition_chk = false;
    background(0, 0, 0);  // 전력을 가장 낮춘다. 
    fill(255, 255, 255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text('전시 시간이 아닙니다.', width / 2, height / 2);
    frameRate(1);
    return;
  }*/

  errMsg = "tint count";
  errLog();

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
    errMsg = "mouse pressed";
    errLog();
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
    errMsg = "blende start";
    errLog();
    blend(preImg, 0, 0, curImg.width, curImg.height, 0, 0, width, height, LIGHTEST);
    errMsg = "blende end";
    errLog();

    lastTouchtime = millis(); // 마지막 시간을 기록합니다. 
    touch_chk = true;
  }

  //터치종료후
  if (touch_chk && (millis() - lastTouchtime > touchTimeout)) {
    errMsg = "toucn end";
    errLog();
    handleReleased(); // 터치가 끝난 것으로 간주합니다. 
    touch_chk = false;
  }
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js')
    .then(function (registration) {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch(function (error) {
      console.log('Service Worker registration failed:', error);
    });
}
