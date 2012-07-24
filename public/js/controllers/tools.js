/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

define([
    "global"
], function (global) {
    var actions,
        drawer,
        model = {},
        translate = function (m) {
            m.title = global.l("%tools.title");
            m.shapeLabel = global.l("%tools.shapeLabel");
            m.widthLabel = global.l("%tools.widthLabel");
            m.colorLabel = global.l("%tools.colorLabel");
            m.pencilLabel = global.l("%tools.pencilLabel");
            m.lineLabel = global.l("%tools.lineLabel");
            m.rectangleLabel = global.l("%tools.rectangleLabel");
            m.circleLabel = global.l("%tools.circleLabel");
        };

    return {
        shape: null,
        width: null,
        components: [
            { name: "colorPicker", alias: "cPicker" }
        ],
        pagebeforecreate: function () {
            translate(model);
            this.render("pagebeforecreate", model);
            this.component("cPicker").change(function () {
                actions.setColor(this.value());
            }).colors(global.getColors().slice(1));
        },
        pagebeforeshow: function (req) {
            actions = req.get("actions");
            drawer = req.get("drawer");
            this.component("cPicker").select(drawer.properties.strokeStyle);
        },
        pageshow: function () {
            this.shape.find("input[value='" + drawer.shape + "']")
                .attr("checked", true).checkboxradio("refresh");
            this.width.val(drawer.properties.lineWidth).slider("refresh");
        },
        pagebeforehide: function () {
            actions.setShape(this.shape.find("input:checked").val());
            actions.setLineWidth(parseInt(this.width.val(), 10));
        }
    };
});
