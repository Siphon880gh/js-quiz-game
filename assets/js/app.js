/**
 * @overview index.html opens app.js
 * @dependencies you need to load handlebar.js and moment.js first
 * @author assigned to Weng Fei Fung
 */

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
 * @method      renderQuestion  render question in order
 * 
 */
class App {
    constructor() {
        console.log("Init App class");

        // Init Handlebar with helpers that format the answers
        Internal.addHandlebarsHelpers();

        // Read question bank from .json file into App model
        var questionBank = Internal.readQuestionBank("html-questions");
        // TODO: Indusry standards; Is this how unit tests, etc are performed? Find out once we reach lessons on testing 
        if(quickTester.assert(questionBank.length && questionBank[0], "questionBank should have >1 objects and index 0 should have a question and answers")) debugger;
        this.models.questions = questionBank;
    }

    controllers = {
        restartQuestions: function() {
            app.model.questionPointer = 0;
        },

        // Todo: Review; Tricky; New to this; Handlebar takes in a template, makes it into a function, then that function receives data to render the template
        // Todo: Review; Sugar Syntax; Plucking from an object, aka destructuring object
        renderQuestion: function() {
            // Where we are in the questions
            var {questionPointer, questions} = app.models;
            if(questionPointer < questions.length) {
                app.models.questionPointer++;

                // Handlebar JS
                var template = app.views.question;
                var parameterizedTemplate = Handlebars.compile(template);
                var model = questions[questionPointer];
                model.questionId = questionPointer;
                var generatedHTML = parameterizedTemplate(model);
                document.querySelector(".content").innerHTML = generatedHTML;
            } else {
                alert("Finished questions!");
            }
        }
    }

    models = {
        lastAnswered: "",
        questionPointer: 0,
        questions: {}
    }

    // Todo: Review; Tricky; New to this; Handlebar template with array and custom helper
    views = {
        "question": `
            <div class="question" data-question-id={{questionId}}>
                <h1>{{question}}</h1>
                <div class="form-group">
                {{#each answers}}
                    <button class="btn btn-primary display-block">{{getIndex @index}} {{this}}</button>
                {{/each}}
                </div>
                <hr>
                <span class="text-feedback">{{wasICorrect}}</span>
            </div>
        `
    }
} // App

/**
 * Internal variables and functions for the App class
 * 
 * @object Internal
 * 
 */
var Internal = {
    // Todo: Review; Tricky; Handlebar JS custom helper
    addHandlebarsHelpers: ()=> {
        Handlebars.registerHelper("getIndex", function(index) {
            return parseInt(index)+1 + ".";
        });

        Handlebars.registerHelper("wasICorrect", function() {
            return app.models.lastAnswered;
        });
    },
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