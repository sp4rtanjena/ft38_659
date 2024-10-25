let n = Number(prompt())

if (n > 0 && n < 11) {
    for (let i = 1; i <= n; i++) {
        if (i % 3 === 0) continue
        else {
            let arr = []
            for (let j = 1; j <= i; j++) {
                if (j % 3 === 0) continue
                if (j % 7 === 0) break
                else {
                    arr.push(j)
                }
            }
            console.log(arr.join(" "))
        }
    }
}