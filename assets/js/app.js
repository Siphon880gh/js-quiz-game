/**
 * @overview app.js is all the javascript for the code quiz app
 * 
 *  dependencies: handlebar.js, moment.js
 *  control flow: App is initialized. 
 *                Timer has to be initialized inside App because App loads the questions and the total time for the quiz depends on how many questions there are.
 *  
 * 
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
 * 
 * Render the first slide. Also referenced by the startSlide view for App. This has to be global because the class App is still defining while the starting slide is running.
 * @global startSlide
 */
window.startSlide = `
<div class="start">
    <h1>Coding Quiz Challenge</h1>
    <p>Try to answer the following code-related questions within the time limit. Keep in mind that incorrect answers will penalize your score/time by ten seconds!</p>
    <button class="btn btn-primary" onclick="app.controllers.renderQuestion(); Internal.restartTimer();">Start Quiz</button>
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
                        else {
                            app.models.wasICorrect = "Wrong!";
                            timerSystem.subtractTimer(10); // Penalize by subtracting 10 seconds from timer
                        }

                        // Render next question or finished slide
                        app.controllers.renderQuestion();
                    }
                });
                
                document.querySelector(".content").innerHTML = ""; // Reset HTML
                document.querySelector(".content").append(nodes);
            } else {
                // Questions are done, so let's pause the countdown timer and render the Finished slides
                setTimeout( ()=> { 
                    timerSystem.pauseTimer(); 
                    app.controllers.renderFinished1of2();
                }, 1100); // Workaround: Wait for any penalty to be applied to timer, before pausing timer
            }
        }, // renderQuestion
        
        renderFinished1of2() {
            // Handlebar JS
            var template = app.views.finished1of2;
            var parameterizedTemplate = Handlebars.compile(template);
            var generatedHtml = parameterizedTemplate({score: timerSystem.getSeconds()});
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
                Internal.restartQuestions();
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
 * 
 * Restarts and counts down timer for the quiz. How long the timer is based on the number of questions. By the end of the quiz, the time left in seconds is the score.
 * 
 * @class TimerSystem
 * 
 */
class TimerSystem {
    timeLeft = 0;
    timerEl = null;

    constructor(timerEl, seconds) {
        this.timerEl = timerEl;
        
        // Initial instance counting down depends on how many questions there are
        // Store the number of seconds as moment duration object
        this.timeLeft = moment.duration(seconds, "seconds");
        
        // Workaround: Avoid trimming for values less than 60 seconds
        var timeLeftFormatted = this.timeLeft.format("mm:ss", { trim: false }); // "00:05"
        this.timerEl.textContent = timeLeftFormatted;

        // Every other instance counting down
        if(window.timerCountingDown) clearInterval(window.timerCountingDown);
        window.timerCountingDown = setInterval(this.countingDown.bind(this), 1000); // Workaround: *.this reference was lost
    }

    countingDown() {
        // Decrement the number of seconds by converting the moment duration object back to integer then decrementing
        var nextSeconds = this.timeLeft.asSeconds();
        if(nextSeconds===0) return false;
        nextSeconds--;

        // Store the number of seconds as moment duration object
        this.timeLeft = moment.duration(nextSeconds, "seconds");

        var timeLeftFormatted = this.timeLeft.format("mm:ss", { trim: false }); // "00:05"
        this.timerEl.textContent = timeLeftFormatted;
    }

    /**
     * Get total number of seconds from the counting down timer. This is also the score at the end of the quiz.
     * 
     * @method getSeconds
     * @returns {int}       number of seconds
     * 
     */
    getSeconds() {
        // Convert the moment duration object back to integer
        return this.timeLeft.asSeconds();
    }

    pauseTimer() {
        if(window.timerCountingDown) clearInterval(window.timerCountingDown);
    }

    resumeTimer() {
        window.timerCountingDown = setInterval(this.countingDown.bind(this), 1000); // Workaround: *.this reference was lost
    }

    /**
     * Student answers question wrong, so penalize by subtracting X number of seconds from the timer
     * 
     * @method subtractTimer
     * @param {int} bySeconds The number of seconds to penalize
     */
    subtractTimer(bySeconds) {
        this.pauseTimer();
        
        // Decrement the number of seconds by converting the moment duration object back to integer then decrementing
        var nextSeconds = this.timeLeft.asSeconds();
        nextSeconds -= bySeconds;
        this.timeLeft = moment.duration(nextSeconds, "seconds");

        this.resumeTimer();
    }

} // TimerSystem

/**
 * Internal variables and functions for the App class
 * 
 * @object Internal
 * 
 */
var Internal = {

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
    },

    restartQuestions: function() {
        app.models.questionPointer = 0;
    },

    restartTimer: function() {
        // Start timer based on how many questions there are (45 seconds a question)
        var timerEl = document.querySelector(".clock");
        var seconds = app.models.questions.length * 30;
        window.timerSystem = new TimerSystem( timerEl, seconds );

    }

} // Internals

 /**
 * Initialize App class
 * 
 * @name NewApp
 * @global
 */
window.app = new App();