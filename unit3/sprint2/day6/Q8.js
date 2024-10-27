const school = {
    name: "XYZ School",
    establishYear: 1990,
    departments: {
        math: { teachers: 5, students: 150 },
        science: { teachers: 4, students: 120 },
        history: { teachers: 3, students: 100 },
        english: { teachers: 4, students: 130 },
    },
    courses: ["math", "science", "history", "english"],
    students: [
        {
            name: "Alice",
            className: "Grade 5",
            scores: { math: 95, science: 88, history: 85, english: 92 },
        },
        {
            name: "Bob",
            className: "Grade 4",
            scores: { math: 80, science: 78, history: 92, english: 85 },
        },
        {
            name: "Charlie",
            className: "Grade 5",
            scores: { math: 88, science: 90, history: 78, english: 88 },
        },
        {
            name: "Diana",
            className: "Grade 4",
            scores: { math: 92, science: 85, history: 88, english: 90 },
        },
    ],
};

function countCalculation(school) {
    const mathTeachersCount = school.departments.math.teachers
    const histroyTeachersCount = school.departments.history.teachers
    const mathStudentsCount = school.departments.math.students
    const histroyStudentsCount = school.departments.history.students
    const res = {
        "mathTeachersCount": mathTeachersCount,
        "histroyTeachersCount": histroyTeachersCount,
        "mathStudentsCount": mathStudentsCount,
        "histroyStudentsCount": histroyStudentsCount
    }
    return res
}

function findTopStudent(school, subject) {
    const topStudent = school.students.reduce((max, stud) => {
        return stud.scores[subject] > max.scores[subject] ? stud : max
    }, school.students[0])
    return topStudent
}

let newDep = { teachers: 2, students: 50 }
function addNewDept(school, newDep) {
    let newDepName = prompt("Enter the name of the new department: ")
    school.departments[newDepName] = newDep
    return school
}

function highestStudentCountDepartment(school) {
    let highestStudCountDep = null, max = 0
    Object.entries(school.departments).forEach(([dep, temp]) => {
        if (temp.students > max) {
            max = temp.students
            highestStudCountDep = dep
        }
    })
    return highestStudCountDep
}

function generateGreeting(name, lang = "English") {
    let greet = ``
    if (lang === "English") greet += `Hello, ${name}!`
    else if (lang === "Spanish") greet += `¡Hola, ${name}!`
    else if (lang === "French") greet += `Bonjour, ${name}!`
    return greet
}

console.log(countCalculation(school))

console.log(findTopStudent(school, "math"))

console.log(addNewDept(school, newDep))

console.log(highestStudentCountDepartment(school))

console.log(generateGreeting("Alice"))
console.log(generateGreeting("Bob", "Spanish"))
console.log(generateGreeting("Charlie", "French"))