const today = new Date().toISOString().slice(0, 10)
const tomorrow = new Date() 
tomorrow.setDate(tomorrow.getDate() + 1);
const newTomorrow = tomorrow.toISOString().slice(0,10)
const date = document.querySelector('#leave-date')
const flightContainer = document.querySelector('#flight-render-container')
const quoteForm = document.getElementById('flight-form')
const outboundAirport = document.getElementById('outbound-terminal')
const arrivalAirport = document.getElementById('arrival-terminal')
const leaveDate = document.getElementById('leave-date')
leaveDate.value = today
leaveDate.min = today
const returnDate = document.getElementById('return-date')
const roundTrip = document.querySelector('#round-trip')
// let carrierArr = []

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
})

date.textContent = today


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
    .then(data => renderQuotes(data, returnDate))
    .catch(err => {
	console.error(err);
    });
}


function renderQuotes(data, returnDate){
    while (flightContainer.firstChild) {
        flightContainer.removeChild(flightContainer.firstChild);
    }
    if (data.Quotes.length === 0){
        console.log('hey')
        const noDataDiv = document.createElement('div')
        noDataDiv.className = 'nodata'
        const noData = document.createElement('h1')
        noData.innerText = 'NO QUOTES AVAILABLE'
        noDataDiv.append(noData)
        flightContainer.appendChild(noDataDiv)
    }
    else {

    let carrierArr = []

    data.Carriers.forEach(carrier => checkFlight(carrier))

    console.log(carrierArr)
    console.log(data)
    function checkFlight(carrier){
        // console.log(carrier)
        carrierArr.push(carrier)
    }
    
    data.Quotes.forEach(quote => {
        // console.log(quote)
        const flightPrice = quote.MinPrice
        let flightIdDep = quote.OutboundLeg.CarrierIds[0]
        const flightDep = quote.OutboundLeg.DepartureDate
        const flightTime = flightDep.slice(10)
        const flightDirect = quote.Direct ? `Direct Flight` : `Flight Stops`
        
        let flightIdRet
        let flightRet
        if (returnDate) {
            flightIdRet = quote.InboundLeg.CarrierIds[0]
            flightRet = quote.InboundLeg.DepartureDate.slice(0,10)
        }


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

        let displayReturn
        let flightNameRet
        if (returnDate) {
            displayReturn = document.createElement('h3')
            displayReturn.textContent = `Return: ${returnDate}`
            flightNameRet = document.createElement('h1')
            flightNameRet.textContent = flightIdRet
        }
        

        const flightCard = document.createElement('div')
        flightCard.className = 'flight-card'

        const flightNameDep = document.createElement('h1')
        flightNameDep.textContent = flightIdDep

        const flightImg = document.createElement('img')
        flightImg.src = 'https://www.gannett-cdn.com/presto/2019/06/23/USAT/c3a9f051-bd6c-4b39-b5b9-38244deec783-GettyImages-932651818.jpg?auto=webp&crop=667,375,x0,y80&format=pjpg&width=1200'
        flightImg.className = 'flight-image'

        const displayPrice = document.createElement('h2')
        displayPrice.className = 'airline'
        displayPrice.textContent = `Price: $${flightPrice}`

        const displayDeparture = document.createElement('h3')
        displayDeparture.textContent = `Departure: ${flightDep.slice(0,10)}`

        
        const displayTime = document.createElement('p')
        displayTime.textContent = flightTime

        const displayDirect = document.createElement('p')
        displayDirect.textContent = flightDirect 

        const saveBttn = document.createElement('button')
        saveBttn.textContent = 'Save Quote'
        saveBttn.addEventListener('click', saveQuote)

        if (returnDate){
            flightCard.append(flightImg, flightNameDep, displayPrice, displayDeparture, flightNameRet, displayReturn, displayDirect, saveBttn)
        }
        else {
            flightCard.append(flightImg, flightNameDep, displayPrice, displayDeparture, displayTime, displayDirect, saveBttn)
        }
        
        flightContainer.appendChild(flightCard)
        
    })
}}

function saveQuote(e){
    console.log('need stuff')
}


renderInputs('IAH','LAX','2021-09-14','2021-09-29')
