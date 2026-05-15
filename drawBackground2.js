function drawBackground2() {
    if (backgroundNum == 2) {
        push()
        translate(200, 200)
        rectMode(CENTER)
        fill(20, 20, 20)
        rect(0, 0, 50, 50)
        textAlign(CENTER, CENTER)
        fill(255)
        text("사각형", 0, 0)
        pop()
    }
}