let sentenceBuilder = {
    "subject": "I", "verb": "am", "object": "coding",
    buildSentence: function () {
        console.log(`${this.subject} ${this.verb} ${this.object}`)
    },
    updateProperty: function (key, value) {
        if (this.hasOwnProperty(key)) this[key] = value
        else console.log("Invalid property")
    }
}

sentenceBuilder.buildSentence()

// sentenceBuilder.updateProperty("verb", "am learning")
// sentenceBuilder.buildSentence()

// sentenceBuilder.updateProperty("subject", "The cat")
// sentenceBuilder.buildSentence()

sentenceBuilder.updateProperty("mood", "happy")
