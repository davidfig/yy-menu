const Config = {

    /**
     * application menu container styles
     * @type {object}
     */
    ApplicationContainerStyle: {
        'z-index': 999999,
        'position': 'fixed',
        'top': 0,
        'left': 0,
        'user-select': 'none',
        'font-size': '0.85em'
    },

    /**
     * application menu-bar styles
     * @type {object}
     */
    ApplicationMenuStyle: {
        'position': 'fixed',
        'display': 'flex',
        'flex-direction': 'row',
        'color': 'black',
        'backgroundColor': 'rgb(230,230,230)',
        'width': '100vw',
        'border': 'none',
        'box-shadow': 'unset',
        'outline': 'none'
    },

    /**
     * application menu entry styles
     * @type {object}
     */
    ApplicationMenuRowStyle: {
        'padding': '0.25em 0.5em',
        'margin': 0,
        'line-height': '1em'
    },

    /**
     * lower-level menu window styles
     * @type {object}
     */
    MenuStyle: {
        'flex-direction': 'column',
        'position': 'fixed',
        'user-select': 'none',
        'color': 'black',
        'z-index': 999999,
        'backgroundColor': 'white',
        'border': '1px solid rgba(0,0,0,0.5)',
        'boxShadow': '1px 3px 3px rgba(0,0,0,0.25)'
    },

    /**
     * lower-level menu row styles
     * @type {object}
     */
    RowStyle: {
        'display': 'flex',
        'padding': '0.25em 1.5em 0.25em',
        'line-height': '1.5em'
    },

    /**
     * lower-level menu accelerator styles
     * @type {object}
     */
    AcceleratorStyle: {
        'opacity': 0.5
    },

    /**
     * lower-level menu separator styles
     * @type {object}
     */
    SeparatorStyle: {
        'border-bottom': '1px solid rgba(0,0,0,0.1)',
        'margin': '0.5em 0'
    },

    /**
     * accelerator key styles
     * NOTE: accelerator keys must use text-decoration as its used as a toggle in the code
     * @type {object}
     */
    AcceleratorKeyStyle: {
        'text-decoration': 'underline',
        'text-decoration-color': 'rgba(0,0,0,0.5)'
    },

    /**
     * minimum column width in pixels for checked and arrow in the lower-level menus
     * @type {number}
     */
    MinimumColumnWidth: 20,

    /**
     * CSS background style for selected MenuItems
     * NOTE: unselected have 'transparent' style
     * @type {string}
     */
    SelectedBackgroundStyle: 'rgba(0,0,0,0.1)',

    /**
     * number of pixels to overlap child menus
     * @type {number}
     */
    Overlap: 5,

    /**
     * time in milliseconds to wait for submenu to open when mouse hovers
     * @param {number}
     */
    SubmenuOpenDelay: 500
};

