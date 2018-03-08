const Menu = require('../src/menu')
const MenuItem = Menu.MenuItem

function test()
{
    const menu = new Menu()

    const file = new Menu()
    file.append(new MenuItem({ label: '&Save...', accelerator: 'CommandOrControl+S' }))
    file.append(new MenuItem({ label: '&Open...', accelerator: 'CommandOrControl+O' }))
    file.append(new MenuItem({ type: 'separator' }))
    file.append(new MenuItem({ label: '&Autosave', type: 'checkbox', checked: true }))
    file.append(new MenuItem({ type: 'separator' }))
    file.append(new MenuItem({ label: 'E&xit' }))

    menu.append(new MenuItem({ label: '&File', submenu: file }))


    const windows = new Menu()
    windows.append(new MenuItem({ label: 'first window' }))
    windows.append(new MenuItem({ label: 'second window' }))
    windows.append(new MenuItem({ label: 'third window' }))
    windows.append(new MenuItem({ label: 'fourth window' }))

    const view = new Menu()
    view.append(new MenuItem({ label: 'zoom in', accelerator: 'CommandOrControl+='}))
    view.append(new MenuItem({ label: 'zoom out', accelerator: 'CommandOrControl+-'}))
    view.append(new MenuItem({ type: 'separator' }))
    view.append(new MenuItem({ label: 'frames', submenu: windows }))
    menu.append(new MenuItem({ label: '&View', submenu: view }))

    Menu.SetApplicationMenu(menu)
}

window.onload = function ()
{
    test()
    require('fork-me-github')('https://github.com/davidfig/shape-points')
    require('./highlight')()
}