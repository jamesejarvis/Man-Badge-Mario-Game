//////////////////////////////////////////////////////////////////////////////////
// Code adapted from Espruino tutorial found https://www.espruino.com/Tutorials
// --->   https://www.espruino.com/Platform+Game
//
// Edits & Bug Fixes
// 1) Screen now scrolls when play hits screen mid-point and not right hand end point
// 2) "Player Walking Left" sprite fixed
// 3) Player double jump bug fixed. Player can only jump when standing on ground or on
//    blocks. This also disables the flying when holding down jump button
// 4) Level extended in length to include additional obstacles
// 5) End of level flagpole added
// 6) Level resets on flagpole hit.  Future edit would see player move to second level etc
// 7) QR code added at level end
// 8) Toggle Pixl.js backlight on coin block hit
// 9) Add Man Logo on start screen
// 10) Edit empty block and coin block sprites
////////////////////////////////////////////////////////////////////////////////////


var W = g.getWidth();
var H = g.getHeight();
var BTNL = BTN4;
var BTNR = BTN3;
var BTNA = BTN1;
var backLightOn = true;

LED1.write(backLightOn);

var TILES = {
  "^":new Uint8Array([
0b11111111, // ^
0b10101010,
0b01000100,
0b00000000,
0b00000000,
0b00000000,
0b00000000,
0b00000000]).buffer,
  "-":new Uint8Array([
0b00000000,
0b00000000,
0b00000000,
0b00000000,
0b00000000,
0b00111100,
0b01000010,
0b10000001]).buffer,
  "(":new Uint8Array([
0b00000001,
0b00000010,
0b00000100,
0b00001000,
0b00010000,
0b00100000,
0b01000000,
0b10000000]).buffer,
  ")":new Uint8Array([
0b10000000,
0b01000000,
0b00100000,
0b00010000,
0b00001000,
0b00000100,
0b00000010,
0b00000001]).buffer,
  "#":new Uint8Array([
0b11111111,
0b10100001,
0b10100001,
0b11111111,
0b10001000,
0b10001000,
0b10001000,
0b11111111]).buffer,
  "?":new Uint8Array([
0b11111111,
0b10111001,
0b10101001,
0b10001001,
0b10010001,
0b10000001,
0b10010001,
0b11111111]).buffer,
  "T":new Uint8Array([
0b11111111,
0b10000001,
0b11111111,
0b01000010,
0b01010010,
0b01000010,
0b01010010,
0b01000010]).buffer,
  "|":new Uint8Array([
0b01010010,
0b01000010,
0b01010010,
0b01000010,
0b01010010,
0b01000010,
0b01010010,
0b01000010]).buffer,
  "V":new Uint8Array([ //Top M v
0b00000000,
0b10000001,
0b11000011,
0b11100111,
0b11111111,
0b11111111,
0b11111111,
0b11111111]).buffer,
  "{":new Uint8Array([ //Right Diag Fill
0b11111111,
0b11111110,
0b11111100,
0b11111000,
0b11110000,
0b11100000,
0b11000000,
0b10000000]).buffer,
   "}":new Uint8Array([ //Left Diag Fill
0b11111111,
0b01111111,
0b00111111,
0b00011111,
0b00001111,
0b00000111,
0b00000011,
0b00000001]).buffer,
  "S":new Uint8Array([ // Solid FIll
0b11111111,
0b11111111,
0b11111111,
0b11111111,
0b11111111,
0b11111111,
0b11111111,
0b11111111]).buffer,
  "L":new Uint8Array([ // Solid Left Col
0b00001111,
0b00001111,
0b00001111,
0b00001111,
0b00001111,
0b00001111,
0b00001111,
0b00001111]).buffer,
  "R":new Uint8Array([ // Solid Right Col
0b11110000,
0b11110000,
0b11110000,
0b11110000,
0b11110000,
0b11110000,
0b11110000,
0b11110000]).buffer,
  PR:new Uint8Array([ // player facing right
0b00111000,
0b01111110,
0b01001000,
0b01111000,
0b01111000,
0b01111000,
0b01001000,
0b01000100]).buffer,
  PL:new Uint8Array([ // player facing left
0b00111000,
0b01111110,
0b00010010,
0b00011110,
0b00011110,
0b00011110,
0b00010010,
0b00100010]).buffer,
  COIN:new Uint8Array([ // coin
0b00000000,
0b00011000,
0b00111100,
0b01111010,
0b01110010,
0b00111100,
0b00011000,
0b00000000]).buffer,  
  "Q":new Uint8Array([ // coin
0b11111111,
0b10101010,
0b01010101,
0b10101010,
0b01010101,
0b10101010,
0b01010101,
0b11111111]).buffer,
  "a":new Uint8Array([ // QR Code Panel
0b11111110,
0b10000010,
0b10111010,
0b10111010,
0b10111010,
0b10000010,
0b11111110,
0b00000000]).buffer,
  "b":new Uint8Array([ // QR Code Panel
0b00100101,
0b11111001,
0b00001101,
0b00101000,
0b10011111,
0b00110100,
0b10101010,
0b00101010]).buffer,
  "c":new Uint8Array([ // QR Code Panel
0b01001100,
0b01010000,
0b10101111,
0b01010001,
0b10011000,
0b11111111,
0b10101010,
0b01001001]).buffer,
  "d":new Uint8Array([ // QR Code Panel
0b10111111,
0b10100000,
0b10101110,
0b10101110,
0b00101110,
0b00100000,
0b10111111,
0b10000000]).buffer,
  "e":new Uint8Array([ // QR Code Panel
0b10000000,
0b10000000,
0b10000000,
0b10000000,
0b10000000,
0b10000000,
0b10000000,
0b00000000]).buffer,
  "f":new Uint8Array([ // QR Code Panel
0b00101110,
0b10111100,
0b00000111,
0b00000100,
0b10101110,
0b01011100,
0b10111111,
0b00001100]).buffer,
  "g":new Uint8Array([ // QR Code Panel
0b11101000,
0b01111001,
0b01010001,
0b00110100,
0b00001101,
0b10110110,
0b10011011,
0b01001011]).buffer,
  "h":new Uint8Array([ // QR Code Panel
0b11111011,
0b11010010,
0b00111010,
0b11110110,
0b01011000,
0b00110100,
0b11010110,
0b00110101]).buffer,
  "i":new Uint8Array([ // QR Code Panel
0b01001001,
0b10100010,
0b01001010,
0b11000011,
0b10101001,
0b10011110,
0b10111011,
0b01101001]).buffer,
  "j":new Uint8Array([ // QR Code Panel
0b00000000,
0b00000000,
0b00000000,
0b00000000,
0b00000000,
0b10000000,
0b10000000,
0b10000000]).buffer,
  "k":new Uint8Array([ // QR Code Panel
0b11101110,
0b00110101,
0b11100111,
0b01111001,
0b01100111,
0b01101001,
0b00101010,
0b10101001]).buffer,
  "l":new Uint8Array([ // QR Code Panel
0b11100111,
0b11000111,
0b01100100,
0b00010100,
0b11010110,
0b10011101,
0b10011001,
0b01101000]).buffer,
  "m":new Uint8Array([ // QR Code Panel
0b10001110,
0b10110010,
0b00000100,
0b10000111,
0b10101001,
0b11111101,
0b10101110,
0b11100111]).buffer,
  "n":new Uint8Array([ // QR Code Panel
0b00001001,
0b00011101,
0b11010101,
0b00001101,
0b10011111,
0b10011011,
0b10100000,
0b01000101]).buffer,
  "o":new Uint8Array([ // QR Code Panel
0b10000000,
0b10000000,
0b10000000,
0b00000000,
0b10000000,
0b10000000,
0b10000000,
0b10000000]).buffer,
  "p":new Uint8Array([ // QR Code Panel
0b01110010,
0b00000000,
0b11111110,
0b10000010,
0b10111010,
0b10111010,
0b10111010,
0b10000010]).buffer,
  "q":new Uint8Array([ // QR Code Panel
0b10011000,
0b11110111,
0b00101011,
0b10000101,
0b10001011,
0b01101000,
0b11000000,
0b01110010]).buffer,
  "r":new Uint8Array([ // QR Code Panel
0b11111011,
0b00110011,
0b10001001,
0b00110111,
0b10001000,
0b01101111,
0b01000010,
0b11010111]).buffer,
  "s":new Uint8Array([ // QR Code Panel
0b11111001,
0b10001010,
0b10101110,
0b10001110,
0b11111110,
0b00101100,
0b01000010,
0b11110100]).buffer,
  "t":new Uint8Array([ // QR Code Panel
0b10000000,
0b00000000,
0b00000000,
0b00000000,
0b00000000,
0b00000000,
0b00000000,
0b00000000]).buffer,
  "u":new Uint8Array([ // QR Code Panel
0b11111110,
0b00000000,
0b00000000,
0b00000000,
0b00000000,
0b00000000,
0b00000000,
0b00000000]).buffer,
  "v":new Uint8Array([ // QR Code Panel
0b00010000,
0b00000000,
0b00000000,
0b00000000,
0b00000000,
0b00000000,
0b00000000,
0b00000000]).buffer,
  "w":new Uint8Array([ // QR Code Panel
0b00000000,
0b00000000,
0b00000000,
0b00000000,
0b00000000,
0b00000000,
0b00000000,
0b00000000]).buffer,
  "x":new Uint8Array([ // QR Code Panel
0b00010000,
0b00000000,
0b00000000,
0b00000000,
0b00000000,
0b00000000,
0b00000000,
0b00000000]).buffer,
  "y":new Uint8Array([ // QR Code Panel
0b10000000,
0b00000000,
0b00000000,
0b00000000,
0b00000000,
0b00000000,
0b00000000,
0b00000000]).buffer,
  "<":new Uint8Array([
0b00000001,
0b00000111,
0b00111111,
0b11111111,
0b11111111,
0b00111111,
0b00000111,
0b00000001]).buffer,
  "F":new Uint8Array([
0b01010010,
0b01000010,
0b01010010,
0b01000010,
0b01010010,
0b01000010,
0b01010010,
0b01000010]).buffer,
};

