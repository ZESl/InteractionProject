let video;
let poseNet;
let poses = [];
let rightWrist;
let waitSwitch = false;
let detectSwitch = false;

function setup() {

    frameRate(8);

    const canvas = createCanvas(640, 480);
    canvas.parent('videoContainer');

    // Video capture
    video = createCapture(VIDEO);
    video.size(width, height);

    // Create a new poseNet method with a single detection
    poseNet = ml5.poseNet(video, modelReady);
    // This sets up an event that fills the global variable "poses"
    // with an array every time new poses are detected
    poseNet.on('pose', function (results) {
        poses = results;
    });

    initHand();

    // Hide the video element, and just show the canvas
    video.hide();
}

function initHand() {
    rightWrist = {
        x: 500,
        y: 500,
    };
}

function waitSwitchOff() {
    waitSwitch = false;
}

function detectHandMovements() {
    if (poses.length > 0) {
        let pose = poses[0].pose;   //detect the first pose
        let confidence = 0.1;
        if (pose.leftWrist.confidence > confidence) {
            console.log(poses[0].pose.leftWrist);
            let y = pose.leftWrist.y;
            let x = pose.leftWrist.x;

            document.getElementById('point').style.left = (640 - x).toString() + "px";
            document.getElementById('point').style.top = y.toString() + "px";

            if ((640 - x) > 0 && (640 - x) < 320 && y > 0 && y < 200) {
                if (detectSwitch) {
                    detectSwitch = false;
                    document.getElementById('start').innerHTML = "START";
                    document.getElementById('start').style.backgroundColor = "#B7EF26";
                    console.log("switch:off");
                } else {
                    detectSwitch = true;
                    document.getElementById('start').innerHTML = "STOP";
                    document.getElementById('start').style.backgroundColor = "#FFD90F";
                    console.log("switch:on");
                }
                waitSwitch = true;
                setTimeout(waitSwitchOff, 1000);
            }
        }
    }
}

function changeCenterImage() {
    document.getElementById('centerImage').style.border = "20px solid #EFEFEF";
    if (poses.length > 0) {
        let pose = poses[0].pose;   //detect the first pose
        let confidence = 0.4;

        if (pose.rightWrist.confidence > confidence && pose.rightShoulder.confidence > confidence) {
            console.log(rightWrist);
            // threshold can be modified
            let threshold = 30;

            // let pose.rightShoulder be the center of the circle
            let offsetx = pose.rightWrist.x - pose.rightShoulder.x;     // x axis distance between elbow and shoulder
            let offsety = pose.rightWrist.y - pose.rightShoulder.y;     // y axis distance between elbow and shoulder
            if (Math.abs(offsetx) > threshold || Math.abs(offsety) > threshold) {

                let imagescr = document.getElementById('centerImage').src.toString();
                imagescr = imagescr.split('/').pop();
                imagescr = imagescr.split('.')[0].split('-');      // eg. ['20','20']
                console.log(imagescr);

                let row = parseInt(imagescr[0]);
                let col = parseInt(imagescr[1]);

                let total = 100;    // todo to be modified
                if (offsetx < 0) {
                    if (col < total) {
                        col += 1;
                    } else {
                        col = parseInt(total / 2);
                    }
                    document.getElementById('centerImage').style.borderRightColor = "#B5E2E8";
                    console.log('rightWrist move right');
                } else {
                    if (col > 0) {
                        col -= 1;
                    } else {
                        col = parseInt(total / 2);
                    }
                    document.getElementById('centerImage').style.borderLeftColor = "#B5E2E8";
                    console.log('rightWrist move left');
                }
                document.getElementById('centerImage').src = 'images/' + row + '-' + col + '.png';
                rightWrist.x = pose.rightWrist.x;

                if (offsety < 0) {
                    if (row > 0) {
                        row -= 1;
                    } else {
                        row = parseInt(total / 2);
                    }
                    document.getElementById('centerImage').style.borderTopColor = "#B5E2E8";
                    console.log('rightWrist move up');
                } else {
                    if (row < total) {
                        row += 1;
                    } else {
                        row = parseInt(total / 2);
                    }
                    document.getElementById('centerImage').style.borderBottomColor = "#B5E2E8";
                    console.log('rightWrist move down');
                }
                document.getElementById('centerImage').src = 'images/' + row + '-' + col + '.png';
                rightWrist.y = pose.rightWrist.y;
            }
        }
    }
}

function draw() {
    // image(video, 0, 0, width, height);
    // // We can call both functions to draw all keypoints and the skeletons
    // drawKeypoints();
    // drawSkeleton();
    // call this function to detect hand movement and change the Center Image
    if (!waitSwitch) {
        detectHandMovements();
    }

    if (detectSwitch) {
        changeCenterImage();
    }

}

function modelReady() {
    // select('#status').html('model Loaded')
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
    // Loop through all the poses detected
    for (let i = 0; i < poses.length; i++) {
        // For each pose detected, loop through all the keypoints
        let pose = poses[i].pose;

        for (let j = 0; j < pose.keypoints.length; j++) {
            // A keypoint is an object describing a body part (like rightArm or leftShoulder)
            let keypoint = pose.keypoints[j];
            // Only draw an ellipse is the pose probability is bigger than 0.2
            if (keypoint.score > 0.2) {
                fill(255, 0, 0);
                noStroke();
                ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
            }
        }
    }
}

// A function to draw the skeletons
function drawSkeleton() {
    // Loop through all the skeletons detected
    for (let i = 0; i < poses.length; i++) {
        let skeleton = poses[i].skeleton;
        // For every skeleton, loop through all body connections
        for (let j = 0; j < skeleton.length; j++) {
            let partA = skeleton[j][0];
            let partB = skeleton[j][1];
            stroke(255, 0, 0);
            line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
        }
    }
}