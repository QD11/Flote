const today = new Date().toISOString().slice(0, 10)
const date = document.querySelector('#leave-date')
const flightContainer = document.querySelector('#flight-render-container')
const quoteForm = document.getElementById('flight-form')
const outboundAirport = document.getElementById('outbound-terminal')
const arrivalAirport = document.getElementById('arrival-terminal')
const leaveDate = document.getElementById('leave-date')
leaveDate.value = today
leaveDate.min = today
const returnDate = document.getElementById('return-date')
let carrierId; 

quoteForm.addEventListener('submit', event => {
    event.preventDefault()
    renderInputs(outboundAirport.value, arrivalAirport.value, leaveDate.value, returnDate.value)
})

date.textContent = today


function renderInputs(origin, destination, departingDate, returnDate = '') {
    let returnDateUrl = ''
    if (returnDate) {
        returnDateUrl = `?inboundpartialdate=${returnDate}`
    }
    const URL = `https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsedates/v1.0/US/USD/en-US/${origin}/${destination}/${departingDate}/` + returnDateUrl
    console.log(URL)
    fetch(URL, {
	"method": "GET",
	"headers": {
		"x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
		"x-rapidapi-key": "4c29bc4fdemsh7a37d6b25c8c2f1p1a2bb7jsn876b1a4c77b9"
	}
    })
    .then(response => response.json())
    .then(data => renderQuotes(data))
    .catch(err => {
	console.error(err);
    });
}


function renderQuotes(data){

    // data.Carriers.forEach(carrier => checkFlight(carrier))

    // // function checkFlight(carrier){
    // //     //later
    // // }
    
    while (flightContainer.firstChild) {
        flightContainer.removeChild(flightContainer.firstChild);
    }
    data.Quotes.forEach(quote => {
        console.log(quote)

      
        const flightPrice = quote.MinPrice
        const flightId = quote.OutboundLeg.CarrierIds[0]
        const flightDep = quote.OutboundLeg.DepartureDate
        const flightTime = flightDep.slice(10)
        const flightDirect = quote.Direct ? `Direct Flight` : `Flight Stops`


        const flightCard = document.createElement('div')
        flightCard.className = 'flight-card'

        const displayPrice = document.createElement('h2')
        displayPrice.className = 'airline'
        displayPrice.textContent = `Price: $${flightPrice}`

        const displayDeparture = document.createElement('h3')
        displayDeparture.textContent = `Departure: ${flightDep.slice(0,10)}`
        
        const displayTime = document.createElement('p')
        displayTime.textContent = flightTime

        const displayDirect = document.createElement('p')
        displayDirect.textContent = flightDirect 

        flightCard.append(displayPrice, displayDeparture, displayTime, displayDirect)
        flightContainer.appendChild(flightCard)

      
    })

   
}


renderInputs('IAH','LAX','anytime','')