var LEVEL = [
"                                                                                        ",
"    LSSVSSR                                                                    abcde    ",
"    LSSSSSR                                                    ?               fghij  <F",
"    LS}S{SR                              -                                     klmno   F",
"             -   ?  #?###?      T       (?)     ?       TT         -           pqrst   F",
"  -         ( )              TT |  -   (   )           T||  -  T  ( )  -   -   uvwxy   F",
" ( )       (   )           TT|| | ( ) (     )      TTTT||| ( ) | (   )( ) ( )          F",
"^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^"
];
var LEVELWIDTH = LEVEL[0].length*8;
var GROUNDTILES = "^T?#Q";
var SOLIDTILES = "^|T?#Q";
var FLAGPOLE = "<F";

// the background image used for fast refreshes
var BACKGROUND = new Uint8Array(g.buffer.length);

var player = {};
var particles = [];
var screenOffset;

function drawTile(t,x,y) {
  if (t in TILES)
    g.drawImage({width:8,height:8,bpp:1,buffer:TILES[t]}, x, y);
}

function drawVertical(slice, x) {
  // don't bother drawing top 2
  drawTile(LEVEL[1][slice], x, 8);
  drawTile(LEVEL[2][slice], x, 16);
  drawTile(LEVEL[3][slice], x, 24);
  drawTile(LEVEL[4][slice], x, 32);
  drawTile(LEVEL[5][slice], x, 40);
  drawTile(LEVEL[6][slice], x, 48);
  drawTile(LEVEL[7][slice], x, 56);
}

