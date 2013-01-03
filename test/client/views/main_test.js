define([
    'jquery',
    'views/main',
    'models/environment',
    'collections/colors',
    'views/tools'
], function ($, MainView, EnvironmentModel, ColorCollection) {

    describe('MainView', function () {

        describe('showTools()', function () {
            var environment, main;

            beforeEach(function () {
                environment = new EnvironmentModel({
                    colors: new ColorCollection()
                });

                environment.fetch();

                main = new MainView({
                    el: $('<div></div>').appendTo('body'),
                    environment: environment
                });

                main.render().pageshow();
            });

            afterEach(function () {
                main.$el.remove();
            });

            it('should show a dialog if the screen size is small', function (done) {
                environment.set('screenSize', 'small');

                main.$el.on('vclick', '.tools', function () {
                    expect(main.toolsView.isPopup).to.be.false;
                    done();
                });

                main.$el.find('.tools').click();
            });

            it('should show a popup if the screen size is not small', function (done) {
                environment.set('screenSize', 'normal');

                main.$el.on('vclick', '.tools', function () {
                    expect(main.toolsView.isPopup).to.be.true;
                    done();
                });

                main.$el.find('.tools').click();
            });
        });
    });
});
