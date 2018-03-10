const ApplicationContainerStyle = {
    'z-index': 999999,
    'position': 'fixed',
    'top': 0,
    'left': 0,
    'user-select': 'none',
    'font-size': '0.85em'
};

const ApplicationMenuStyle = {
    'position': 'fixed',
    'display': 'flex',
    'flex-direction': 'row',
    'color': 'black',
    'backgroundColor': 'rgb(230,230,230)',
    'width': '100vw',
    'border': 'none',
    'box-shadow': 'unset',
    'outline': 'none'
};

const MenuStyle = {
    'flex-direction': 'column',
    'position': 'fixed',
    'user-select': 'none',
    'color': 'black',
    'z-index': 999999,
    'backgroundColor': 'white',
    'border': '1px solid rgba(0,0,0,0.5)',
    'boxShadow': '1px 3px 3px rgba(0,0,0,0.25)'
};

const ApplicationMenuRowStyle = {
    'padding': '0.25em 0.5em',
    'margin': 0,
    'line-height': '1em'
};

const RowStyle = {
    'display': 'flex',
    'padding': '0.25em 1.5em 0.25em',
    'line-height': '1.5em'
};

const AcceleratorStyle = {
    'opacity': 0.5
};

const SeparatorStyle = {
    'border-bottom': '1px solid rgba(0,0,0,0.1)',
    'margin': '0.5em 0'
};

const AcceleratorKeyStyle = {
    'text-decoration': 'underline',
    'text-decoration-color': 'rgba(0,0,0,0.5)'
};

const MinimumColumnWidth = 20;

const SelectedBackgroundStyle = 'rgba(0,0,0,0.1)';

const Overlap = 5;

// time to wait for submenu to open when hovering
const SubmenuOpenDelay = 500;

