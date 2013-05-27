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
                
                this.notificationManager = {
                    push: function () {}
                };
                
                this.checkForCacheUpdate = function () {
                    return $.Deferred().promise();
                };
            };
        });
        
        requireConfig.deps = null; // We don't need the deps of the parent context
        requireConfig.context = 'main-view-test-context';
        requireConfig.map = {
            '*': map
        };
        
        return require.config(requireConfig);
    }
    
    describe('MainView', function () {
        var testContext = createTestContext(),
            app, mainView;
        
        before(function (done) {
            testContext([ 'app' ], function (App) {
                app = new App();
                
                testContext([ 'jquery.mobile' ], function () {
                    done();
                });
            });
        });
        
        after(function () {
            mainView.remove();
        });
        
        describe('social widgets', function () {
            
            beforeEach(function (done) {
                testContext([ 'views/main' ], function (MainView) {
                    mainView = new MainView({ app: app });
                    done();
                });
            });

            afterEach(function () {
                mainView.remove();
            });

            it('should be visible if the screen size is normal', function (done) {
                app.environment.set('screenSize', 'normal');
                mainView.render().$el.appendTo('body').page();
                
                setTimeout(function () {
                    expect(mainView.$el.find('.social-widgets').length).to.not.be.equal(0);
                    done();
                }, 50);
            });

            it('should not be visible if the screen size is small', function (done) {
                app.environment.set('screenSize', 'small');
                mainView.render().$el.appendTo('body').page();
                
                setTimeout(function () {
                    expect(mainView.$el.find('.social-widgets').length).to.be.equal(0);
                    done();
                }, 50);
            });
            
        });
        
    });
});
