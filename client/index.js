//Dependencies
require('console-png').attachTo(console);
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const https = require('https');

var image = require('fs').readFileSync(__dirname + '/hole.png');
console.png(image);

const readline = require('readline');
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {process.exit();}
  else {keyPress(key.name)}
});

/* Consts & let */
const TileDir = '../public/editor/tiles/';
const PlayerDir = '../public/players/';
const map = JSON.parse(fs.readFileSync('../public/data/map.json'));
const players = JSON.parse(fs.readFileSync('../public/data/players.json'));
const t = 25;
const canvas = createCanvas(t*map.length, t*map[0].length);
const ctx = canvas.getContext('2d');
let TileSet = require('../public/data/tileSet.json');
let TileTexture = [];
let PlayerTexture = [];
let mapMessage = {}

/* Get images in TileTexture and PlayerTexture */
fs.readdir(TileDir, (err, files) => {files.forEach((file)=>{loadImage(TileDir+file).then((image) => {TileTexture[file.split(".png")[0]] = image})})});
fs.readdir(PlayerDir, (err, files) => {files.forEach((file)=>{loadImage(PlayerDir+file).then((image) => {PlayerTexture[file.split(".png")[0]] = image})})});

/* Tiles to png */
async function getMap(user){
	await map.forEach((line,x)=>{
		line.forEach((cols,y)=>{
			if (TileTexture[line[y]])
				ctx.drawImage(TileTexture[line[y]], t*y, t*x, t , t)
			else
				ctx.drawImage(TileTexture["unknown"], t*y, t*x, t , t)
		})
	})
	await Object.keys(players).forEach(async (player)=>{
		if (player=="spawn") return
		if(PlayerTexture[player])
			ctx.drawImage(PlayerTexture[player], t*players[player][0], t*players[player][1], t , t)
	})
	await fs.writeFileSync('map.png', canvas.toBuffer());
}

async function keyPress(keyName) {
		if (keyName == "??" && players[id][0]!=0) {  players[id][0] -= 1 }
		if (keyName == "??" && players[id][0]!=map.length) {  players[id][0] += 1 }
		if (keyName == "??" && players[id][1]!=0) {  players[id][1] -= 1 }
		if (keyName == "??" && players[id][1]!=map[0].length) {  players[id][1] += 1 }
		fs.writeFileSync('../public/data/players.json', JSON.stringify(players))
		reaction.message.reactions.cache.find(r => r.emoji.name == reaction.emoji.name).users.remove(user);
		sendMap(mapMessage)
}
async function messageHandler(msg) {
	if (msg.content.startsWith(PREFIX)) cmd = msg.content.split(PREFIX)[1]
	else return;
	msg.delete()
	switch(cmd){
		case 'register':downloadAvatar(msg.author);break;
		case 'map':sendReactMessage(msg);break;
		case 'guildID':msg.channel.send(msg.guild.id);break;
	}
}

function sendMap(msg){
	getMap(msg.author)
	// msg.channel.send("",{files: ["map.png"]}).then(msg=>mapMessage = msg)
}

async function sendReactMessage(msg){
	msg.channel.messages.fetch().then(messages => {
		messages.forEach(msge => msge.delete());
	});
	msg.channel.send("React for move !").then((message)=>{
		message.react("??");
		message.react("??");
		message.react("??");
		message.react("??");
	})
	sendMap(msg,"new")
}

async function downloadAvatar(user){
	id = user.id
	var file = fs.createWriteStream(PlayerDir+id+'.png');
	var request = await https.get(user.displayAvatarURL({ format: 'png', size: 32 }), async function(response) {
		await response.pipe(file,()=>{console.log('piped')})
	})
	setTimeout(()=>{loadImage(PlayerDir+id+'.png').then((image) => {PlayerTexture[id] = image})},1000)
}

// client.on('ready', () => {
	// console.log(`Logged in as ${client.user.tag} with name ${client.user.id}!`);
// });
// client.on('messageReactionAdd', reactionAdd);
// client.on('message', messageHandler);
// client.login('ODMzOTYwMzI3NDk0MjM4MjI4.YH58FA.nNIUl0DNMRhgUtzZlM-0rAXc2Xs');

// var f = function() { if(!false) process.nextTick(f) };f()