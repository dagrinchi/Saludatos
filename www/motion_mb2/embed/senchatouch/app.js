/*!
 * Sencha Animator 2013, all rights reserved
 */
/*
    Sample Demo App - Sencha 2013

    Showcasing using the AN.Animation Sencha Touch component 
    to load an Animator project into a Sencha Touch project.

    The AN.Animation component has an xtype of "animatoranimation"
    and requires the "animationFolderUrl" property to be set, and
    it must point to a folder on the same server due to browser
    security restrictions. AN.Animation inherits from Ext.Component.

    There are also other configuration options that can be set.
    Please see the AN.Animation.js source file for a explanation
    of the options.
*/

Ext.application({
    name: 'Animator Sample Embed',

    launch: function() {

        Ext.Viewport.add({
            xtype: 'tabpanel',
            fullscreen: true,
            tabBarPosition: 'bottom',

            items: [
                {
                    title: 'Home',
                    iconCls: 'home',
                    cls: 'home',
                    html: '<p style="font-size:120%; font-weight: bold; margin-bottom:10px; text-align:center;">Sample App </p> <p style="text-align:center;">See JS code for different sample implementations. Click on <strong style="font-weight: bold;">Animation icon below</strong> in the bottom toolbar to see sample integration. Also note that there are several config options when including an animation this way.</p>'
                },
                {
                    //sample usage of an AN.Animation component
                    xtype: 'animatoranimation',
                    animationFolderUrl: "../../",

                    //tab options
                    title: "Animation",
                    iconCls: 'star'
                }
            ]
        });
    }
});
