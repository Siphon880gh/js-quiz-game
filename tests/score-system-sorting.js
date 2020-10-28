/**
 * @overview Test the Score System's sorting by running this code at the bottom of index.html
 *           This test works by adding some arbitrary players and scores. It passes if the array
 *           returned by console.dir is a sorted array. If no array returned, then localStorage
 *           is not implemented correctly.
 * 
 */
ScoreSystem.setScore("A", 100);
ScoreSystem.setScore("B", 150);
ScoreSystem.setScore("C", 150);
ScoreSystem.setScore("D", 900);
ScoreSystem.setScore("E", 800);

console.log("The below array should be sorted by score");
console.dir( localStorage.getItem("scores") );