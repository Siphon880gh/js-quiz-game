/**
 * Quick Tester JS
 * ================
 * Quick assertion testing and pass/fail reports for javascript. 
 * By Weng Fei Fung.
 * 
 * Instructions
 * --------------
 * - Evaluate statements with quickTester.assert(eval, "error message if failed")
 * - Report pass and fail numbers with quickTester.report();
 * 
 */
var quickTester = {
    passes: 0,
    fails: 0,
    assert: function(evaled, msgFail, callback) { // Do not use arrow functions because it'd disconnect the this pointer from the object
        if(!evaled) {
            console.assert(false, msgFail);
            this.fails++;
            if(typeof callback!=="undefined") {
                callback();
            }
            return true;
        } else {
            this.passes++;
            return false;
        } // if-else
    }, // assert
    report: function() {
        console.info("%c==============================", "font-weight:700;");
        console.info("%cQuick Tester by Weng Fei Fung", "font-weight:700;");
        console.info("%c==============================", "font-weight:700;");
        console.info(`%cTests passed: %c${this.passes}`, "font-weight:600;", "color:green");
        console.info(`%cTests failed: %c${this.fails}`, "font-weight:600;", "color:red");
    }
    } // quickTester