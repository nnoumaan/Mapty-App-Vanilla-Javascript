'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workouts {
  date = new Date();
  id = (Date.now()+ '').slice(-10);


  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;

    


    

  }

  _setDescription(){
    this.des = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`

    
}


}

class Cyc extends Workouts {
type = 'cycling';
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.calcSpeed()
    this._setDescription()
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration /60);
    return this.speed
  }
}

class Run extends Workouts {
    type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription()
  }

  calcPace() {
    this.pace = this.duration / this.distance;

    return this.pace;
  }
}


// const run1= new Run([23,-12],22,45,140)
// const cyc1 = new Cyc([23,-12],14,15,45)


// console.log(run1);
// console.log(cyc1);



////////////////////////////////////////

class ClassApp {
  #map;
  #mapEvent;
  #workouts= [];
 

  constructor() {
    this._getPosition();

    form.addEventListener('submit', this._newWorkoutPlan.bind(this));

    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click',this._workoutfocus.bind(this))
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('We Could"not fetch Your Location');
        }
      );
    }
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
    this._getLocalStorage()

  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _hideform(){
    inputCadence.value =inputDistance.value=inputDuration.value=inputElevation.value=''
    form.style.display = 'none'
    form.classList.add('hidden')
    setTimeout(()=>form.style.display = 'grid',1000)
 
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }



  _newWorkoutPlan(e) {

    const inputValidator = (...input)=> input.every(ins=>Number.isFinite(ins))
    const inputZero = (...input)=> input.every(ins => ins > 0)

    e.preventDefault();
    const type = inputType.value;
    const duration = +inputDuration.value;
    const distance = +inputDistance.value;
    const cadence = +inputCadence.value;
    const elevation = +inputElevation.value
    const { lat, lng } = this.#mapEvent.latlng;
    let works1;


    if(type === "running"){
       
        if(!inputValidator(distance,duration,cadence)&&inputZero(distance,duration,cadence)) return alert('Input Should Be Greater Than Positive')

        works1 = new Run([lat,lng],distance,duration,cadence);
        this.#workouts.push(works1)
    }
    
    if(type === "cycling" ){
        if(!(inputValidator(distance,duration,elevation)&&inputZero(distance,duration))) return alert('Input Should Be Greater Than Positive')
         works1 = new Cyc([lat,lng],distance,duration,elevation);
        this.#workouts.push(works1)

    

    }




    this._renderingWorkouts(works1)
    this._renderwww(works1)
    this._setLocalStorage()

    
   
  }



  _renderwww(works){

    let html = `<li class="workout workout--${works.type}" data-id="${works.id}">
    <h2 class="workout__title">${works.des}</h2>
    <div class="workout__details">
         <span class="workout__icon">${works.type === "running"?"🏃‍♂️":"🚴‍♀️"}</span><span class="workout__value">${works.distance}</span>
        <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
          <span class="workout__icon">⏱</span>
            <span class="workout__value">${works.duration}</span>
        <span class="workout__unit">min</span>
            </div>`

     if(works.type === "cycling" ){   
    html+=`<div class="workout__details">
    <span class="workout__icon">⚡️</span>
    <span class="workout__value">${works.speed.toFixed(1)}</span>
    <span class="workout__unit">km/h</span>
  </div>
  <div class="workout__details">
    <span class="workout__icon">⛰</span>
    <span class="workout__value">${works.elevation}</span>
    <span class="workout__unit">m</span>
  </div>
  </li>`}

  
     if(works.type === "running"){html+=`<div class="workout__details">
  <span class="workout__icon">⚡️</span>
  <span class="workout__value">${works.pace.toFixed(1)}</span>
  <span class="workout__unit">min/km</span>
  </div>
  <div class="workout__details">
  <span class="workout__icon">🦶🏼</span>
  <span class="workout__value">${works.cadence}</span>
  <span class="workout__unit">spm</span>
  </div></li>`}


    containerWorkouts.insertAdjacentHTML('beforeend',html)
}
  



  _renderingWorkouts(woor){
    L.marker(woor.coords)
    .addTo(this.#map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: `${woor.type}-popup`,
      })
    )
    .setPopupContent((woor.type))
    .openPopup();
 
  this._hideform()


  }
  _workoutfocus(e){

    let clickWork = e.target.closest('.workout')
    if(!clickWork)return
  
   
    const wokoutfinder = this.#workouts.find(cep=> cep.id === clickWork.dataset.id)

this.#map.setView(wokoutfinder.coords,13,{
  animate: true,
  pan:{duration:1}
})

  


  }

  _setLocalStorage(){

     localStorage.setItem('myData',JSON.stringify(this.#workouts))


  }
  _getLocalStorage(){
    const datas = JSON.parse(localStorage.getItem('myData'))
    if(!datas)return
    this.#workouts = datas
    this.#workouts.forEach(work=> {this._renderwww(work)
    this._renderingWorkouts(work)
  })
    
  }

  reset(){
    localStorage.removeItem('myData')
    location.reload()
  }





}

const apss = new ClassApp();

