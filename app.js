const URL_MAIN = 'http://localhost:3000/userquotes'
const URL_AIRLINE = 'http://localhost:3000/airlines'

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

fetch(URL_MAIN)
.then(resp => resp.json())
.then(data => {
    data.forEach(element => {
        createCard(element.image, element.cities, element.nameDep, element.nameRet, element.price, element.departure, element.arrival, element.direct, 'delete', saveQuoteContainer)
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
    .then(data => renderQuotes(data, origin, destination, returnDate))
    .catch(err => {
	console.error(err);
    });
}


function renderQuotes(data,origin, destination, returnDate){
    while (flightContainer.firstChild) {
        flightContainer.removeChild(flightContainer.firstChild);
    }
    if (data.Quotes.length === 0){
        const noDataDiv = document.createElement('div')
        noDataDiv.className = 'nodata'
        const noData = document.createElement('h1')
        noData.innerText = 'NO QUOTES AVAILABLE'
        noDataDiv.append(noData)
        flightContainer.appendChild(noDataDiv)
    }
    else {

    let carrierArr = []

    data.Carriers.forEach(carrier => {
        carrierArr.push(carrier)
    })

    const [cityDep, cityArr] = (() => {
        let cityOrigin
        let cityDestination
        for (i = 0; i < data.Places.length; i++) {
            if (origin === data.Places[i].SkyscannerCode) {
                cityOrigin = data.Places[i].CityName
            }
            if (destination === data.Places[i].SkyscannerCode) {
                cityDestination = data.Places[i].CityName
            } 
        }
        return [cityOrigin, cityDestination]
    })()
    
    data.Quotes.forEach(quote => {
        const flightPrice = quote.MinPrice
        let flightIdDep = quote.OutboundLeg.CarrierIds[0]
        const flightDep = quote.OutboundLeg.DepartureDate
        //const flightTime = flightDep.slice(10)
        const flightDirect = quote.Direct ? `Direct Flight` : `Flight Stops`

        let [flightIdRet, flightRet] = (() => {
            if (returnDate) {
                return [quote.InboundLeg.CarrierIds[0], quote.InboundLeg.DepartureDate.slice(0,10)]
            }
            else {
                return ['','']
            }
        })()

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

        //const imgLink = 'https://www.gannett-cdn.com/presto/2019/06/23/USAT/c3a9f051-bd6c-4b39-b5b9-38244deec783-GettyImages-932651818.jpg?auto=webp&crop=667,375,x0,y80&format=pjpg&width=1200'
        const imgLink = (() => {
            for (i=0; i < airlines.length; i++) {
                if (flightIdDep === airlines[i].name) {
                    return airlines[i].image
                }
            }
        })()
        
        createCard(imgLink, cityDep + ' to ' + cityArr, flightIdDep, flightIdRet, flightPrice, flightDep.slice(0,10), returnDate, flightDirect, 'save', flightContainer)
    })
}}

function createCard(image, cities, nameDep, nameRet, price, departure, retur, direct, button, parentNode) {
    const flightCard = document.createElement('div')
    flightCard.className = 'flight-card'

    const flightCities = document.createElement('h1')
    flightCities.textContent = cities

    const displayDeparture = document.createElement('h3')
    displayDeparture.textContent = `Departure: ${departure}`

    const displayReturn = document.createElement('h3')
    if (retur) {
        displayReturn.textContent = `Return: ${retur}`
    }

    const flightImg = document.createElement('img')
    flightImg.src = image
    flightImg.className = 'flight-image'

    const flightNameDep = document.createElement('h1')
    flightNameDep.textContent = nameDep

    const flightNameRet = document.createElement('h1')
    flightNameRet.textContent = nameRet

    const displayPrice = document.createElement('h2')
    displayPrice.className = 'airline'
    displayPrice.textContent = `Price: $${price}` 

    const displayDirect = document.createElement('p')
    displayDirect.textContent = direct

    const btttn = document.createElement('button')

    const delQuote = () => {
        console.log('DELLEEEETTE')
    }

    if (button === 'save') {
        btttn.textContent = 'Save Quote!'
        btttn.addEventListener('click', () =>{
            const flights = {
                nameDep : nameDep,
                nameRet : nameRet,
                cities: cities,
                image : image,
                price : price,
                departure : departure,
                arrival : retur,
                direct : direct
            }
            fetch(URL_MAIN, {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify(flights)
            })
            btttn.remove()
            const delBttn = document.createElement('button')
            delBttn.textContent = 'Delete Quote'
            delBttn.addEventListener('click', delQuote)
            flightCard.append(delBttn)
            saveQuoteContainer.append(flightCard)
        })
    }
    else if (button === 'delete') {
        btttn.textContent = 'Delete Quote'
        btttn.addEventListener('click', delQuote)
    }

    flightCard.append(flightImg, flightCities, displayPrice, flightNameDep, displayDeparture, flightNameRet, displayReturn, displayDirect, btttn)
    parentNode.appendChild(flightCard)
}

renderInputs('IAH','LAX','2021-09-14','')



