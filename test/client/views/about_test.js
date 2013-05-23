define([
    'require',
    'jquery',
    'views/about',
    'models/environment'
], function (require, $, AboutView, EnvironmentModel) {

    describe('AboutView', function () {

        describe('social widgets', function () {
            var environment, aboutView;

            before(function (done) {
                environment = new EnvironmentModel();
                
                environment.fetch();
                
                require([ 'jquery.mobile' ], function () {
                    done();
                });
            });
            
            beforeEach(function () {
                aboutView = new AboutView({
                    el: $('<div></div>').appendTo('body'),
                    environment: environment
                });
            });

            afterEach(function () {
                aboutView.remove();
            });

            it('should be visible if the screen size is small', function (done) {
                environment.set('screenSize', 'small');
                aboutView.render();
                
                setTimeout(function () {
                    expect(aboutView.$el.find('.social-widgets').length).to.not.be.equal(0);
                    done();
                }, 50);
            });

            it('should not be visible if the screen size is normal', function (done) {
                environment.set('screenSize', 'normal');
                aboutView.render();
                
                setTimeout(function () {
                    expect(aboutView.$el.find('.social-widgets').length).to.be.equal(0);
                    done();
                }, 50);
            });
        });
    });
});
