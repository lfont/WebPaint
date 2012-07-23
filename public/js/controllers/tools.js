define([
    "context"
], function (context) {
    var actions,
        drawer,
        model = {},
        translate = function (m) {
            m.title = context.l("%tools.title");
            m.shapeLabel = context.l("%tools.shapeLabel");
            m.widthLabel = context.l("%tools.widthLabel");
            m.colorLabel = context.l("%tools.colorLabel");
            m.pencilLabel = context.l("%tools.pencilLabel");
            m.lineLabel = context.l("%tools.lineLabel");
            m.rectangleLabel = context.l("%tools.rectangleLabel");
            m.circleLabel = context.l("%tools.circleLabel");
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
            }).colors(context.colors().slice(1));
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
