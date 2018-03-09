const ApplicationContainer = {
    'z-index': 999999,
    'position': 'fixed',
    'top': 0,
    'left': 0,
    'user-select': 'none',
    'background': 'red',
    'font-size': '0.85em'
}

const ApplicationMenuStyle = {
    'display': 'flex',
    'flex-direction': 'row',
    'color': 'black',
    'backgroundColor': 'rgb(230,230,230)',
    'width': '100vw',
    'border': 'none',
    'box-shadow': 'unset',
    'outline': 'none'
}

const MenuStyle = {
    'flex-direction': 'column',
    'position': 'fixed',
    'user-select': 'none',
    'color': 'black',
    'z-index': 999999,
    'backgroundColor': 'white',
    'border': '1px solid rgba(0,0,0,0.5)',
    'boxShadow': '1px 3px 3px rgba(0,0,0,0.25)'
}

const ApplicationMenuRowStyle = {
    'padding': '0.25em 0.5em',
    'margin': 0,
    'line-height': '1em'
}

const RowStyle = {
    'display': 'flex',
    'padding': '0.25em 1.5em 0.25em',
    'line-height': '1.5em'
}

const Accelerator = {
    'opacity': 0.5
}

const Separator = {
    'border-bottom': '1px solid rgba(0,0,0,0.1)',
    'margin': '0.5em 0'
}

const MinimumColumnWidth = 20

const SelectedBackground = 'rgba(0,0,0,0.1)'

const Overlap = 5

// time to wait for submenu to open when hovering
const SubmenuOpenDelay = 500

module.exports = {
    ApplicationContainer,
    ApplicationMenuStyle,
    MenuStyle,
    ApplicationMenuRowStyle,
    RowStyle,
    Accelerator,
    Separator,
    MinimumColumnWidth,
    SelectedBackground,
    Overlap,
    SubmenuOpenDelay
}