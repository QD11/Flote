const today = new Date().toISOString().slice(0, 10)
<<<<<<< HEAD


const date = document.querySelector('#leave-date')
date.textContent = today

console.log(date)
=======
const date = document.querySelector('#leave-date')
date.textContent = today
console.log(date)


function renderInputs(origin, destination, departingDate, returnDate = '') {
    if (returnDate) {
        const returnDateUrl = `?inboundpartialdate=${returnDate}`
    }
    else {
        const returnDateUrl = ''
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
    .then(response => {response.json()})
    .then(data => data.forEach(element, {
        
    }))
    .catch(err => {
	console.error(err);
    });
}

renderInputs('IAH','LAX','2021-09-13')
>>>>>>> ca66a997a5c3a31c7a320cac01199f644f25a82d
