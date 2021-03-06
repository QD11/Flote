const URL_MAIN = 'http://localhost:3000/userquotes'
const URL_AIRLINE = 'http://localhost:3000/airlines'
const URL_AIRPORT = 'http://localhost:3000/airports'

const today = new Date().toISOString().slice(0, 10)
const tomorrow = new Date() 
tomorrow.setDate(tomorrow.getDate() + 1);
const newTomorrow = tomorrow.toISOString().slice(0,10)
const date = document.querySelector('#leave-date')
date.textContent = today
const flightContainer = document.querySelector('#flight-render-container')
const quoteForm = document.getElementById('flight-form')
const outboundAirport = document.getElementById('outbound-terminal')
const arrivalAirport = document.getElementById('arrival-terminal')
const leaveDate = document.getElementById('leave-date')
leaveDate.value = today
leaveDate.min = today
const returnDate = document.getElementById('return-date')
const roundTrip = document.querySelector('#round-trip')
const saveQuoteContainer = document.querySelector('#saved-quotes-container')
const saveQuoteTitle = document.querySelector('#user-saves')
const selectCities = document.querySelector('#map-cities')
const quoteBttn = document.querySelector('#quote-bttn')
const flightPathHolder = []
const markerAirplaneHolder = []

function initMap() { //Google Map initial function
    const location = { //location of middle of US
    lat: 37.8,
    lng: -96
    }
    const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4.5,
    center: location
    })
    
    let options = {
        types: ['(cities)'],
        componentRestrictions: {
            country: "USA",
        }
    }

    const airPortList = []

    fetch(URL_AIRPORT)
    .then(resp => resp.json())
    .then(data => {
        data.forEach(item => airPortList.push(item))
    })

    const depCities = document.querySelector('#departing-city')
    const depAutocomplete = new google.maps.places.Autocomplete(depCities, options)
    const selectDepAirport = document.querySelector('#outbound-terminal')
    const arrvCities = document.querySelector('#arriving-city')
    const arrvAutocomplete = new google.maps.places.Autocomplete(arrvCities, options)
    const selectArrvAirport = document.querySelector('#arrival-terminal')

    const depMarkerArray = []
    google.maps.event.addListener(depAutocomplete, 'place_changed', () => {
        grabAirportData(depCities, depAutocomplete, selectDepAirport, depMarkerArray,'depart')
    })

    const arrvMarkerArray = []
    google.maps.event.addListener(arrvAutocomplete, 'place_changed', () => {
        grabAirportData(arrvCities, arrvAutocomplete, selectArrvAirport, arrvMarkerArray, 'arrive')
    })
    

    function grabAirportData(cityElement, autoComplete, selectAirportElement, markerArray, path){
        const cityVal = autoComplete.getPlace()
        const cityValue = cityElement.value
        const city = cityValue.split(",")[0]
        const stateShort = cityValue.split(",")[1].slice(1)
        const state = cityVal.address_components.filter(s => s.short_name === stateShort)[0].long_name
        const airPortData = airPortList.filter(i => i.city === city && i.state === state)

        while (selectAirportElement.firstChild) {
            selectAirportElement.removeChild(selectAirportElement.firstChild);
        }

        if (flightPathHolder.length === 1){
            flightPathHolder[0].setMap(null)
            flightPathHolder[0] = null
            flightPathHolder.length = 0
        }

        if(airPortData.length === 0){
            selectAirportElement.disabled = true
            const showNoAirport = document.createElement('option')
            showNoAirport.textContent = `No Airports In ${city} ${state}`
            selectAirportElement.appendChild(showNoAirport)
        }
        else{   
                selectAirportElement.disabled = false
                markerArray.forEach(marker => marker.setMap(null))
                markerArray.length = 0
                markerAirplaneHolder.forEach(marker => marker.setMap(null))
                markerAirplaneHolder.length = 0
                const mapBound2 = new google.maps.LatLngBounds()
                airPortData.forEach(d => {
                    const airportOption = document.createElement('option')
                    airportOption.textContent = d.name + ` (${d.code})`                
                    airportOption.value = d.code
                    selectAirportElement.appendChild(airportOption)
                    const marker = (path === 'arrive') ? new google.maps.Marker({
                        position : {
                            lat : parseFloat(d.lat),
                            lng : parseFloat(d.lon)
                        },
                        map,
                        title:  d.name + ` (${d.code})`,
                        icon: {                             
                            url: "Img/blue_48.png",
                        }
                    }) : 
                    new google.maps.Marker({
                        position : {
                            lat : parseFloat(d.lat),
                            lng : parseFloat(d.lon)
                        },
                        map,
                        title:  d.name + ` (${d.code})`,
                        icon: {                             
                            url: "Img/red_48.png",
                        }
                    })
                    const infoWindow = new google.maps.InfoWindow({
                        content : d.name + ` (${d.code})`
                    })
                    marker.addListener("mouseover", function() {
                        infoWindow.open(map, this)
                        marker.setIcon({
                            url: (path==="arrive"? "Img/blue_80.png":"Img/red_80.png"),
                        })
                    })
                    marker.addListener("mouseout", function() {
                        infoWindow.close()
                        marker.setIcon({
                            url: (path==="arrive"? "Img/blue_48.png":"Img/red_48.png"),
                        })
                    })
                    markerArray.push(marker)
                    depMarkerArray.forEach(marker => {
                        const loc = new google.maps.LatLng(marker.position.lat(), marker.position.lng());
                        mapBound2.extend(loc)
                    })
                    arrvMarkerArray.forEach(marker => {
                        const loc = new google.maps.LatLng(marker.position.lat(), marker.position.lng());
                        mapBound2.extend(loc)
                    })
                    map.fitBounds(mapBound2);       
                    map.panToBounds(mapBound2);    
                })
                for (let i = 0; i < markerArray.length; i++) {
                    markerArray[i].addListener("click", () => {
                        selectAirportElement.selectedIndex = i
                    })
                }
                if(selectDepAirport.value && selectArrvAirport.value){
                    quoteBttn.disabled = false
                    quoteBttn.style.background = "black"; 
                    quoteBttn.style.color = "white"
                    quoteBttn.style.opacity = "1"
                }else{                      
                    quoteBttn.disabled = true
                    quoteBttn.style.opacity = "0.3"
                }
            }
        }
    
    fetch(URL_MAIN)
    .then(resp => resp.json())
    .then(data => {
        data.forEach(element => {
            createCard(element, 'delete', saveQuoteContainer)
            if(element) saveQuoteTitle.style.display = 'block'
        })
    })

    const airlines = []
    fetch(URL_AIRLINE)
    .then(resp => resp.json())
    .then(data => {
        data.forEach(element => {
            airlines.push(element)
        }
        )}
    )

    roundTrip.addEventListener('change', (event) => {
        if (event.currentTarget.checked) {
            returnDate.disabled = false
            const valueLeaveDate = new Date(leaveDate.value)
            valueLeaveDate.setDate(valueLeaveDate.getDate() + 1)
            const tomorrowDay = valueLeaveDate.toISOString().slice(0,10)
            returnDate.min = tomorrowDay
            returnDate.value = tomorrowDay
        } else {
            returnDate.value = ''
            returnDate.disabled = true
        }
    })

    leaveDate.addEventListener('change', event => {
        const valueLeaveDate = new Date(leaveDate.value)
        valueLeaveDate.setDate(valueLeaveDate.getDate() + 1)
        const tomorrowDay = valueLeaveDate.toISOString().slice(0,10)
        returnDate.min = tomorrowDay
        if (returnDate.value) {
            if( (new Date(returnDate.value).getTime() < new Date(tomorrowDay).getTime())) {
                returnDate.value = tomorrowDay
            }
        }
    })

    quoteForm.addEventListener('submit', event => {
        event.preventDefault()
        renderInputs(outboundAirport.value, arrivalAirport.value, leaveDate.value, returnDate.value)
        depMarkerArray.forEach(marker => marker.setMap(null))
        arrvMarkerArray.forEach(marker => marker.setMap(null))
        
        if (flightPathHolder.length === 1){
            flightPathHolder[0].setMap(null)
            flightPathHolder[0] = null
            flightPathHolder.length = 0
        }

        markerAirplaneHolder.forEach(marker => marker.setMap(null))
        markerAirplaneHolder.length = 0

        const departInfo = airPortList.find(x => x.code === outboundAirport.value)
        const arriveInfo = airPortList.find(x => x.code === arrivalAirport.value)

        const mapBound = new google.maps.LatLngBounds()

        const infoWindowDep = new google.maps.InfoWindow({
            content :  departInfo.name + ` (${departInfo.code})`
        })
        const infoWindowArr = new google.maps.InfoWindow({
            content :  arriveInfo.name + ` (${arriveInfo.code})`
        })

        const infoWindowAirplane = new google.maps.InfoWindow({
            content : `Distance is ${calcCrow(parseFloat(departInfo.lat), parseFloat(departInfo.lon), parseFloat(arriveInfo.lat), parseFloat(arriveInfo.lon))} miles. Estimated 
            flight time is ${(calcCrow(parseFloat(departInfo.lat), parseFloat(departInfo.lon), parseFloat(arriveInfo.lat), parseFloat(arriveInfo.lon))/523).toFixed(2)} hours.`
        })

        depMarkerArray[0] = new google.maps.Marker({
            position : {
                lat : parseFloat(departInfo.lat),
                lng : parseFloat(departInfo.lon)
            },
            map,
            title:  departInfo.name + ` (${departInfo.code})`,
            icon: {                             
                url: "Img/icons8-marker-a-80.png"}
        })

        const markerAirplane = new google.maps.Marker({
            position : {
                lat : (parseFloat(departInfo.lat)+parseFloat(arriveInfo.lat))/2,
                lng : (parseFloat(departInfo.lon)+parseFloat(arriveInfo.lon))/2
            },
            map,
            icon: {                             
                url: "Img/iconAirplane.png"}
        })

        arrvMarkerArray[0] = new google.maps.Marker({
            position : {
                lat : parseFloat(arriveInfo.lat),
                lng : parseFloat(arriveInfo.lon)
            },
            map,
            title:  arriveInfo.name + ` (${arriveInfo.code})`,
            icon: {                             
                url: "Img/icons8-marker-b-80.png"}
        })

        depMarkerArray[0].addListener("mouseover", function() {
            infoWindowDep.open(map, this)
        })
        depMarkerArray[0].addListener("mouseout", function() {
            infoWindowDep.close()
        })

        markerAirplane.addListener("mouseover", function() {
            infoWindowAirplane.open(map, this)
        })
        markerAirplane.addListener("mouseout", function() {
            infoWindowAirplane.close()
        })

        arrvMarkerArray[0].addListener("mouseover", function() {
            infoWindowArr.open(map, this)
        })
        arrvMarkerArray[0].addListener("mouseout", function() {
            infoWindowArr.close()
        })

        const depLoc = new google.maps.LatLng(parseFloat(departInfo.lat), parseFloat(departInfo.lon));
        const arrLoc = new google.maps.LatLng(parseFloat(arriveInfo.lat), parseFloat(arriveInfo.lon));

        mapBound.extend(depLoc);
        mapBound.extend(arrLoc);

        map.fitBounds(mapBound);
        map.panToBounds(mapBound);

        removeOtherOptions(outboundAirport)
        removeOtherOptions(arrivalAirport)

        addFlightPath(departInfo, arriveInfo)

        markerAirplaneHolder.push(markerAirplane)

        function addFlightPath(departInfo, arriveInfo) {
            const flightPlanCoordinates = [
                { lat: parseFloat(departInfo.lat), lng: parseFloat(departInfo.lon)},
                { lat: parseFloat(arriveInfo.lat), lng: parseFloat(arriveInfo.lon)},
            ]

            let flightPath = new google.maps.Polyline({
                path: flightPlanCoordinates,
                geodesic: true,
                strokeColor: "#FF0000",
                strokeOpacity: 1.0,
                strokeWeight: 2,
            });

            flightPathHolder.push(flightPath)

            flightPath.setMap(map)
        }

        function removeOtherOptions(parentNode) {
            parentNode.childNodes.forEach(option => {
                if (option.value != parentNode.value) {
                    option.remove()
                }
            })
        }

        function calcCrow(lat11, lon11, lat22, lon22) {
        const R = 6371; // km
        const dLat = toRad(lat22-lat11);
        const dLon = toRad(lon22-lon11);
        const lat1 = toRad(lat11);
        const lat2 = toRad(lat22);

        const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        const d = R * c * 0.621371; //convert to miles
        const roundedMile = Math.round(d)
        return roundedMile;
        }

        function toRad(Value) {
        return Value * Math.PI / 180;
        }

    })

    function renderInputs(origin, destination, departingDate, returnDate = '') {
        const URL = `https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsedates/v1.0/US/USD/en-US/${origin}/${destination}/${departingDate}/${returnDate}`
        fetch(URL, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
            "x-rapidapi-key": "4c29bc4fdemsh7a37d6b25c8c2f1p1a2bb7jsn876b1a4c77b9"
        }
        })
        .then(response => response.json())
        .then(data => renderQuotes(data, origin, destination, returnDate))
        // .catch(err => {
        // console.error(err);});
    }

    function renderQuotes(data,origin, destination, returnDate){
        while (flightContainer.firstChild) {
            flightContainer.removeChild(flightContainer.firstChild);
        }
        if (data.Quotes.length === 0){
            const noData = document.createElement('h1')
            noData.innerText = '???? No Data Available'
            noData.className = 'no-data'
            flightContainer.appendChild(noData)
        }
        else {

        const carrierArr = []

        data.Carriers.forEach(carrier => {
            carrierArr.push(carrier)
        })
        const cityDep = data.Places.find(x => x.SkyscannerCode === origin).CityName
        const cityArr = data.Places.find(x => x.SkyscannerCode === destination).CityName

        data.Quotes.forEach(quote => {
            const flightPrice = quote.MinPrice
            let flightIdDep = quote.OutboundLeg.CarrierIds[0]
            const flightDep = quote.OutboundLeg.DepartureDate
            const flightDirect = quote.Direct ? `Direct Flight` : `Connecting Flight`
            let [flightIdRet, flightRet] = returnDate ? [quote.InboundLeg.CarrierIds[0], quote.InboundLeg.DepartureDate.slice(0,10)] : ['','']

            carrierArr.forEach(elem => {
                if(flightIdDep === elem.CarrierId) {
                flightIdDep = elem.Name           
                }
                if (returnDate) {
                    if (flightIdRet === elem.CarrierId) {
                        flightIdRet = elem.Name
                    }
                }
            })
            const imgLinkDep = airlines.find(x => x.name == flightIdDep) ? airlines.find(x => x.name == flightIdDep).image : ''
            
            const imgLinkRet = returnDate ? airlines.find(x => x.name == flightIdRet).image :  ''

            const flightInfo = {
                nameDep : flightIdDep,
                nameRet : flightIdRet,
                cities: cityDep + ` (${outboundAirport.value})` + ' ??? ' + cityArr + ` (${arrivalAirport.value})`,
                imgDep : imgLinkDep,
                imgRet : imgLinkRet,
                price : flightPrice,
                departure : flightDep.slice(0,10),
                arrival : returnDate,
                direct : flightDirect  
            }
            createCard(flightInfo, 'save', flightContainer)
        })
    }}

    function createCard(flightInfo, button, parentNode) {
        const flightCard = document.createElement('div')
        flightCard.className = 'flight-card'

        const flightCities = document.createElement('h1')
        flightCities.textContent = flightInfo.cities

        const displayDeparture = document.createElement('h3')
        displayDeparture.textContent = `Departure: ${flightInfo.departure}`
        displayDeparture.className = 'departure-class'

        const displayReturn = document.createElement('h3')
        displayReturn.textContent = (flightInfo.arrival) ? `Return: ${flightInfo.arrival}` : ''

        const flightImgDep = document.createElement('img')
        flightImgDep.className = 'flight-image'
        flightImgDep.src =  flightInfo.imgDep ? flightInfo.imgDep : "Img/depAirplane.png"

        const flightImgRet = document.createElement('img')
        flightImgRet.className = 'flight-image'
        flightImgRet.src =  flightInfo.imgRet ? flightInfo.imgRet : "Img/arrAirplane.png"

        const flightNameDep = document.createElement('h1')
        flightNameDep.textContent = flightInfo.nameDep

        const flightNameRet = document.createElement('h1')
        flightNameRet.textContent = flightInfo.nameRet

        const displayPrice = document.createElement('h2')
        displayPrice.className = 'airline'
        displayPrice.textContent = `????${flightInfo.price}` 

        const displayDirect = document.createElement('h3')
        displayDirect.textContent = flightInfo.direct

        const hr = document.createElement('hr')

        const departDiv = document.createElement('div')
        departDiv.className = 'depart-div'

        const returnDiv = document.createElement('div')
        returnDiv.className = 'return-div'

        const topDiv = document.createElement('div')
        topDiv.className = 'top-div'

        topDiv.append(displayDirect,flightCities, displayPrice)
        departDiv.append(flightImgDep, flightNameDep, displayDeparture)
        returnDiv.append(flightImgRet, flightNameRet, displayReturn)

        const saveBttn = document.createElement('button')
        saveBttn.id = 'save-button'
        saveBttn.textContent = 'Save Ticket!'
        saveBttn.addEventListener('click', (event) => {
            fetch(URL_MAIN, {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify(flightInfo)
            })
            .then(resp => resp.json())
            .then(function(flightInfo) {
            saveBttn.remove()
            saveQuoteTitle.style.display = 'block'
            const delBttn = document.createElement('button')
            delBttn.id = 'del-button'
            delBttn.textContent = 'Delete Ticket'
            delBttn.addEventListener('click', () => {
                delQuote(flightInfo)
            })
            flightCard.append(delBttn)
            saveQuoteContainer.append(flightCard)
            })
        })

        const delBttn = document.createElement('button')
        delBttn.id = 'del-button'
        delBttn.textContent = 'Delete Ticket'
        delBttn.addEventListener('click', () => {
            delQuote(flightInfo)
        })

        function delQuote(flightInfo) {
            flightCard.remove()
            saveQuoteTitle.style.display = saveQuoteContainer.firstChild? 'block' : 'none'
            fetch(`${URL_MAIN}/${flightInfo.id}`, {
                method: "DELETE",
            });
        }

        if(flightInfo.arrival){
            if (button === 'save'){
                flightCard.append( topDiv, departDiv, hr, returnDiv ,saveBttn)
            } else {
                flightCard.append( topDiv, departDiv, hr, returnDiv,delBttn)
            }
        }else{
            if (button === 'save'){
                flightCard.append( topDiv, departDiv,saveBttn)
            } else {
                flightCard.append( topDiv, departDiv,delBttn)
            }
        }
        parentNode.appendChild(flightCard)
    }
}

