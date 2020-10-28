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

window.startSlide = `
<div class="start">
    <h1>Coding Quiz Challenge</h1>
    <p>Try to answer the following code-related questions within the time limit. Keep in mind that incorrect answers will penalize your score/time by ten seconds!</p>
    <button class="btn btn-primary" onclick="app.controllers.renderQuestion();">Start Quiz</button>
</div>
`;

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

        // Load first slide
        // app.controllers.renderStart();
        document.querySelector(".content").innerHTML = window.startSlide;

        // Read question bank from .json file into App model
        var questionBank = Internal.readQuestionBank("html-questions");
        // TODO: Indusry standards; Is this how unit tests, etc are performed? Find out once we reach lessons on testing 
        if(quickTester.assert(questionBank.length && questionBank[0], "questionBank should have >1 objects and index 0 should have a question and answers")) debugger;
        this.models.questions = questionBank;
    }

    controllers = {
        restartQuestions: function() {
            app.models.questionPointer = 0;
        },
        
        renderStart: function() {
            var template = app.views.startSlide;
            var parameterizedTemplate = Handlebars.compile(template);
            var generatedHtml = parameterizedTemplate({});
            document.querySelector(".content").innerHTML = generatedHtml;
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
                var generatedHtml = parameterizedTemplate(model);

                // But Handlebar JS gives you a string, not DOM nodes that can have addEventListener, so let's parse Dom with the browser web API
                var nodes = Internal.htmlToDom(generatedHtml);

                // Add onclick to answer buttons
                // Todo: Review; array.forEach
                nodes.querySelectorAll("button").forEach( (buttonEl)=>{ 
                    buttonEl.onclick = (event) => {
                        var questionId = parseInt(buttonEl.closest(".question").getAttribute("data-question-id"));
                        var buttonId = parseInt(buttonEl.getAttribute("data-button-id"));

                        // Update Correct! or Wrong! at the model for rendering next question
                        var wasICorrect = Internal.checkAnswer(buttonId, questionId);
                        if(wasICorrect)
                            app.models.wasICorrect = "Correct!";
                        else
                            app.models.wasICorrect = "Wrong!";
                        
                        // Render next question or finished slide
                        app.controllers.renderQuestion();
                    }
                });
                
                document.querySelector(".content").innerHTML = ""; // Reset HTML
                document.querySelector(".content").append(nodes);
            } else {
                app.controllers.renderFinished1of2();
            }
        }, // renderQuestion
        
        renderFinished1of2() {
            // Handlebar JS
            var template = app.views.finished1of2;
            var parameterizedTemplate = Handlebars.compile(template);
            var generatedHtml = parameterizedTemplate({score:10});
            var nodes = Internal.htmlToDom(generatedHtml);
            nodes.querySelector("button").addEventListener("click", ()=>{
                app.controllers.renderFinished2of2();
            });

            document.querySelector(".content").innerHTML = "";
            document.querySelector(".content").append(nodes);
        },
        renderFinished2of2() {
            // Handlebar JS
            var template = app.views.finished2of2;
            var parameterizedTemplate = Handlebars.compile(template);
            var generatedHtml = parameterizedTemplate({highScore:20});
            var nodes = Internal.htmlToDom(generatedHtml);

            nodes.querySelector("button.go-back").addEventListener("click", ()=>{
                app.controllers.restartQuestions();
                app.controllers.renderStart();
            });

            nodes.querySelector("button.clear-high-scores").addEventListener("click", ()=>{
                // app.controllers.renderStart();
                alert("Coming soon!");
            });

            document.querySelector(".content").innerHTML = "";
            document.querySelector(".content").append(nodes);
        },
    }

    models = {
        wasICorrect: "",
        questionPointer: 0,
        questions: {}
    }

    // Todo: Review; Tricky; New to this; Handlebar template with array and custom helper
    views = {
        "startSlide": window.startSlide,
        "question": `
            <div class="question" data-question-id={{questionId}}>
                <h1>{{question}}</h1>
                <div class="form-group">
                {{#each answers}}
                    <button class="btn btn-primary display-block" data-button-id="{{@index}}">{{getHumanReadableIndex @index}} {{this}}</button>
                {{/each}}
                </div>
                <hr>
                <span class="was-i-correct">{{wasICorrect}}</span>
            </div>
        `,
        "finished1of2": `
            <div class="finished1of2">
                <h1>All done!</h1>
                <p>Your final score is <span class="score">{{score}}</span></p>
                <p>Enter initials: <input type="text"></input> <button class="btn btn-primary display-inline">Submit</button></p>
                <hr>
                <span class="was-i-correct">{{wasICorrect}}</span>
            </div>
        `,
        "finished2of2": `
            <div class="finished2of2">
                <h1>High scores</h1>
                <div class="high-score">{{highScore}}</div>
                <div class="form-group">
                    <button class="go-back btn btn-primary display-inline">Go back</button>
                    <button class="clear-high-scores btn btn-primary display-inline">Clear high scores</button>
                </div>
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

    /**
     * Convert html string to DOM nodes
     * 
     * @function htmlToDom
     * @param {string} html
     * 
     */
    htmlToDom: function(html) {
        // return (new DOMParser()).parseFromString(html, "text/xml");
        // return document.createElement("div").innerHTML = html;
        return (new DOMParser()).parseFromString(html, "text/html").body.firstChild;
    },


    /**
     * Check the button index whether it matches the "correctAnswer" numerical field for the question in the JSON file
     * 
     * @method checkAnswer
     */
    checkAnswer: (buttonId, questionId) => {
        // buttonId -> correctAnswer
        var currentQuestion = app.models.questions[questionId];
        if(quickTester.assert(typeof questionId==="number", "questionId is wrong")) debugger;
        if(quickTester.assert(currentQuestion.answers.length, "currentQuestion is wrong")) debugger;
        if(quickTester.assert(typeof buttonId==="number", "buttonId is wrong")) debugger;

        var {correctAnswer} = currentQuestion;
        return buttonId === correctAnswer;
    },
    
    // Todo: Review; Tricky; Handlebar JS custom helper
    addHandlebarsHelpers: ()=> {
        // getHumanReadableIndex converts index 0, 1, 2, etc. => To 1., 2., etc
        Handlebars.registerHelper("getHumanReadableIndex", function(index) {
            return parseInt(index)+1 + ".";
        });

        Handlebars.registerHelper("wasICorrect", function() {
            return app.models.wasICorrect;
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
 * Initialize App class
 * 
 * @name NewApp
 * @global
 */
var app = new App();