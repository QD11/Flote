const today = new Date().toISOString().slice(0, 10)
const date = document.querySelector('#leave-date')
const flightContainer = document.querySelector('#flight-render-container')
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
    data.Quotes.forEach(quote => {
        //min pirce
        //carrierid
        //departure date / time
        //direct - true/false
        console.log(quote)
        const flightPrice = quote.MinPrice
        const flightCarrier = quote.OutboundLeg.CarrierIds[0]
        const flightDep = quote.OutboundLeg.DepartureDate
        const flightTime = flightDep.slice(10)
        const flightDirect = quote.Direct

        const flightCard = document.createElement('div')
        flightCard.className = 'flight-card'

        const displayPrice = document.createElement('h3')
        displayPrice.textContent = `$${flightPrice}`

        const displayDeparture = document.createElement('p')
        displayDeparture.textContent = flightDep
        
        const displayTime = document.createElement('li')
        displayTime.textContent = flightTime

        const displayDirect = document.createElement('li')
        displayDirect.textContent = flightDirect

        flightCard.append(displayPrice, displayDeparture, displayTime, displayDirect)
        flightContainer.appendChild(flightCard)
    })
}


renderInputs('IAH','LAX','anytime','')
