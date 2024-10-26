let n = prompt("Enter the the value of n: ")


function printTriangle(n) {
    for (let i = 1; i <= n; i++) {
        let temp = ""
        for (let j = 1; j <= i; j++) {
            temp += j
        }
        console.log(temp)
    }
}

printTriangle(n)