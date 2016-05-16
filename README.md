<h1 align="center">
WildBeast
</h1>

<p align="center">
<a href="https://snap-ci.com/SteamingMutt/Wild3.0/branch/master"><img src="https://snap-ci.com/j84-AwSfA7N3noK6TdkRDaIv7IvUJYsS01S0cigBsxU/build_image" alt="Build Status"></a>
<a href="http://nodejs.org"><img src="https://img.shields.io/badge/Node.js-5.10.1-blue.svg" alt="Node JS"></a>
<a href="http://npmjs.com"><img src="https://img.shields.io/badge/npm-3.8.6-blue.svg" alt="npm"></a>
<a><img src="https://img.shields.io/badge/Version-3.0.0--alpha.2-blue.svg" alt="Version"></a>
<a href="https://discord.gg/0cFoiR5QVh5LZlQO"><img src="https://discordapp.com/api/servers/110462143152803840/widget.png" alt="Discord server"></a>
</p>

---

WildBeast is made to function as a multi-function Discord bot framework, check out the [wiki](https://github.com/SteamingMutt/WildBeast/wiki) for more info!

# Installing
First off, make sure you have Node.js installed, you can check by running this in your terminal:
```bash
node --version
```
This should return something like:
```bash
v5.10.1
```

### Use [Node.js 5.10.1](https://nodejs.org/download/release/v5.10.1/) for the best experience! Anything higher will not work properly!

<br></br>
If you haven't cloned/downloaded the files already, do that now.   
Then, open a command window in the folder you've copied the files to, (Windows users can do shift+right-click in any directory to quickly open a cmd window in that folder) and type:
```bash
npm install
```
This will install all the required modules for WildBeast, if you get any errors, you can safely ignore them, as long as you end with a view similar to:
```bash
WildBeast@3.0.0
+-- discordie@0.5.6  (git://github.com/qeled/discordie.git#6fce7e8e552bd64663541ffaf374e07cc5b8fd2d)
| `-- ws@0.8.1
|   `-- bufferutil@1.2.1
|     `-- nan@2.3.0
`-- nedb@1.8.0
```
<br></br>
Now, you have 2 choices, either make your own config file (This allows for greater customization, but won't directly allow for upgrading.), or let the script make you one (This lets you get started quicker, but takes a while to complete.)    
<br></br>
If you choose to make your own, take the `config.example.json` file as a base and edit it to your needs.   
Then, run:
```bash
node DougBot.js --noinitial
```
This tells the script to skip the initial configuration and go straight to logging in.
<br></br>
<br></br>
If you want the script to configure the basics for you, or you want to upgrade from a previous install, just run
```bash
node DougBot.js
```
The script will then ask you some questions to get you started.
<br></br>
<br></br>
If you made your own config file, and you want to upgrade your databases from a previous WildBeast install (that has a version higer than 2.1.0), run:
```bash
node DougBot.js --forceupgrade
```
---

<p align="center">
  <a href="https://github.com/feross/standard"><img src="https://cdn.rawgit.com/feross/standard/master/badge.svg" alt="JavaScript Standard Code Style"></a>
  <a href="https://discord.gg/0cFoiR5QVh5gF8Un"><img src="https://discordapp.com/api/servers/110462143152803840/widget.png?style=banner2" alt="Discord server"></a>
</p>
