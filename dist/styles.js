const ApplicationContainer = {
    'z-index': 999999,
    'position': 'fixed',
    'top': 0,
    'left': 0,
    'user-select': 'none',
    'background': 'red',
    'font-size': '0.85em'
};

const ApplicationMenuStyle = {
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

const Accelerator = {
    'opacity': 0.5
};

const Separator = {
    'border-bottom': '1px solid rgba(0,0,0,0.1)',
    'margin': '0.5em 0'
};

const AcceleratorKey = {
    'text-decoration': 'underline',
    'text-decoration-color': 'rgba(0,0,0,0.5)'
};

const MinimumColumnWidth = 20;

const SelectedBackground = 'rgba(0,0,0,0.1)';

const Overlap = 5;

// time to wait for submenu to open when hovering
const SubmenuOpenDelay = 500;

module.exports = {
    ApplicationContainer,
    ApplicationMenuStyle,
    MenuStyle,
    ApplicationMenuRowStyle,
    RowStyle,
    Accelerator,
    AcceleratorKey,
    Separator,
    MinimumColumnWidth,
    SelectedBackground,
    Overlap,
    SubmenuOpenDelay
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zdHlsZXMuanMiXSwibmFtZXMiOlsiQXBwbGljYXRpb25Db250YWluZXIiLCJBcHBsaWNhdGlvbk1lbnVTdHlsZSIsIk1lbnVTdHlsZSIsIkFwcGxpY2F0aW9uTWVudVJvd1N0eWxlIiwiUm93U3R5bGUiLCJBY2NlbGVyYXRvciIsIlNlcGFyYXRvciIsIkFjY2VsZXJhdG9yS2V5IiwiTWluaW11bUNvbHVtbldpZHRoIiwiU2VsZWN0ZWRCYWNrZ3JvdW5kIiwiT3ZlcmxhcCIsIlN1Ym1lbnVPcGVuRGVsYXkiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQSxNQUFNQSx1QkFBdUI7QUFDekIsZUFBVyxNQURjO0FBRXpCLGdCQUFZLE9BRmE7QUFHekIsV0FBTyxDQUhrQjtBQUl6QixZQUFRLENBSmlCO0FBS3pCLG1CQUFlLE1BTFU7QUFNekIsa0JBQWMsS0FOVztBQU96QixpQkFBYTtBQVBZLENBQTdCOztBQVVBLE1BQU1DLHVCQUF1QjtBQUN6QixlQUFXLE1BRGM7QUFFekIsc0JBQWtCLEtBRk87QUFHekIsYUFBUyxPQUhnQjtBQUl6Qix1QkFBbUIsa0JBSk07QUFLekIsYUFBUyxPQUxnQjtBQU16QixjQUFVLE1BTmU7QUFPekIsa0JBQWMsT0FQVztBQVF6QixlQUFXO0FBUmMsQ0FBN0I7O0FBV0EsTUFBTUMsWUFBWTtBQUNkLHNCQUFrQixRQURKO0FBRWQsZ0JBQVksT0FGRTtBQUdkLG1CQUFlLE1BSEQ7QUFJZCxhQUFTLE9BSks7QUFLZCxlQUFXLE1BTEc7QUFNZCx1QkFBbUIsT0FOTDtBQU9kLGNBQVUsMkJBUEk7QUFRZCxpQkFBYTtBQVJDLENBQWxCOztBQVdBLE1BQU1DLDBCQUEwQjtBQUM1QixlQUFXLGNBRGlCO0FBRTVCLGNBQVUsQ0FGa0I7QUFHNUIsbUJBQWU7QUFIYSxDQUFoQzs7QUFNQSxNQUFNQyxXQUFXO0FBQ2IsZUFBVyxNQURFO0FBRWIsZUFBVyxxQkFGRTtBQUdiLG1CQUFlO0FBSEYsQ0FBakI7O0FBTUEsTUFBTUMsY0FBYztBQUNoQixlQUFXO0FBREssQ0FBcEI7O0FBSUEsTUFBTUMsWUFBWTtBQUNkLHFCQUFpQiwyQkFESDtBQUVkLGNBQVU7QUFGSSxDQUFsQjs7QUFLQSxNQUFNQyxpQkFBaUI7QUFDbkIsdUJBQW1CLFdBREE7QUFFbkIsNkJBQXlCO0FBRk4sQ0FBdkI7O0FBS0EsTUFBTUMscUJBQXFCLEVBQTNCOztBQUVBLE1BQU1DLHFCQUFxQixpQkFBM0I7O0FBRUEsTUFBTUMsVUFBVSxDQUFoQjs7QUFFQTtBQUNBLE1BQU1DLG1CQUFtQixHQUF6Qjs7QUFFQUMsT0FBT0MsT0FBUCxHQUFpQjtBQUNiYix3QkFEYTtBQUViQyx3QkFGYTtBQUdiQyxhQUhhO0FBSWJDLDJCQUphO0FBS2JDLFlBTGE7QUFNYkMsZUFOYTtBQU9iRSxrQkFQYTtBQVFiRCxhQVJhO0FBU2JFLHNCQVRhO0FBVWJDLHNCQVZhO0FBV2JDLFdBWGE7QUFZYkM7QUFaYSxDQUFqQiIsImZpbGUiOiJzdHlsZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBBcHBsaWNhdGlvbkNvbnRhaW5lciA9IHtcclxuICAgICd6LWluZGV4JzogOTk5OTk5LFxyXG4gICAgJ3Bvc2l0aW9uJzogJ2ZpeGVkJyxcclxuICAgICd0b3AnOiAwLFxyXG4gICAgJ2xlZnQnOiAwLFxyXG4gICAgJ3VzZXItc2VsZWN0JzogJ25vbmUnLFxyXG4gICAgJ2JhY2tncm91bmQnOiAncmVkJyxcclxuICAgICdmb250LXNpemUnOiAnMC44NWVtJ1xyXG59XHJcblxyXG5jb25zdCBBcHBsaWNhdGlvbk1lbnVTdHlsZSA9IHtcclxuICAgICdkaXNwbGF5JzogJ2ZsZXgnLFxyXG4gICAgJ2ZsZXgtZGlyZWN0aW9uJzogJ3JvdycsXHJcbiAgICAnY29sb3InOiAnYmxhY2snLFxyXG4gICAgJ2JhY2tncm91bmRDb2xvcic6ICdyZ2IoMjMwLDIzMCwyMzApJyxcclxuICAgICd3aWR0aCc6ICcxMDB2dycsXHJcbiAgICAnYm9yZGVyJzogJ25vbmUnLFxyXG4gICAgJ2JveC1zaGFkb3cnOiAndW5zZXQnLFxyXG4gICAgJ291dGxpbmUnOiAnbm9uZSdcclxufVxyXG5cclxuY29uc3QgTWVudVN0eWxlID0ge1xyXG4gICAgJ2ZsZXgtZGlyZWN0aW9uJzogJ2NvbHVtbicsXHJcbiAgICAncG9zaXRpb24nOiAnZml4ZWQnLFxyXG4gICAgJ3VzZXItc2VsZWN0JzogJ25vbmUnLFxyXG4gICAgJ2NvbG9yJzogJ2JsYWNrJyxcclxuICAgICd6LWluZGV4JzogOTk5OTk5LFxyXG4gICAgJ2JhY2tncm91bmRDb2xvcic6ICd3aGl0ZScsXHJcbiAgICAnYm9yZGVyJzogJzFweCBzb2xpZCByZ2JhKDAsMCwwLDAuNSknLFxyXG4gICAgJ2JveFNoYWRvdyc6ICcxcHggM3B4IDNweCByZ2JhKDAsMCwwLDAuMjUpJ1xyXG59XHJcblxyXG5jb25zdCBBcHBsaWNhdGlvbk1lbnVSb3dTdHlsZSA9IHtcclxuICAgICdwYWRkaW5nJzogJzAuMjVlbSAwLjVlbScsXHJcbiAgICAnbWFyZ2luJzogMCxcclxuICAgICdsaW5lLWhlaWdodCc6ICcxZW0nXHJcbn1cclxuXHJcbmNvbnN0IFJvd1N0eWxlID0ge1xyXG4gICAgJ2Rpc3BsYXknOiAnZmxleCcsXHJcbiAgICAncGFkZGluZyc6ICcwLjI1ZW0gMS41ZW0gMC4yNWVtJyxcclxuICAgICdsaW5lLWhlaWdodCc6ICcxLjVlbSdcclxufVxyXG5cclxuY29uc3QgQWNjZWxlcmF0b3IgPSB7XHJcbiAgICAnb3BhY2l0eSc6IDAuNVxyXG59XHJcblxyXG5jb25zdCBTZXBhcmF0b3IgPSB7XHJcbiAgICAnYm9yZGVyLWJvdHRvbSc6ICcxcHggc29saWQgcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICdtYXJnaW4nOiAnMC41ZW0gMCdcclxufVxyXG5cclxuY29uc3QgQWNjZWxlcmF0b3JLZXkgPSB7XHJcbiAgICAndGV4dC1kZWNvcmF0aW9uJzogJ3VuZGVybGluZScsXHJcbiAgICAndGV4dC1kZWNvcmF0aW9uLWNvbG9yJzogJ3JnYmEoMCwwLDAsMC41KSdcclxufVxyXG5cclxuY29uc3QgTWluaW11bUNvbHVtbldpZHRoID0gMjBcclxuXHJcbmNvbnN0IFNlbGVjdGVkQmFja2dyb3VuZCA9ICdyZ2JhKDAsMCwwLDAuMSknXHJcblxyXG5jb25zdCBPdmVybGFwID0gNVxyXG5cclxuLy8gdGltZSB0byB3YWl0IGZvciBzdWJtZW51IHRvIG9wZW4gd2hlbiBob3ZlcmluZ1xyXG5jb25zdCBTdWJtZW51T3BlbkRlbGF5ID0gNTAwXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIEFwcGxpY2F0aW9uQ29udGFpbmVyLFxyXG4gICAgQXBwbGljYXRpb25NZW51U3R5bGUsXHJcbiAgICBNZW51U3R5bGUsXHJcbiAgICBBcHBsaWNhdGlvbk1lbnVSb3dTdHlsZSxcclxuICAgIFJvd1N0eWxlLFxyXG4gICAgQWNjZWxlcmF0b3IsXHJcbiAgICBBY2NlbGVyYXRvcktleSxcclxuICAgIFNlcGFyYXRvcixcclxuICAgIE1pbmltdW1Db2x1bW5XaWR0aCxcclxuICAgIFNlbGVjdGVkQmFja2dyb3VuZCxcclxuICAgIE92ZXJsYXAsXHJcbiAgICBTdWJtZW51T3BlbkRlbGF5XHJcbn0iXX0=