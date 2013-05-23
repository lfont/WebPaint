define([
    'require',
    'backbone',
    'underscore',
    'models/environment'
], function (require, Backbone, _, EnvironmentModel) {

    function createTestContext () {
        var require = window.require,
            requireConfig = _.extend({}, require.s.contexts._.config),
            map = {
                'drawer-manager': 'drawer-manager-stub',
                'drawing-client': 'drawing-client-stub'
            };
        
        define(map['drawer-manager'], function () {
            return function DrawerManagerStub () {
                _.extend(this, Backbone.Events);
            };
        });
        
        define(map['drawing-client'], function () {
            return function DrawingClientStub () {
                _.extend(this, Backbone.Events);
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
            environment, mainView;
        
        before(function (done) {
            environment = new EnvironmentModel();
            environment.fetch();
            
            testContext([ 'jquery.mobile' ], function () {
                done();
            });
        });
        
        after(function () {
            mainView.remove();
        });
        
        describe('social widgets', function () {
            
            beforeEach(function (done) {
                testContext(['views/main'], function (MainView) {
                    mainView = new MainView({
                        environment: environment
                    });
                    done();
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
