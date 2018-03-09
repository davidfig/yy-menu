# yy-menu
A traditional menu system for web apps inspired by Electron. Also includes an implementation of Accelerators to allow keyboard access to the menu (and global keyboard access across the app).

## rationalization

This came together because I wanted to cross-build and release electron apps as web-apps. I needed a replacement for Electron.Menu, Electron.MenuItem, and Electron.Accelerators. 

## installation

    npm i yy-menu

## simple example
```js
var Menu = require('yy-menu');
var MenuItem = Menu.MenuItem;

var menu = new Menu();
menu.append(new MenuItem({ label: '&Test', accelerator: 'ctrl+b', click: clickCallback }));

var submenu = new Menu();
submenu.append(new MenuItem({ label: 'Check&box', type: 'checkbox', checked: true }));

menu.append(new MenuItem({ label: 'Sub&menu', submenu: submenu }));

// set menu as the application (i.e., top level) menu
Menu.setApplicationMenu(menu);

// register a keyboard shortcut unrelated to menu
Menu.GlobalAccelerator.register('ctrl-a', pressA);

function clickCallback() { console.log('You clicked me!'); }
function pressA() { console.log('you pressed A'); }
```

## live demo

[https://davidfig.github.io/yy-menu](https://davidfig.github.io/yy-menu/)

## API
[https://davidfig.github.io/yy-menu/jsdoc](https://davidfig.github.io/yy-menu/jsdoc)

## License  
MIT License  
(c) 2018 [YOPEY YOPEY LLC](https://yopeyopey.com/) by [David Figatner](https://twitter.com/yopey_yopey/)
