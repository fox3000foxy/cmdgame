//Dependencies
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const Discord = require('discord.js');
const https = require('https');

/* Consts & let */
const TileDir = './editor/tiles/';
const PlayerDir = './players/';
const map = JSON.parse(fs.readFileSync('./data/map.json'));
const players = JSON.parse(fs.readFileSync('./data/players.json'));
const t = 25;
const canvas = createCanvas(t*map.length, t*map[0].length);
const ctx = canvas.getContext('2d');
const client = new Discord.Client({ ws: { properties: { $browser: "Discord iOS" }} });
const PREFIX = "!"
let TileSet = require('./data/tileSet.json');
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

async function reactionAdd(reaction, user) {
	id = user.id.toLowerCase()
	if (user==client.user) return
	if (!PlayerTexture[id]) {reaction.message.channel.send("Please use "+PREFIX+"register for use map !").then(msg=>setTimeout(()=>{msg.delete()},2500));return;}
	if (!players[id]){players[id] = players["spawn"]}
	if (reaction.count >= 2) {
		if (reaction.emoji.name == "⬅️" && players[id][0]!=0) {  players[id][0] -= 1 }
		if (reaction.emoji.name == "➡️" && players[id][0]!=map.length) {  players[id][0] += 1 }
		if (reaction.emoji.name == "⬆️" && players[id][1]!=0) {  players[id][1] -= 1 }
		if (reaction.emoji.name == "⬇️" && players[id][1]!=map[0].length) {  players[id][1] += 1 }
		fs.writeFileSync('data/players.json', JSON.stringify(players))
		reaction.message.reactions.cache.find(r => r.emoji.name == reaction.emoji.name).users.remove(user);
		sendMap(mapMessage)
	}
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

function sendMap(msg,mode){
	getMap(msg.author)
	if (!mode) msg.delete()
	msg.channel.send("",{files: ["map.png"]}).then(msg=>mapMessage = msg)
}

async function sendReactMessage(msg){
	msg.channel.messages.fetch().then(messages => {
		messages.forEach(msge => msge.delete());
	});
	msg.channel.send("React for move !").then((message)=>{
		message.react("⬅️");
		message.react("➡️");
		message.react("⬆️");
		message.react("⬇️");
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

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag} with name ${client.user.id}!`);
});
client.on('messageReactionAdd', reactionAdd);
client.on('message', messageHandler);
client.login('ODMzOTYwMzI3NDk0MjM4MjI4.YH58FA.nNIUl0DNMRhgUtzZlM-0rAXc2Xs');