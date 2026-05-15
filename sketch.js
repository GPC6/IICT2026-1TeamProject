let backgroundNum = 1;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);

  if (backgroundNum == 1){
    drawBackground1();
  }
  if (backgroundNum == 2){
    drawBackground2();
  }
  if (backgroundNum == 3){
    drawBackground3();
  }
  if (backgroundNum == 4){
    drawBackground4();
  }
  if (backgroundNum == 5){
    drawBackground5();
  }
}

function keyPressed(){
  if (key=='1'){
    backgroundNum = 1
  }
  if (key=='2'){
    backgroundNum = 2
  }
  if (key=='3'){
    backgroundNum = 3
  }
  if (key=='4'){
    backgroundNum = 4
  }
  if (key=='5'){
    backgroundNum = 5
  }
}