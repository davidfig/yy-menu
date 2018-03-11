const Menu = require('../src/menu')
const MenuItem = Menu.MenuItem
const LocalAccelerator = Menu.LocalAccelerator

function test()
{
    // change a Menu setting
    Menu.Config.SubmenuOpenDelay = 300

    const menu = new Menu()

    const file = new Menu()
    file.append(new MenuItem({ label: '&New...', accelerator: 'CommandOrControl+N', click: () => console.log('new dialog open') }))
    file.append(new MenuItem({ label: '&Save...', accelerator: 'CommandOrControl+S' }))
    file.insert(1, new MenuItem({ label: '&Open...', accelerator: 'CommandOrControl+O', click: () => console.log('open pressed') }))
    file.append(new MenuItem({ type: 'separator' }))
    const autosave = new MenuItem({ label: '&Autosave', type: 'checkbox', checked: false })
    file.append(autosave)
    file.append(new MenuItem({ type: 'separator' }))
    file.append(new MenuItem({ label: 'E&xit' }))

    menu.append(new MenuItem({ label: '&File', submenu: file }))

    const submenu = new Menu()
    submenu.append(new MenuItem({ label: 'first', accelerator: 'ctrl+a | ctrl+b', click: () => console.log('first pressed') }))
    submenu.append(new MenuItem({ label: 'second' }))
    submenu.append(new MenuItem({ label: 'third' }))
    submenu.append(new MenuItem({ label: 'fourth' }))

    const subsubmenu = new Menu()
    subsubmenu.append(new MenuItem({ label: 'first' }))
    subsubmenu.append(new MenuItem({ label: 'second' }))
    submenu.append(new MenuItem({ label: 'sub-submenu', submenu: subsubmenu }))

    const submenu2 = new Menu()
    submenu2.append(new MenuItem({ label: 'first' }))
    submenu2.append(new MenuItem({ label: 'second' }))
    submenu2.append(new MenuItem({ label: 'third' }))
    submenu2.append(new MenuItem({ label: 'fourth' }))

    const view = new Menu()
    view.append(new MenuItem({ label: 'submenu &1', submenu}))
    view.append(new MenuItem({ label: 'zoom &in', accelerator: 'CommandOrControl+='}))
    view.append(new MenuItem({ label: 'zoom &out', accelerator: 'CommandOrControl+-'}))
    view.append(new MenuItem({ type: 'separator' }))
    view.append(new MenuItem({ label: 'submenu &2', submenu: submenu2 }))
    menu.append(new MenuItem({ label: '&View', submenu: view }))

    const help = new Menu()
    help.append(new MenuItem({ label: 'About' }))
    menu.append(new MenuItem({ label: '&Help', submenu: help }))

    Menu.setApplicationMenu(menu)

    LocalAccelerator.register('a', () => console.log('hi'))

    // test checked change
    autosave.checked = true
}

window.onload = function ()
{
    test()
    require('fork-me-github')('https://github.com/davidfig/menu')
    require('./highlight')()
}