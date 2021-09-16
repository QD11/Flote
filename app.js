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

function initMap() { //Google Map initial function
    const location = { //location of middle of US
    lat: 37.8,
    lng: -96
    }
    const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
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
        const depCityVal = autoComplete.getPlace()
        const depCityValue = cityElement.value
        const depCity = depCityValue.split(",")[0]
        const depStateShort = depCityValue.split(",")[1].slice(1)
        const depState = depCityVal.address_components.filter(s => s.short_name === depStateShort)[0].long_name
        const airPortData = airPortList.filter(i => i.city === depCity && i.state === depState)
        console.log(airPortData)
        while (selectAirportElement.firstChild) {
            selectAirportElement.removeChild(selectAirportElement.firstChild);
        }

        if(airPortData.length === 0){
            selectAirportElement.disabled = true
            const showNoAirport = document.createElement('option')
            showNoAirport.textContent = `No Airports In ${depCity} ${depState}`
            selectAirportElement.appendChild(showNoAirport)
        }else{   
                selectAirportElement.disabled = false  
                markerArray.forEach(marker => marker.setMap(null))
                markerArray.length = 0
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
                            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"}
                    }) : 
                    new google.maps.Marker({
                        position : {
                            lat : parseFloat(d.lat),
                            lng : parseFloat(d.lon)
                        },
                        map,
                        title:  d.name + ` (${d.code})`,
                        icon: {                             
                            url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"}
                    })
                    markerArray.push(marker)
                })
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
            returnDate.min = newTomorrow
            returnDate.value = newTomorrow
        } else {
            returnDate.value = ''
            returnDate.disabled = true
        }
    })

    quoteForm.addEventListener('submit', event => {
        event.preventDefault()
        renderInputs(outboundAirport.value, arrivalAirport.value, leaveDate.value, returnDate.value)
        depMarkerArray.forEach(marker => marker.setMap(null))
        arrvMarkerArray.forEach(marker => marker.setMap(null))

        const departInfo = airPortList.find(x => x.code === outboundAirport.value)
        const arriveInfo = airPortList.find(x => x.code === arrivalAirport.value)

        console.log(departInfo)
        console.log(arriveInfo)

        depMarkerArray[0] = new google.maps.Marker({
            position : {
                lat : parseFloat(departInfo.lat),
                lng : parseFloat(departInfo.lon)
            },
            map,
            title:  departInfo.name + ` (${departInfo.code})`,
            icon: {                             
                url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"}
        })

        arrvMarkerArray[0] = new google.maps.Marker({
            position : {
                lat : parseFloat(arriveInfo.lat),
                lng : parseFloat(arriveInfo.lon)
            },
            map,
            title:  arriveInfo.name + ` (${arriveInfo.code})`,
            icon: {                             
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"}
        })

    })

    function renderInputs(origin, destination, departingDate, returnDate = '') {
        const URL = `https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsedates/v1.0/US/USD/en-US/${origin}/${destination}/${departingDate}/${returnDate}`
        console.log(URL)
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
            noData.innerText = 'NO QUOTES AVAILABLE'
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
                cities: cityDep + ' ✈ ' + cityArr,
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
        flightImgDep.src =  flightInfo.imgDep ? flightInfo.imgDep : 'https://komonews.com/resources/media/cfb385c3-b38c-49d1-a9d4-17b5fcf95d02-medium16x9_boeing_747_8_cargo.jpg?1477596133113'

        const flightImgRet = document.createElement('img')
        flightImgRet.className = 'flight-image'
        flightImgRet.src =  flightInfo.imgRet ? flightInfo.imgRet : ''

        const flightNameDep = document.createElement('h1')
        flightNameDep.textContent = flightInfo.nameDep

        const flightNameRet = document.createElement('h1')
        flightNameRet.textContent = flightInfo.nameRet

        const displayPrice = document.createElement('h2')
        displayPrice.className = 'airline'
        displayPrice.textContent = `💲${flightInfo.price}` 

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
        saveBttn.textContent = 'Save Quote!'
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
            console.log(flightInfo)
            saveBttn.remove()
            saveQuoteTitle.style.display = 'block'
            const delBttn = document.createElement('button')
            delBttn.id = 'del-button'
            delBttn.textContent = 'Delete Quote'
            delBttn.addEventListener('click', () => {
                delQuote(flightInfo)
            })
            flightCard.append(delBttn)
            saveQuoteContainer.append(flightCard)
            })
        })

        const delBttn = document.createElement('button')
        delBttn.id = 'del-button'
        delBttn.textContent = 'Delete Quote'
        delBttn.addEventListener('click', () => {
            delQuote(flightInfo)
        })

        function delQuote(flightInfo) {
            flightCard.remove()
            if(!saveQuoteContainer.flightCard) saveQuoteTitle.style.display = 'none'
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

