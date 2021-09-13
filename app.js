const today = new Date().toISOString().slice(0, 10)
const date = document.querySelector('#leave-date')
date.textContent = today
console.log(date)


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
    .then(data => console.log(data))
    .catch(err => {
	console.error(err);
    });
}

renderInputs('IAH','LAX','2021-09-13')