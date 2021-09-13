const today = new Date().toISOString().slice(0, 10)


const date = document.querySelector('#leave-date')
date.textContent = today

console.log(date)