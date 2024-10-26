let price = prompt("Enter the price: ")
let discount = prompt("Enter the discount: ")

function calculatePrice(price, discount = 10) {
    if (price < 0 || discount < 0) {
        console.log("Unvalid input! Try again.")
        return
    }
    return price - ((price / 100) * discount)
}

console.log("The total discounted price is : Rs", calculatePrice(price, discount))