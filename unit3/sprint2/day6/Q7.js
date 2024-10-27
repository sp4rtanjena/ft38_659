const employees = [
    { name: "John Doe", age: 30, department: "HR", salary: 50000 },
    { name: "Jane Smith", age: 28, department: "Finance", salary: 60000 },
    { name: "Alex Johnson", age: 35, department: "IT", salary: 70000 },
];

function highestPaid(employees) {
    // let salaries = employees.map(temp => temp.salary)
    // salaries.sort((a, b) => a - b)
    // let max = salaries[salaries.length - 1]
    // let highest
    // for (let i in employees) {
    //     if (employees[i].salary === max) highest = employees[i]
    // }
    // return highest

    const highest = employees.reduce((max, emp) => {
        return emp.salary > max.salary ? emp : max
    }, employees[0])

    return highest
}

function destructuringToSwap(employees) {
    if (employees.length < 2) return employees
    let temp = employees[0]
    employees[0] = employees[employees.length - 1]
    employees[employees.length - 1] = temp
    return employees
}

console.log(highestPaid(employees))
console.log(destructuringToSwap(employees))