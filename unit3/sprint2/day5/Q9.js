function greetUser(name = "Guest") {

    console.log(name === "" ? "Hello! Guest" : "Hello! " + name)
}

greetUser(prompt("Enter you name: "))