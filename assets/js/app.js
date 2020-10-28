/**
 * Test that the app.js file is connected
 * 
 * @name ConnectedJS
 * @global
 */
console.log("Connected JS file");

/**
 * Entry point for the JS code. It'll load the question bank, render different pages, and tracks scores.
 * 
 * @class       App
 * @classdesc   MVC pattern. TODO: Industry Standards; Is this how a MVC pattern is implemented? Find out once we reach lessons on MVC pattern.
 * 
 */
class App {
    constructor() {
        console.log("Init App class");

        // Read question bank from .json file into App model
        var questionBank = Internal.readQuestionBank("html-questions");
        // TODO: Indusry standards; Is this how unit tests, etc are performed? Find out once we reach lessons on testing 
        if(quickTester.assert(questionBank.length && questionBank[0], "questionBank should have >1 objects and index 0 should have a question and answers")) debugger;
        this.models.default = questionBank;
    }

    controllers = {}

    models = {
        default: {}
    }

    views = {}
} // App

/**
 * Internal variables and functions for the App class
 * 
 * @object Internal
 * 
 */
var Internal = {
    readQuestionBank: (filename)=>{
        var questionBank = [];

        // Get question bank from .json file
        // TODO: Review; XMLHttpRequest is tricky and I have some trouble remembering the code. Second parameter is asynchronous mode.
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var responseText = this.responseText;
                try {
                    questionBank = JSON.parse(responseText);
                } catch(error) {
                    alert("Error: Question bank file missing or unreadable");
                    return [];
                } // try-catch
            } // if ready
        }; // xhttp
        xhttp.open("GET", "data/" + filename + ".json" , false); // async is false
        xhttp.send();
        
        return questionBank;
    }
}

/**
 * Implement App class
 * 
 * @ipmlements App
 * 
 */

 /**
 * Initialize App class
 * 
 * @name NewApp
 * @global
 */
var app = new App();