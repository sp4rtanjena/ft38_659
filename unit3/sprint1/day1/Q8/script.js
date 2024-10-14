let rows = document.querySelectorAll("#products tr")
let sum = 0

for (let i = 1; i < rows.length - 1; i++) {
    let quantityCell = rows[i].cells[1]
    let priceCell = rows[i].cells[2]
    let totalCell = rows[i].cells[4]

    let q = parseInt(quantityCell.textContent)
    let p = parseInt(priceCell.textContent)

    let t = q * p

    totalCell.textContent = t.toFixed()
    sum += t
}

document.getElementById("sum").textContent = sum.toFixed()
