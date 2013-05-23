define([
    'require',
    'views/main',
    'models/environment'
], function (require, MainView, EnvironmentModel) {

    describe('MainView', function () {

        describe('social widgets', function () {
            var environment, mainView;

            before(function (done) {
                environment = new EnvironmentModel();
                
                environment.fetch();
                
                require([ 'jquery.mobile' ], function () {
                    done();
                });
            });
            
            beforeEach(function () {
                mainView = new MainView({
                    environment: environment
                });
            });

            afterEach(function () {
                mainView.remove();
            });

            it('should be visible if the screen size is normal', function (done) {
                environment.set('screenSize', 'normal');
                mainView.render().$el.appendTo('body').page();
                
                setTimeout(function () {
                    expect(mainView.$el.find('.social-widgets').length).to.not.be.equal(0);
                    done();
                }, 50);
            });

            it('should not be visible if the screen size is small', function (done) {
                environment.set('screenSize', 'small');
                mainView.render().$el.appendTo('body').page();
                
                setTimeout(function () {
                    expect(mainView.$el.find('.social-widgets').length).to.be.equal(0);
                    done();
                }, 50);
            });
        });
    });
});
