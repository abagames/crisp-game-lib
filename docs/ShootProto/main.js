title = "ShootProto";

description = `shoot & shield`;

characters = [
  `
  llll
  ll
  llll
  llll
  l  l
  `,
  `
  llll
    ll
  llll
  llll
  l  l
  `,
  
];


options = {};

let player;
let targets;

let target1;

let timer;

function update() {
  if (!ticks) { // start
    timer = 0;

    player = {
      xPos: 20,
      yPos: 80,
      goLeft: false,
      shieldDuration: 0,
      shieldsLeft: 3
    }

    targets = [];
    targets.push({ // target 0
      box: {
      xPos: 30,
      yPos: 50,
      width: 14,
      height: 14,
      shrinkSpeed: 0.2,
    }, 
    shrink: false
    });

    target1 = {
      xPos: 60,
      yPos: 30,
      width: 10,
      height: 10,
      shrinkSpeed: 0.7,
    }
    targets.push({box: target1, shrink: false}); // target 1

    targets.push({ // target
      box: {
      xPos: 80,
      yPos: 80,
      width: 14,
      height: 14,
      shrinkSpeed: 0.4,
    }, 
    shrink: true
    });
  }
  // ground
  color("yellow");
  box(0,92,200,17);

  // player
  color("red");

  if(player.goLeft){
    if(player.xPos > 1){
      player.xPos-= 0.5;
    } else {
      player.goLeft = !player.goLeft;
    }
      char("b", player.xPos,80);
    

  } else {
    if(player.xPos < 30){
      player.xPos+= 0.5;
    } else {
      player.goLeft = !player.goLeft;
    }
      char("a", player.xPos,80);
  }
  // input
  if(input.isPressed){
    timer++;
    //console.log("current time held:" + timer);
  }
  if(input.isJustReleased){
    console.log("total time:" + timer);

    // select control

    // shoot ( quick press)
    if(timer < 10 && targets.length > 0 && targets[0].box.width < 13){ // box is damagable.
      console.log("shoot");
      // add laser
      line(player.xPos, player.yPos, targets[0].box.xPos, targets[0].box.yPos, 3);
      // remove target
      targets.splice(0,1);
      // increase score
      addScore(1);
      
    }

    // shield ( long press)
    if (timer > 10 && player.shieldDuration <= 0){
      console.log("add shield");
      player.shieldDuration = 100;
      player.shieldsLeft--;

    }


    timer = 0;
  }

  // draw shield
  if(player.shieldDuration > 0){
    color("blue");
    arc(player.xPos, player.yPos, 8, 3);
    player.shieldDuration--;
  }

  // draw shield icons
  for (let i = 0; i < player.shieldsLeft; i++){
    color("blue");
    arc(5 + i*15, 95, 4, 2);
  }

  
  // targets
  color("black");
  for (let i = 0; i < targets.length; i++){
    if(i == 0 && targets[0].box.width < 13){
      color("blue");
    } else {
      color("black");
    }
    box(targets[i].box.xPos,targets[i].box.yPos,targets[i].box.width,targets[i].box.height);
    if(targets[i].shrink){
      targets[i].box.width-= targets[i].box.shrinkSpeed;
      targets[i].box.height-= targets[i].box.shrinkSpeed;
      if(targets[i].box.width < 10){
        targets[i].shrink = false;
      }
    } else {
      targets[i].box.width+= targets[i].box.shrinkSpeed;
      targets[i].box.height+= targets[i].box.shrinkSpeed;
      if(targets[i].box.width > 20){
        targets[i].shrink = true;
      }
    }
  }

}

function activateShield(){
  
}