function drawScreen(offset) {
  g.clear();
  for (var x=0;x<16;x++) {
    drawVertical(x+offset, x*8);
  }
  BACKGROUND.set(g.buffer);
}

function gameStart() {
  drawScreen(0);
  player = {
    score : 0,
    x : 0,
    y : 0,
    vy : 0,
    dir : 1,
  };
  particles = [];
  screenOffset = 0;
  setInterval(onFrame, 50);
}

function gameEnd() {
  g.clear();
  running = false;
  gameStart();
}

function onFrame() {
  if (BTNL.read()) {
    player.dir=-1;
    player.x--;
  }

  if (BTNR.read()) {
    player.dir=1;
    player.x++;
  }

  if (player.x<screenOffset+16) {
    if (screenOffset>0) {
      screenOffset-=8;
      drawScreen(screenOffset>>3);
    } else if (player.x<0) player.x = 0;
  }

  if (player.x>screenOffset+W-64) {
    if (screenOffset<LEVELWIDTH-W) {
      screenOffset+=8;
      drawScreen(screenOffset>>3);
    } else if (player.x>LEVELWIDTH-8) player.x = LEVELWIDTH-8;
  }

  player.vy+=0.1;

  if (player.vy>1) player.vy=1;

  player.y += player.vy;

  if (player.y<0) player.y=0;

  if (player.y>=H) player.y=H-1;

  var px = (player.x+4)>>3;

  if (BTNA.read() && player.vy>0 && GROUNDTILES.indexOf(LEVEL[(player.y+7)>>3][px])>=0)  {
    player.vy = -2;
  }

  // check for jumping up
  if (player.vy<0 && SOLIDTILES.indexOf(LEVEL[(player.y)>>3][px])>=0) {
    if (LEVEL[(player.y)>>3][px]=="?") {
      player.score++;
      particles.push({tile:"COIN",life:8,x:px*8,y:(player.y&~7)-8,vy:-1});
      backLightOn = !backLightOn; LED1.write(backLightOn);
    }
    player.y = (player.y+8)&~7;
    player.vy = 0;
  } else {
    // check for left into solid block
    if (SOLIDTILES.indexOf(LEVEL[(player.y)>>3][player.x>>3])>=0) {
      player.x=(player.x+8)&~7;
    }
    // check for right into solid block
    if (SOLIDTILES.indexOf(LEVEL[(player.y)>>3][(player.x+8)>>3])>=0) {
      player.x=(player.x)&~7;
    }
  }

  // check for end
    if (FLAGPOLE.indexOf(LEVEL[(player.y)>>3][player.x>>3])>=0) {
      gameEnd();
    }

  // check for ground
  if (player.vy>0 && GROUNDTILES.indexOf(LEVEL[(player.y+7)>>3][px])>=0) {
    player.y = (player.y-1)&~7;
    player.vy = 0;
  }

  // refresh background
  new Uint8Array(g.buffer).set(BACKGROUND.buffer);
  // draw particles
  for (var i=0;i<particles.length;i++) {
    var p = particles[i];
    p.y+=p.vy;
    drawTile(p.tile,p.x-screenOffset,p.y);
    if (p.life-- <= 0) {
      particles.splice(i,1);
      i--;
    }
  }
  // draw player
  drawTile((player.dir>0)?"PR":"PL",player.x-screenOffset,player.y);
  g.drawString(player.score,0,0);
  g.flip();
}

function onInit() {
  gameStart();
}

onInit();