module.exports = {
    ApplicationContainerStyle,
    ApplicationMenuStyle,
    MenuStyle,
    ApplicationMenuRowStyle,
    RowStyle,
    AcceleratorStyle,
    AcceleratorKeyStyle,
    SeparatorStyle,
    MinimumColumnWidth,
    SelectedBackgroundStyle,
    Overlap,
    SubmenuOpenDelay
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25maWcuanMiXSwibmFtZXMiOlsiQXBwbGljYXRpb25Db250YWluZXJTdHlsZSIsIkFwcGxpY2F0aW9uTWVudVN0eWxlIiwiTWVudVN0eWxlIiwiQXBwbGljYXRpb25NZW51Um93U3R5bGUiLCJSb3dTdHlsZSIsIkFjY2VsZXJhdG9yU3R5bGUiLCJTZXBhcmF0b3JTdHlsZSIsIkFjY2VsZXJhdG9yS2V5U3R5bGUiLCJNaW5pbXVtQ29sdW1uV2lkdGgiLCJTZWxlY3RlZEJhY2tncm91bmRTdHlsZSIsIk92ZXJsYXAiLCJTdWJtZW51T3BlbkRlbGF5IiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTUEsNEJBQTRCO0FBQzlCLGVBQVcsTUFEbUI7QUFFOUIsZ0JBQVksT0FGa0I7QUFHOUIsV0FBTyxDQUh1QjtBQUk5QixZQUFRLENBSnNCO0FBSzlCLG1CQUFlLE1BTGU7QUFNOUIsaUJBQWE7QUFOaUIsQ0FBbEM7O0FBU0EsTUFBTUMsdUJBQXVCO0FBQ3pCLGdCQUFZLE9BRGE7QUFFekIsZUFBVyxNQUZjO0FBR3pCLHNCQUFrQixLQUhPO0FBSXpCLGFBQVMsT0FKZ0I7QUFLekIsdUJBQW1CLGtCQUxNO0FBTXpCLGFBQVMsT0FOZ0I7QUFPekIsY0FBVSxNQVBlO0FBUXpCLGtCQUFjLE9BUlc7QUFTekIsZUFBVztBQVRjLENBQTdCOztBQVlBLE1BQU1DLFlBQVk7QUFDZCxzQkFBa0IsUUFESjtBQUVkLGdCQUFZLE9BRkU7QUFHZCxtQkFBZSxNQUhEO0FBSWQsYUFBUyxPQUpLO0FBS2QsZUFBVyxNQUxHO0FBTWQsdUJBQW1CLE9BTkw7QUFPZCxjQUFVLDJCQVBJO0FBUWQsaUJBQWE7QUFSQyxDQUFsQjs7QUFXQSxNQUFNQywwQkFBMEI7QUFDNUIsZUFBVyxjQURpQjtBQUU1QixjQUFVLENBRmtCO0FBRzVCLG1CQUFlO0FBSGEsQ0FBaEM7O0FBTUEsTUFBTUMsV0FBVztBQUNiLGVBQVcsTUFERTtBQUViLGVBQVcscUJBRkU7QUFHYixtQkFBZTtBQUhGLENBQWpCOztBQU1BLE1BQU1DLG1CQUFtQjtBQUNyQixlQUFXO0FBRFUsQ0FBekI7O0FBSUEsTUFBTUMsaUJBQWlCO0FBQ25CLHFCQUFpQiwyQkFERTtBQUVuQixjQUFVO0FBRlMsQ0FBdkI7O0FBS0EsTUFBTUMsc0JBQXNCO0FBQ3hCLHVCQUFtQixXQURLO0FBRXhCLDZCQUF5QjtBQUZELENBQTVCOztBQUtBLE1BQU1DLHFCQUFxQixFQUEzQjs7QUFFQSxNQUFNQywwQkFBMEIsaUJBQWhDOztBQUVBLE1BQU1DLFVBQVUsQ0FBaEI7O0FBRUE7QUFDQSxNQUFNQyxtQkFBbUIsR0FBekI7O0FBRUFDLE9BQU9DLE9BQVAsR0FBaUI7QUFDYmIsNkJBRGE7QUFFYkMsd0JBRmE7QUFHYkMsYUFIYTtBQUliQywyQkFKYTtBQUtiQyxZQUxhO0FBTWJDLG9CQU5hO0FBT2JFLHVCQVBhO0FBUWJELGtCQVJhO0FBU2JFLHNCQVRhO0FBVWJDLDJCQVZhO0FBV2JDLFdBWGE7QUFZYkM7QUFaYSxDQUFqQiIsImZpbGUiOiJjb25maWcuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBBcHBsaWNhdGlvbkNvbnRhaW5lclN0eWxlID0ge1xyXG4gICAgJ3otaW5kZXgnOiA5OTk5OTksXHJcbiAgICAncG9zaXRpb24nOiAnZml4ZWQnLFxyXG4gICAgJ3RvcCc6IDAsXHJcbiAgICAnbGVmdCc6IDAsXHJcbiAgICAndXNlci1zZWxlY3QnOiAnbm9uZScsXHJcbiAgICAnZm9udC1zaXplJzogJzAuODVlbSdcclxufVxyXG5cclxuY29uc3QgQXBwbGljYXRpb25NZW51U3R5bGUgPSB7XHJcbiAgICAncG9zaXRpb24nOiAnZml4ZWQnLFxyXG4gICAgJ2Rpc3BsYXknOiAnZmxleCcsXHJcbiAgICAnZmxleC1kaXJlY3Rpb24nOiAncm93JyxcclxuICAgICdjb2xvcic6ICdibGFjaycsXHJcbiAgICAnYmFja2dyb3VuZENvbG9yJzogJ3JnYigyMzAsMjMwLDIzMCknLFxyXG4gICAgJ3dpZHRoJzogJzEwMHZ3JyxcclxuICAgICdib3JkZXInOiAnbm9uZScsXHJcbiAgICAnYm94LXNoYWRvdyc6ICd1bnNldCcsXHJcbiAgICAnb3V0bGluZSc6ICdub25lJ1xyXG59XHJcblxyXG5jb25zdCBNZW51U3R5bGUgPSB7XHJcbiAgICAnZmxleC1kaXJlY3Rpb24nOiAnY29sdW1uJyxcclxuICAgICdwb3NpdGlvbic6ICdmaXhlZCcsXHJcbiAgICAndXNlci1zZWxlY3QnOiAnbm9uZScsXHJcbiAgICAnY29sb3InOiAnYmxhY2snLFxyXG4gICAgJ3otaW5kZXgnOiA5OTk5OTksXHJcbiAgICAnYmFja2dyb3VuZENvbG9yJzogJ3doaXRlJyxcclxuICAgICdib3JkZXInOiAnMXB4IHNvbGlkIHJnYmEoMCwwLDAsMC41KScsXHJcbiAgICAnYm94U2hhZG93JzogJzFweCAzcHggM3B4IHJnYmEoMCwwLDAsMC4yNSknXHJcbn1cclxuXHJcbmNvbnN0IEFwcGxpY2F0aW9uTWVudVJvd1N0eWxlID0ge1xyXG4gICAgJ3BhZGRpbmcnOiAnMC4yNWVtIDAuNWVtJyxcclxuICAgICdtYXJnaW4nOiAwLFxyXG4gICAgJ2xpbmUtaGVpZ2h0JzogJzFlbSdcclxufVxyXG5cclxuY29uc3QgUm93U3R5bGUgPSB7XHJcbiAgICAnZGlzcGxheSc6ICdmbGV4JyxcclxuICAgICdwYWRkaW5nJzogJzAuMjVlbSAxLjVlbSAwLjI1ZW0nLFxyXG4gICAgJ2xpbmUtaGVpZ2h0JzogJzEuNWVtJ1xyXG59XHJcblxyXG5jb25zdCBBY2NlbGVyYXRvclN0eWxlID0ge1xyXG4gICAgJ29wYWNpdHknOiAwLjVcclxufVxyXG5cclxuY29uc3QgU2VwYXJhdG9yU3R5bGUgPSB7XHJcbiAgICAnYm9yZGVyLWJvdHRvbSc6ICcxcHggc29saWQgcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICdtYXJnaW4nOiAnMC41ZW0gMCdcclxufVxyXG5cclxuY29uc3QgQWNjZWxlcmF0b3JLZXlTdHlsZSA9IHtcclxuICAgICd0ZXh0LWRlY29yYXRpb24nOiAndW5kZXJsaW5lJyxcclxuICAgICd0ZXh0LWRlY29yYXRpb24tY29sb3InOiAncmdiYSgwLDAsMCwwLjUpJ1xyXG59XHJcblxyXG5jb25zdCBNaW5pbXVtQ29sdW1uV2lkdGggPSAyMFxyXG5cclxuY29uc3QgU2VsZWN0ZWRCYWNrZ3JvdW5kU3R5bGUgPSAncmdiYSgwLDAsMCwwLjEpJ1xyXG5cclxuY29uc3QgT3ZlcmxhcCA9IDVcclxuXHJcbi8vIHRpbWUgdG8gd2FpdCBmb3Igc3VibWVudSB0byBvcGVuIHdoZW4gaG92ZXJpbmdcclxuY29uc3QgU3VibWVudU9wZW5EZWxheSA9IDUwMFxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBBcHBsaWNhdGlvbkNvbnRhaW5lclN0eWxlLFxyXG4gICAgQXBwbGljYXRpb25NZW51U3R5bGUsXHJcbiAgICBNZW51U3R5bGUsXHJcbiAgICBBcHBsaWNhdGlvbk1lbnVSb3dTdHlsZSxcclxuICAgIFJvd1N0eWxlLFxyXG4gICAgQWNjZWxlcmF0b3JTdHlsZSxcclxuICAgIEFjY2VsZXJhdG9yS2V5U3R5bGUsXHJcbiAgICBTZXBhcmF0b3JTdHlsZSxcclxuICAgIE1pbmltdW1Db2x1bW5XaWR0aCxcclxuICAgIFNlbGVjdGVkQmFja2dyb3VuZFN0eWxlLFxyXG4gICAgT3ZlcmxhcCxcclxuICAgIFN1Ym1lbnVPcGVuRGVsYXlcclxufSJdfQ==