module.exports = Config;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25maWcuanMiXSwibmFtZXMiOlsiQ29uZmlnIiwiQXBwbGljYXRpb25Db250YWluZXJTdHlsZSIsIkFwcGxpY2F0aW9uTWVudVN0eWxlIiwiQXBwbGljYXRpb25NZW51Um93U3R5bGUiLCJNZW51U3R5bGUiLCJSb3dTdHlsZSIsIkFjY2VsZXJhdG9yU3R5bGUiLCJTZXBhcmF0b3JTdHlsZSIsIkFjY2VsZXJhdG9yS2V5U3R5bGUiLCJNaW5pbXVtQ29sdW1uV2lkdGgiLCJTZWxlY3RlZEJhY2tncm91bmRTdHlsZSIsIk92ZXJsYXAiLCJTdWJtZW51T3BlbkRlbGF5IiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTUEsU0FBUzs7QUFFWDs7OztBQUlBQywrQkFBMkI7QUFDdkIsbUJBQVcsTUFEWTtBQUV2QixvQkFBWSxPQUZXO0FBR3ZCLGVBQU8sQ0FIZ0I7QUFJdkIsZ0JBQVEsQ0FKZTtBQUt2Qix1QkFBZSxNQUxRO0FBTXZCLHFCQUFhO0FBTlUsS0FOaEI7O0FBZVg7Ozs7QUFJQUMsMEJBQXNCO0FBQ2xCLG9CQUFZLE9BRE07QUFFbEIsbUJBQVcsTUFGTztBQUdsQiwwQkFBa0IsS0FIQTtBQUlsQixpQkFBUyxPQUpTO0FBS2xCLDJCQUFtQixrQkFMRDtBQU1sQixpQkFBUyxPQU5TO0FBT2xCLGtCQUFVLE1BUFE7QUFRbEIsc0JBQWMsT0FSSTtBQVNsQixtQkFBVztBQVRPLEtBbkJYOztBQStCWDs7OztBQUlBQyw2QkFBeUI7QUFDckIsbUJBQVcsY0FEVTtBQUVyQixrQkFBVSxDQUZXO0FBR3JCLHVCQUFlO0FBSE0sS0FuQ2Q7O0FBeUNYOzs7O0FBSUFDLGVBQVc7QUFDUCwwQkFBa0IsUUFEWDtBQUVQLG9CQUFZLE9BRkw7QUFHUCx1QkFBZSxNQUhSO0FBSVAsaUJBQVMsT0FKRjtBQUtQLG1CQUFXLE1BTEo7QUFNUCwyQkFBbUIsT0FOWjtBQU9QLGtCQUFVLDJCQVBIO0FBUVAscUJBQWE7QUFSTixLQTdDQTs7QUF3RFg7Ozs7QUFJQUMsY0FBVTtBQUNOLG1CQUFXLE1BREw7QUFFTixtQkFBVyxxQkFGTDtBQUdOLHVCQUFlO0FBSFQsS0E1REM7O0FBa0VYOzs7O0FBSUFDLHNCQUFrQjtBQUNkLG1CQUFXO0FBREcsS0F0RVA7O0FBMEVYOzs7O0FBSUFDLG9CQUFnQjtBQUNaLHlCQUFpQiwyQkFETDtBQUVaLGtCQUFVO0FBRkUsS0E5RUw7O0FBbUZYOzs7OztBQUtBQyx5QkFBcUI7QUFDakIsMkJBQW1CLFdBREY7QUFFakIsaUNBQXlCO0FBRlIsS0F4RlY7O0FBNkZYOzs7O0FBSUFDLHdCQUFvQixFQWpHVDs7QUFtR1g7Ozs7O0FBS0FDLDZCQUF5QixpQkF4R2Q7O0FBMEdYOzs7O0FBSUFDLGFBQVMsQ0E5R0U7O0FBZ0hYOzs7O0FBSUFDLHNCQUFrQjtBQXBIUCxDQUFmOztBQXVIQUMsT0FBT0MsT0FBUCxHQUFpQmQsTUFBakIiLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgQ29uZmlnID0ge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogYXBwbGljYXRpb24gbWVudSBjb250YWluZXIgc3R5bGVzXHJcbiAgICAgKiBAdHlwZSB7b2JqZWN0fVxyXG4gICAgICovXHJcbiAgICBBcHBsaWNhdGlvbkNvbnRhaW5lclN0eWxlOiB7XHJcbiAgICAgICAgJ3otaW5kZXgnOiA5OTk5OTksXHJcbiAgICAgICAgJ3Bvc2l0aW9uJzogJ2ZpeGVkJyxcclxuICAgICAgICAndG9wJzogMCxcclxuICAgICAgICAnbGVmdCc6IDAsXHJcbiAgICAgICAgJ3VzZXItc2VsZWN0JzogJ25vbmUnLFxyXG4gICAgICAgICdmb250LXNpemUnOiAnMC44NWVtJ1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIGFwcGxpY2F0aW9uIG1lbnUtYmFyIHN0eWxlc1xyXG4gICAgICogQHR5cGUge29iamVjdH1cclxuICAgICAqL1xyXG4gICAgQXBwbGljYXRpb25NZW51U3R5bGU6IHtcclxuICAgICAgICAncG9zaXRpb24nOiAnZml4ZWQnLFxyXG4gICAgICAgICdkaXNwbGF5JzogJ2ZsZXgnLFxyXG4gICAgICAgICdmbGV4LWRpcmVjdGlvbic6ICdyb3cnLFxyXG4gICAgICAgICdjb2xvcic6ICdibGFjaycsXHJcbiAgICAgICAgJ2JhY2tncm91bmRDb2xvcic6ICdyZ2IoMjMwLDIzMCwyMzApJyxcclxuICAgICAgICAnd2lkdGgnOiAnMTAwdncnLFxyXG4gICAgICAgICdib3JkZXInOiAnbm9uZScsXHJcbiAgICAgICAgJ2JveC1zaGFkb3cnOiAndW5zZXQnLFxyXG4gICAgICAgICdvdXRsaW5lJzogJ25vbmUnXHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYXBwbGljYXRpb24gbWVudSBlbnRyeSBzdHlsZXNcclxuICAgICAqIEB0eXBlIHtvYmplY3R9XHJcbiAgICAgKi9cclxuICAgIEFwcGxpY2F0aW9uTWVudVJvd1N0eWxlOiB7XHJcbiAgICAgICAgJ3BhZGRpbmcnOiAnMC4yNWVtIDAuNWVtJyxcclxuICAgICAgICAnbWFyZ2luJzogMCxcclxuICAgICAgICAnbGluZS1oZWlnaHQnOiAnMWVtJ1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIGxvd2VyLWxldmVsIG1lbnUgd2luZG93IHN0eWxlc1xyXG4gICAgICogQHR5cGUge29iamVjdH1cclxuICAgICAqL1xyXG4gICAgTWVudVN0eWxlOiB7XHJcbiAgICAgICAgJ2ZsZXgtZGlyZWN0aW9uJzogJ2NvbHVtbicsXHJcbiAgICAgICAgJ3Bvc2l0aW9uJzogJ2ZpeGVkJyxcclxuICAgICAgICAndXNlci1zZWxlY3QnOiAnbm9uZScsXHJcbiAgICAgICAgJ2NvbG9yJzogJ2JsYWNrJyxcclxuICAgICAgICAnei1pbmRleCc6IDk5OTk5OSxcclxuICAgICAgICAnYmFja2dyb3VuZENvbG9yJzogJ3doaXRlJyxcclxuICAgICAgICAnYm9yZGVyJzogJzFweCBzb2xpZCByZ2JhKDAsMCwwLDAuNSknLFxyXG4gICAgICAgICdib3hTaGFkb3cnOiAnMXB4IDNweCAzcHggcmdiYSgwLDAsMCwwLjI1KSdcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBsb3dlci1sZXZlbCBtZW51IHJvdyBzdHlsZXNcclxuICAgICAqIEB0eXBlIHtvYmplY3R9XHJcbiAgICAgKi9cclxuICAgIFJvd1N0eWxlOiB7XHJcbiAgICAgICAgJ2Rpc3BsYXknOiAnZmxleCcsXHJcbiAgICAgICAgJ3BhZGRpbmcnOiAnMC4yNWVtIDEuNWVtIDAuMjVlbScsXHJcbiAgICAgICAgJ2xpbmUtaGVpZ2h0JzogJzEuNWVtJ1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIGxvd2VyLWxldmVsIG1lbnUgYWNjZWxlcmF0b3Igc3R5bGVzXHJcbiAgICAgKiBAdHlwZSB7b2JqZWN0fVxyXG4gICAgICovXHJcbiAgICBBY2NlbGVyYXRvclN0eWxlOiB7XHJcbiAgICAgICAgJ29wYWNpdHknOiAwLjVcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBsb3dlci1sZXZlbCBtZW51IHNlcGFyYXRvciBzdHlsZXNcclxuICAgICAqIEB0eXBlIHtvYmplY3R9XHJcbiAgICAgKi9cclxuICAgIFNlcGFyYXRvclN0eWxlOiB7XHJcbiAgICAgICAgJ2JvcmRlci1ib3R0b20nOiAnMXB4IHNvbGlkIHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgJ21hcmdpbic6ICcwLjVlbSAwJ1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIGFjY2VsZXJhdG9yIGtleSBzdHlsZXNcclxuICAgICAqIE5PVEU6IGFjY2VsZXJhdG9yIGtleXMgbXVzdCB1c2UgdGV4dC1kZWNvcmF0aW9uIGFzIGl0cyB1c2VkIGFzIGEgdG9nZ2xlIGluIHRoZSBjb2RlXHJcbiAgICAgKiBAdHlwZSB7b2JqZWN0fVxyXG4gICAgICovXHJcbiAgICBBY2NlbGVyYXRvcktleVN0eWxlOiB7XHJcbiAgICAgICAgJ3RleHQtZGVjb3JhdGlvbic6ICd1bmRlcmxpbmUnLFxyXG4gICAgICAgICd0ZXh0LWRlY29yYXRpb24tY29sb3InOiAncmdiYSgwLDAsMCwwLjUpJ1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIG1pbmltdW0gY29sdW1uIHdpZHRoIGluIHBpeGVscyBmb3IgY2hlY2tlZCBhbmQgYXJyb3cgaW4gdGhlIGxvd2VyLWxldmVsIG1lbnVzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBNaW5pbXVtQ29sdW1uV2lkdGg6IDIwLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ1NTIGJhY2tncm91bmQgc3R5bGUgZm9yIHNlbGVjdGVkIE1lbnVJdGVtc1xyXG4gICAgICogTk9URTogdW5zZWxlY3RlZCBoYXZlICd0cmFuc3BhcmVudCcgc3R5bGVcclxuICAgICAqIEB0eXBlIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIFNlbGVjdGVkQmFja2dyb3VuZFN0eWxlOiAncmdiYSgwLDAsMCwwLjEpJyxcclxuXHJcbiAgICAvKipcclxuICAgICAqIG51bWJlciBvZiBwaXhlbHMgdG8gb3ZlcmxhcCBjaGlsZCBtZW51c1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgT3ZlcmxhcDogNSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIHRpbWUgaW4gbWlsbGlzZWNvbmRzIHRvIHdhaXQgZm9yIHN1Ym1lbnUgdG8gb3BlbiB3aGVuIG1vdXNlIGhvdmVyc1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIFN1Ym1lbnVPcGVuRGVsYXk6IDUwMFxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbmZpZyJdfQ==