const Menu = require('../src/menu')
const MenuItem = Menu.MenuItem

function test()
{
    const menu = new Menu()

    const file = new Menu()
    file.append(new MenuItem({ label: '&New...', accelerator: 'Control+N', click: () => console.log('new dialog open') }))
    file.append(new MenuItem({ label: '&Save...', accelerator: 'CommandOrControl+S' }))
    file.insert(1, new MenuItem({ label: '&Open...', accelerator: 'CommandOrControl+O' }))
    file.append(new MenuItem({ type: 'separator' }))
    file.append(new MenuItem({ label: '&Autosave', type: 'checkbox', checked: true }))
    file.append(new MenuItem({ type: 'separator' }))
    file.append(new MenuItem({ label: 'E&xit' }))

    menu.append(new MenuItem({ label: '&File', submenu: file }))

    const submenu = new Menu()
    submenu.append(new MenuItem({ label: 'first' }))
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

    Menu.setApplicationMenu(menu)

    Menu.GlobalAccelarator.register('a', () => console.log('hi'))
}

window.onload = function ()
{
    test()
    require('fork-me-github')('https://github.com/davidfig/menu')
    require('./highlight')()
}