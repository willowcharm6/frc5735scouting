let img; // Declare img as a global variable
let robots = [];
let currentMatch = 0; // Declare currentMatch
let isStarted = false;
let startButton; // Declare startButton
let selectedRobotIndex = 0; // Declare at the global level
let rectangleWidth = 0;
let rectangleHeight = 0;
let rectangleX = 0;
let rectangleY = 0;
let generalStartTime;
let sKeyPressed = false;
let aKeyPressed = false;
let SKeyPressed = false;
let AKeyPressed = false;


function preload() {
  img = loadImage('assets/game.field.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Create the start button
  startButton = createButton('Start');
  startButton.position(165, windowHeight - 570);
  startButton.mousePressed(startGame);

  endButton = createButton('End');
  endButton.position(215, windowHeight - 570);
  endButton.mousePressed(endGame);

  // Create a dropdown menu for robot selection
  robotDropdown = createSelect();
  robotDropdown.position(85, windowHeight - 570);
  for (let i = 0; i < 5; i++) {
    robotDropdown.option(`Robot ${i + 1}`, i);
  }
  robotDropdown.changed(selectRobot);

  initializeRobots(5); // Create 5 robots
  
}

function draw() {
  background(220);
  
  // Calculate the scaled width and height to fit the window
  let aspectRatio = img.width / img.height;
  let scaledWidth = width;
  let scaledHeight = width / aspectRatio;

  // Check if the scaled height exceeds the window height
  if (scaledHeight > height) {
    scaledWidth = height * aspectRatio;
    scaledHeight = height;
  }

  // Calculate the position to center the scaled image
  let centerX = width / 2 - scaledWidth / 2;
  let centerY = height / 2 - scaledHeight / 2;

  // Draw the centered and scaled image
  image(img, centerX, centerY, scaledWidth, scaledHeight);
  
  // Set the rectangle mode to CENTER
  rectMode(CORNER);

  // Calculate the size of the rectangle based on the window size
  rectangleWidth = scaledWidth * 0.66;
  rectangleHeight = scaledHeight * 0.59;
  rectangleX = scaledWidth * 0.178;
  rectangleY = scaledHeight * 0.177;

  // // Draw the rectangle at the center of the canvas
  // fill(50, 100, 150);
  // rect(380, 80, 65, 100);

  // Draw robot
  fill(40, 47, 54);
  let robot = robots[selectedRobotIndex];
  rect(robot.position.x, robot.position.y, 25, 25);

  // textSize(24);
  text(`Amp: ${robot.amp_scored}`, windowWidth - 100, 10);
  text(`Speaker: ${robot.speaker_scored}`, windowWidth - 200, 10);
  displayMatchCount();
  displayGeneralTimer();
  if (isStarted) {
    moveRobot(selectedRobotIndex);
    // check_scoring();
  }
  if(!isStarted) {
    generalStartTime = null;
  }
  // print(isStarted);
  
}

function moveRobot(robotIndex) {
  let robot = robots[robotIndex];

  if (robot.destinations.length > 0) {
    let dest = robot.destinations[0];

    // Check if the destination is within the constraints
    if (isDestinationWithinFieldConstraints(dest.x, dest.y)) {
      // Draw destinations
      for (let des of robot.destinations) {
        fill(246,65,6);
        ellipse(des.x, des.y, 10, 10);
      }
        // Move robot towards the first destination
      let dir = createVector(dest.x - robot.position.x-12, dest.y - robot.position.y-12);
      dir.normalize();
      robot.position.add(dir.mult(2));

      // Check if the robot is close enough to the destination
      if (dist(robot.position.x +12, robot.position.y + 12, dest.x, dest.y) < 4) {
        // Remove the current destination from the list
        robot.destinations.shift();

        // Log the timer for the destination
        logTimer(robotIndex, dest);
      }
    } else {
      // If the destination is outside constraints, remove it from the list
      robot.destinations.shift();
    }
  }
}

function displayMatchCount() {
  // Display match count in the top right corner
  textSize(16);
  fill(0);
  textAlign(LEFT, TOP);
  text(`Match: ${currentMatch + 1}`, 10, 10);
}

function mousePressed() {
  if (isStarted) {
    let dest = createVector(mouseX, mouseY);
    robots[selectedRobotIndex].destinations.push(dest);
  }
}

// Helper function to check if a destination is within the constraints
function isDestinationWithinFieldConstraints(x, y) {
  return x >= rectangleX && x <= rectangleX + rectangleWidth &&
         y >= rectangleY && y <= rectangleY + rectangleHeight;
}

function initializeRobots(count) {
  robots = [];
  for (let i = 0; i < count; i++) {
    let robot = {
      position: createVector(width/2, height/2), // Center initial position
      destinations: [],
      visitedLocations: [],
      timers: [],
      amp_scored: 0,
      speaker_scored: 0,

    };
    robots.push(robot);
  }
}

function startGame() {
  isStarted = true; // Set isStarted to true when the button is pressed
  generalStartTime = millis();
}

function endGame(){
  isStarted = false;
  robots[selectedRobotIndex].destinations.length = 0;
}

function keyPressed() {
  if ((key === 's') && !sKeyPressed && isStarted) {
    robots[selectedRobotIndex].speaker_scored++;
    sKeyPressed = true;
  }
  if ((key === 'S') && !SKeyPressed && isStarted) {
    SKeyPressed = true;
    if(robots[selectedRobotIndex].speaker_scored > 0){
      robots[selectedRobotIndex].speaker_scored--;
    }
    else {
      robots[selectedRobotIndex].speaker_scored = 0;
    }
    
  }

  if ((key === 'a') && !aKeyPressed && isStarted) {
    robots[selectedRobotIndex].amp_scored++;
    aKeyPressed = true;
  }
  if ((key === 'A') && !AKeyPressed && isStarted) {
    AKeyPressed = true;
    if(robots[selectedRobotIndex].amp_scored > 0){
      robots[selectedRobotIndex].amp_scored--;
    }
    else {
      robots[selectedRobotIndex].amp_scored = 0;
    }
  }
}

function keyReleased() {
  if (key === 's') {
    sKeyPressed = false;
  }
  if (key === 'S') {
    SKeyPressed = false;
  }
  if (key === 'a') {
    aKeyPressed = false;
  }
  if (key === 'A') {
    AKeyPressed = false;
  }
}

// Helper function to log the timer for a destination
function logTimer(robotIndex, destination) {
  let robot = robots[robotIndex];
  let timer = millis();
  if (robot.visitedLocations.length > 1) {
    let prevDestination = robot.visitedLocations[robot.visitedLocations.length - 2];
    let timeDifference = timer - robot.timers[robot.timers.length - 1];
    robot.timers.push(timer);
    console.log(`Robot ${robotIndex + 1} - Time from (${prevDestination.x}, ${prevDestination.y}) to (${destination.x}, ${destination.y}): ${timeDifference} milliseconds`);
  } else {
    // If it's the first destination, just log the timer
    robot.timers.push(timer);
  }
}

function displayGeneralTimer() {
  if (generalStartTime !== null) {
    let elapsedTime = millis() - generalStartTime;
    let formattedTime = formatTime(elapsedTime);
    textSize(16);
    fill(0);
    // textAlign(CENTER, TOP);
    text(`General Timer: ${formattedTime}`, windowWidth - windowWidth / 2, 35);
  } else {
    // Display a message or handle the case when the general timer is not started
    textSize(16);
    fill(0);
    textAlign(CENTER, TOP);
    text('General Timer: Not started', windowWidth - windowWidth / 2, 35);
  }
}

function formatTime(millis) {
  let seconds = Math.floor(millis / 1000);
  let minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;
  return nf(minutes, 2) + ':' + nf(seconds, 2);
}


// Event handler for changing the selected robot from the dropdown menu
function selectRobot() {
  selectedRobotIndex = int(robotDropdown.value());
  isStarted = false;
   // Reset the robot position to the center
   robots[selectedRobotIndex].position.set(width / 2, height / 2);
}


{
  //resizing, aspect ratio stuff
  

//   // Calculate the scaled width and height to maintain aspect ratio
//   let aspectRatio = img.width / img.height;
//   let scaledWidth = windowWidth;
//   let scaledHeight = windowWidth / aspectRatio;

//   // Check if the scaled height exceeds the window height
//   if (scaledHeight > windowHeight) {
//     scaledWidth = windowHeight * aspectRatio;
//     scaledHeight = windowHeight;
//   }


// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
//   if (!isStarted){
//     initializeRobots();
//   }
// }

}