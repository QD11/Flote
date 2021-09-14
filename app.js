const URL_MAIN = 'http://localhost:3000/userquotes'

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
const saveQuoteContainer = document.querySelector('#saved-quotes-container')



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
    let returnDateUrl = ''
    if (returnDate) {
        returnDateUrl = `?inboundpartialdate=${returnDate}`
    }
    const URL = `https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsedates/v1.0/US/USD/en-US/${origin}/${destination}/${departingDate}/` + returnDateUrl
    // console.log(URL)
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
    let carrierArr = []

    data.Carriers.forEach(carrier => checkFlight(carrier))

    // console.log(carrierArr)
    function checkFlight(carrier){
        // console.log(carrier)
        carrierArr.push(carrier)
    }
    
    while (flightContainer.firstChild) {
        flightContainer.removeChild(flightContainer.firstChild);
    }
    data.Quotes.forEach(quote => {
        // console.log(quote)

        
        const flightPrice = quote.MinPrice
        let flightId = quote.OutboundLeg.CarrierIds[0]
        const flightDep = quote.OutboundLeg.DepartureDate
        const flightTime = flightDep.slice(10)
        const flightDirect = quote.Direct ? `Direct Flight` : `Connecting`

        carrierArr.forEach(elem => {
            if(flightId === elem.CarrierId) {
            flightId = elem.Name           
            }
        })
        const flightCard = document.createElement('div')
        flightCard.className = 'flight-card'

        const flightName = document.createElement('h1')
        flightName.textContent = flightId

        const flightImg = document.createElement('img')
        flightImg.src = 'https://www.gannett-cdn.com/presto/2019/06/23/USAT/c3a9f051-bd6c-4b39-b5b9-38244deec783-GettyImages-932651818.jpg?auto=webp&crop=667,375,x0,y80&format=pjpg&width=1200'
        flightImg.className = 'flight-image'

        const displayPrice = document.createElement('h2')
        displayPrice.className = 'airline'
        displayPrice.textContent = `Price: $${flightPrice}`

        const displayDeparture = document.createElement('h3')
        displayDeparture.textContent = `Departure: ${flightDep.slice(0,10)}`

        const displayDirect = document.createElement('p')
        displayDirect.textContent = flightDirect 

        const saveBttn = document.createElement('button')
        saveBttn.textContent = 'Save Quote'
        saveBttn.addEventListener('click', saveQuote)

        flightCard.append(flightImg, flightName, displayPrice, displayDeparture, displayDirect, saveBttn)
        flightContainer.appendChild(flightCard)

      

        function saveQuote(e){

            const flights = {
                name : flightName.textContent,
                image : flightImg.src,
                price : displayPrice.textContent,
                departure : displayDeparture.textContent,
                direct : displayDirect.textContent
            }
            console.log(flights)
            fetch(URL_MAIN, {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify(flights)
            })

            saveQuoteContainer.appendChild(flightCard)
        }
        
    })
}





renderInputs('IAH','LAX','anytime','')
