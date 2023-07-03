// Need to do :
// case when the response is an empty array bc the submit was not correct --> Done
// case when the input in empty --> Done
// case when there's more than 1 city with the same name (keep it for later)
// Check for icons humidity sunset sunrise
// Check for further days in advance --> Done
// Default city --> Done
// Security key
// S'occupeter des min et max --> Done
// Change background color if it's current day or current night --> Done
// refresh each 30sec ?


import APIKey from "./API.js";


const displayWeather = (cityName) => {
    /* Part on CSS */
    document.getElementById("weatherCard").style.background = 'rgba(0, 0, 255, 0.2)'
    /* End part of CSS */
    const wind = `<i id="windLogo" class="fa-solid fa-wind"></i>
    <div id="wind"></div>
    `
    document.getElementById("wind-pressure").innerHTML = wind
    if (cityName === ""){
        alert("Please enter valid data")
    }
    else{
        // We will begin with 1 response, after maybe that we will use up to 5 responses.
        fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${APIKey[0]}`)
        .then(response => response.json())
        .then(data =>{
            if (data.length == 0){
                alert('Please enter valid data')
            }
            else{
                let cityLat = data[0]["lat"]
                let cityLon = data[0]["lon"]
                fetch(`https://api.timezonedb.com/v2.1/get-time-zone?key=${APIKey[1]}&format=json&by=position&lat=${cityLat}&lng=${cityLon}`)
                .then(response => response.json())
                .then(data => {
                    const { zoneName, timestamp } = data;
                    const timeZoneOffset = new Date().getTimezoneOffset() * 60; // Get the local time zone offset in seconds
                    const localTime = new Date((timestamp + timeZoneOffset) * 1000); // Convert UTC timestamp to local time
                    let timeIn6Days = new Date((timestamp +timeZoneOffset)*1000 + 5184*10**5) // Date accept time in milliseconds -> *1000
                    
                    const currentHour = localTime.getHours();
                    const currentMinute = localTime.getMinutes();
                    const currentYear = localTime.getFullYear();
                    const currentMonth = localTime.getMonth()+1;
                    const currentDate = localTime.getDate();
                    const yearIn6Days = timeIn6Days.getFullYear();
                    const monthIn6Days = timeIn6Days.getMonth()+1;
                    const dateIn6Days = timeIn6Days.getDate()

                    // console.log(`Current date is : ${currentYear}-${currentMonth}-${currentDate}`)
                    // console.log(`Date in 6 days is : ${yearIn6Days}-${monthIn6Days}-${dateIn6Days}`)
                    let actualDate = `${currentYear}-${currentMonth}-${currentDate}`
                    let sixDaysLater = `${yearIn6Days}-${monthIn6Days}-${dateIn6Days}`
                    //console.log(`Current time in ${zoneName}: ${currentHour}:${currentMinute}`);


                    document.getElementById("hour").textContent = `Current time : ${currentHour}:${currentMinute}`

                    fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${cityName}/${actualDate}/${sixDaysLater}?unitGroup=metric&iconSet=icons2&include=current&key=${APIKey[2]}&contentType=json`)
                    .then(response => response.json())
                    .then(forecastData => {
                        // console.log(forecastData)
                        /* Part on actual day : */
                        let logo = forecastData["days"][0]["icon"] // get correctly the logo ID, just use it in the url || Have an icon need to know how to get it
                        let h2 = document.createElement("h2")
                        h2.id = "name"
                        h2.textContent = cityName
                        document.getElementById("name").replaceWith(h2) // could create an h2 in advance but this works
                        document.getElementById("logo").style.backgroundImage = `url('https://raw.githubusercontent.com/visualcrossing/WeatherIcons/2de560da89d87de44e3ca2a6593a12c19c8346d3/SVG/2nd%20Set%20-%20Color/${logo}.svg')`
                        document.getElementById("temp").textContent = `${forecastData["days"]['0']['temp']} C°`
                        document.getElementById("time").textContent = `${forecastData['days'][0]['description']}`
                        document.getElementById("min").textContent = `Min : ${forecastData["days"][0]['tempmin']}`
                        document.getElementById("max").textContent = `Max : ${forecastData["days"][0]['tempmax']}`
                        let wind = document.createElement("p")
                        wind.id = "wind"
                        document.getElementById("wind").replaceWith(wind)
                        document.getElementById("windLogo").style.display = "flex" // I need this line to force the logo to be in display flex otherwise it didn't apply.
                        document.getElementById("sunrise").textContent = `Sunrise : ${forecastData["days"][0]["sunrise"]}`
                        document.getElementById("sunset").textContent = `Sunset : ${forecastData["days"][0]["sunset"]}`
                        let sunsetEpoch = new Date (forecastData["days"][0]["sunsetEpoch"]*1000)
                        let sunriseEpoch = new Date (forecastData["days"][0]["sunriseEpoch"]*1000)
                        sunsetEpoch.setTime(sunsetEpoch.getTime() + sunsetEpoch.getTimezoneOffset() * 60 * 1000 + forecastData["tzoffset"]*1000*3600);
                        sunriseEpoch.setTime(sunriseEpoch.getTime() + sunriseEpoch.getTimezoneOffset() * 60 * 1000 + forecastData["tzoffset"]*1000*3600);

                        // console.log("sunset :" + sunsetEpoch)
                        // console.log("sunrise : " + sunriseEpoch)
                        if(localTime > sunsetEpoch || localTime < sunriseEpoch){
                            document.body.style.background = 'linear-gradient(to bottom, #000033, #000066)'
                        }
                        else{
                            document.body.style.background = 'linear-gradient(159deg, rgba(131,58,180,1) 0%, rgba(253,29,29,1) 50%, rgba(252,176,69,1) 100%)'
                        }
                        document.getElementById("wind").textContent = forecastData["days"][0]["windspeed"] + " Km/h"


                        /* ----------------- 6 next days part : ------------------ */
                        for (let i = 1 ; i < forecastData["days"].length ; i++){ // i =1 bc we already display the day 0
                            let day = new Date(forecastData["days"][i]["datetimeEpoch"]*1000)
                            console.log(`Loop ${i} : ${day.getDate()}`)
                            let dateInFuture = `${day.getDate()} / ${day.getMonth()+1} / ${day.getFullYear()}` 
                            day = day.getDay()
                            switch (day) {
                                case 0:
                                  day = 'Sunday';
                                  break;
                                case 1:
                                  day = 'Monday';
                                  break;
                                case 2:
                                  day = 'Tuesday';
                                  break;
                                case 3:
                                  day = 'Wednesday';
                                  break;
                                case 4:
                                  day = 'Thursday';
                                  break;
                                case 5:
                                  day = 'Friday';
                                  break;
                                case 6:
                                  day = 'Saturday';
                                  break;
                                default:
                                  day = 'Invalid day';
                              }
                            document.getElementById(`day${i}Day`).textContent = day
                            document.getElementById(`day${i}Date`).textContent = dateInFuture
                            document.getElementById(`day${i}logo`).style.backgroundImage = `url('https://raw.githubusercontent.com/visualcrossing/WeatherIcons/2de560da89d87de44e3ca2a6593a12c19c8346d3/SVG/2nd%20Set%20-%20Color/${forecastData["days"][i]["icon"]}.svg')`
                            document.getElementById(`day${i}Min`).textContent = `Min : ${forecastData["days"][i]["tempmin"]} °`
                            document.getElementById(`day${i}Max`).textContent = `Max : ${forecastData["days"][i]["tempmax"]} °`
                            document.getElementById(`day${i}Desc`).textContent = forecastData["days"][i]["description"]
                        }
                    })
                })


                .catch(error => {
                    console.log("Error:", error);
                });
            }
        })
        
        .catch(error => {
            console.log('There was an error :', error)
            alert('There was an error please be sure you encoded correct data. Or contact administrator for more informations.')
        })

    }
}

displayWeather("Brussels")

document.getElementById("button").addEventListener("click", () => {
    let cityName = document.getElementById('cityName').value
    displayWeather(cityName)
})
