/*
Simple download plugin for jQuery Mobile
Loïc Fontaine - MIT Licensed
*/

define([
    'jquery',
    'lib/jquery.mobile'    
], function ($, $mobile) {
    'use strict';
    
    $.extend($mobile, {
        download: function (url, method, data) {
            var formHeader = '<form method="' + method + '" ' +
                    'action="' + url + '" ' +
                    'data-ajax="false">',
                formFooter = '</form>',
                form = formHeader;
                
            for (var paramName in data) {
                if (!data.hasOwnProperty(paramName)) {
                    continue;   
                }
                
                form += '<input name="' + paramName + '" type="hidden" ' +
                    'value="' + data[paramName] + '" />';
            }
            
            form += formFooter;
            
            $(form).appendTo('body')
                   .submit()
                   .remove();
        }
    });
});
