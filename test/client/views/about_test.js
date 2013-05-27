define([
    'require',
    'jquery',
    'backbone',
    'underscore',
    'models/environment'
], function (require, $, Backbone, _, EnvironmentModel) {

    function createTestContext () {
        var require = window.require,
            requireConfig = _.extend({}, require.s.contexts._.config),
            map = {
                'app': 'app-stub'
            };
        
        define(map.app, function () {
            return function AppStub () {
                _.extend(this, Backbone.Events);
                
                this.environment = new EnvironmentModel();
                this.environment.fetch();
            };
        });
        
        requireConfig.deps = null; // We don't need the deps of the parent context
        requireConfig.context = 'about-view-test-context';
        requireConfig.map = {
            '*': map
        };
        
        return require.config(requireConfig);
    }
    
    describe('AboutView', function () {
        var testContext = createTestContext(),
            app, aboutView;
        
        before(function (done) {
            testContext([ 'app' ], function (App) {
                app = new App();
                
                testContext([ 'jquery.mobile' ], function () {
                    done();
                });
            });
        });
        
        after(function () {
            aboutView.remove();
        });

        describe('social widgets', function () {
            
            beforeEach(function (done) {
                testContext([ 'views/about' ], function (AboutView) {
                    aboutView = new AboutView({ app: app });
                    done();
                });
            });

            afterEach(function () {
                aboutView.remove();
            });

            it('should be visible if the screen size is small', function (done) {
                app.environment.set('screenSize', 'small');
                aboutView.render();
                
                setTimeout(function () {
                    expect(aboutView.$el.find('.social-widgets').length).to.not.be.equal(0);
                    done();
                }, 50);
            });

            it('should not be visible if the screen size is normal', function (done) {
                app.environment.set('screenSize', 'normal');
                aboutView.render();
                
                setTimeout(function () {
                    expect(aboutView.$el.find('.social-widgets').length).to.be.equal(0);
                    done();
                }, 50);
            });
        });
    });
});
