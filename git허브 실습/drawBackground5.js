function drawBackground5() {
    if (backgroundNum == 5) {
        noStroke();
        for (i = 0; i < 10; i++) {
            fill(i * 25);
            circle(width / 2, height / 2, 100 - 10 * i, 100 - 10 * i);
        }
        noFill();
    }
}