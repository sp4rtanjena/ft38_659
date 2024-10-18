const timeDisplay = document.getElementById('timeDisplay')

function updateTime() {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const seconds = now.getSeconds()
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    timeDisplay.innerText = formattedTime
}

setInterval(updateTime, 1000)