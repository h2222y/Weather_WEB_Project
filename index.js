
async function setRenderBackground(){
  
// async await를 활용해서
// 데이터를 -> 파일로 변환해서 가져오기 
const result = await axios.get('https://picsum.photos/1280/720');
// console.log(result);
// 무조건 axios에서 넘어오는 값들은 data안에 담긴다 
// data = result.data
const {data} = await axios.get('https://picsum.photos/1280/720',{
  // blob 속성은 이미지, 사운드, 비디오등 멀티미디어 데이터를 다룰 때 사용 
  responseType: 'blob'
});
// console.log(data);

// 이미지를 가져왔다!
// 해당 파일을 https://picsum.photos/1280/720 를 들어가면 나오는 이미지처럼 
// 일종의 image에대한 URL을 만들어줘야 한다
// URL.createObjectURL

// 현재 페이지에서만 유효한 임시 URL
const imageUrl = URL.createObjectURL(data);
// console.log(imageUrl);
document.querySelector('body').style.backgroundImage = `url(${imageUrl})`;

}

// 시계 파트 

function setTime(){
  const timer = document.querySelector('.timer')
  setInterval(() => {
    const date = new Date();
    // console.log(date);
    // console.log(date.getHours())
    // console.log(date.getMinutes())
    // console.log(date.getSeconds());
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    timer.textContent = `${hours}:${minutes}:${seconds}`;

    if((hours>7)&&(hours<12)) timerContent.textContent = "Good Morning, Hyesu";
    else if (hours<18) timerContent.textContent = "Good Evening, Hyesu";
    else timerContent.textContent = "Good Night, Hyesu";
  }, 1000);
}

function setMemo(){
  const memoInput = document.querySelector('.memo-input');
  memoInput.addEventListener('keyup', function(e){
    // console.log(e);
    // console.log(e.code);
    // console.log(e.target.value);
    // null undefined 0 "" false -> 부정의 의미 
    if(e.code === "Enter" && e.target.value){
      // console.log("메모가 작성이 가능");
      // localStorage 
      // WEB 내부의 저장소 
      // sessionStroage은 타 페이지에 들어갔다가 오거나 종료하면 사라진다
      // localStorage는 영구 저장
      // localStorage('key', '저장할 값')
      // key값을 활용해서 데이터를 가져오고 
      // key값을 활용해서 데이터를 삭제
      // const test = "HELLO"
      // console.log(test)
      localStorage.setItem('todo', e.target.value);
      // 메모를 그려주는부분 
      renderingMemo();
      memoInput.value = '';
    }
  })
}

function renderingMemo(){
  const memo = document.querySelector('.memo');
  const memoValue = localStorage.getItem('todo');
  // console.log(memoValue);
  memo.textContent = memoValue;
}


function deleteMemo(){
  // 이벤트 위임 
  document.addEventListener('click', function(e){
    // console.log(e.target);
    // 메모인얘만 지워주면된다! OK?
    if(e.target.classList.contains('memo')){
      // localStorage를 날려주고
      localStorage.removeItem('todo');
      // html도 둘다 날려줘야한다.
      e.target.textContent = '';
    }
  })
}

// 현재 위치 가져오기 
function getPosition(options){
  return new Promise ((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  })
}

// 날씨 API 호출하기
async function getWeatherAPI(latitude, longitude){
  // 두가지
  // latitude 와 longitude에 값이 담겨있는경우 (위치 승인)
  const API_KEY = '2719e331e07a6af0547cfe7df2754c8c';
  // api.openweathermap.org/data/2.5/forecast/daily?lat={lat}&lon={lon}&cnt={cnt}&appid={API key}
  if(latitude && longitude){
    const result = await axios.get(`
    http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`);
    // console.log(result);
    return result;
  }

  // 값이 담겨져있지 않는경우(위치 승인 거부시 )
  const result = await axios.get(`http://api.openweathermap.org/data/2.5/forecast?q=Seoul&appid=${API_KEY}`);
  // console.log(result);
  return result;
}

function matchIcon(weatherData){
  // Clear
  if(weatherData === "Clear") return "./images/039-sun.png"
  // Clouds
  if(weatherData === "Clouds") return "./images/001-cloud.png"
  // Rain
  if(weatherData === "Rain") return "./images/003-rainy.png"
  // Snow
  if(weatherData === "Snow") return "./images/006-snowy.png"
  // Thunderstorm
  if(weatherData === "Thunderstorm") return "./images/008-storm.png"
  // Drizzle
  if(weatherData === "Drizzle") return "./images/031-snowflake.png"
  // Atmosphere
  if(weatherData === "Atmosphere") return "./images/033-hurricane.png"
}


// 목표 : 현재위치를 기반으로 날씨를 호출해서 가져오기 

// 날씨 데이터를 기반으로 HTML화 시키기
// weatherComponent

function weatherWrapperComponent(li){
  // console.log(li);

  // 섭씨로 변경해서 소수점 첫번째 자리만 가져오는 함수
  const changeToCelsius = (temp) => (temp - 273.15).toFixed(1);

  return `
  <div class="card shadow-sm bg-transparent m-2 flex-grow-1">

  <div class="card-header text-white text-center">
    ${li.dt_txt.split(" ")[0]}
  </div>

  <div class="card-body d-flex">

  <div class="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
      <h5 class="card-title">
        ${li.weather[0].main}
      </h5>

      <img src="${matchIcon(li.weather[0].main )}" width="60px" height="60px"/>

      <p class="card-text">
      ${changeToCelsius(li.main.temp)}˚
      </p>
    </div>

  </div>

</div>
  
  `
}



// 그 날씨를 rendering시키기 

async function renderWeather(){
  let latitude = '';
  let longitude = '';

  try {
    const position = await getPosition();
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
  } catch (error) {
    console.log(error);
  }


  // 위도와 경도를 기반으로 API를 호출
  const weatherResult = await getWeatherAPI(latitude, longitude);
  console.log(weatherResult);

  // weatherResult.data.list
  const {list} = weatherResult.data;

  // list가 40개나 되기때문에 줄이는 작업 
  // 6시를 기준으로 배열을 자른다.
  const weatherList = list.reduce((acc, cur) => {
    if(cur.dt_txt.indexOf('18:00:00') >0){
      acc.push(cur);
    }
    return acc;
  }, []);

  console.log(weatherList);
  const modalBody = document.querySelector('.modal-body');
  modalBody.innerHTML = weatherList.reduce((acc, cur) => {
  
    acc += weatherWrapperComponent(cur);

    return acc;
  }, "");
  
  //날씨 버튼 현재 날씨
const modalButton = document.querySelector('.modal-button');
const todayWeather = matchIcon(weatherList[0].weather[0].main);
modalButton.style.backgroundImage = `url(${todayWeather})`
}





// 날씨 API
// CITY를 기반으로 한 날씨 API
// http://api.openweathermap.org/data/2.5/forecast?q=Seoul&appid=2719e331e07a6af0547cfe7df2754c8c
// api.openweathermap.org/data/2.5/forecast/daily?lat={lat}&lon={lon}&cnt={cnt}&appid={API key}


(function(){
  setRenderBackground();

  // 특정 시간마다 계속 반복하는 함수
  setInterval(() => {
    setRenderBackground();
  }, 5000)

  setTime();
  setMemo();
  renderingMemo();
  deleteMemo();
  renderWeather();
})()