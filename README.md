CocoonJS Plugin for Construct 2
==================
This plugin can be used in Construct 2 to manage the CocoonJS JavaScript APIs. The currently supported version of Construct 2 is stable (r184).

## Demo Example [capx]
This plugin comes with a .capx (a valid Construct 2 project) as a reference to know how to use it, you can download it from [here](capx/CocoonJS Plugin Demo.capx?raw=true).

Here are some screenshots of the .capx:

![Demo](http://support.ludei.com/hc/en-us/article_attachments/200643378/Screen_Shot_2014-04-14_at_12.58.54.png)
![Demo](http://oi61.tinypic.com/2hz32x0.jpg)
![Demo](http://support.ludei.com/hc/en-us/article_attachments/200694983/social_login_leaderboard.png)
![Demo](http://oi59.tinypic.com/28asrih.jpg)
![Demo](http://oi57.tinypic.com/xnsyld.jpg)
![Demo](http://oi60.tinypic.com/169knc2.jpg)
![Demo](http://oi58.tinypic.com/qnr56s.jpg)

## Configuration
The plugin can be configured by selecting the object "cocoonjsads" from the "Object types" list inside Construct 2.

![Configuration panel](http://oi60.tinypic.com/smu6vd.jpg)
## Installation
### Manual Install
* *Close Construct 2*.
* Checkout the 'master' branch from this repository. 
* Copy the file src/cocoonjs_prelude.js into *_CONSTRUCT_2_INSTALLATION_FOLDER_*\exporters\html5\, make sure to replace the file when you are asked.
* Copy the contensts of the folder /src/plugin/cocoonjsads into *_CONSTRUCT_2_INSTALLATION_FOLDER_*\exporters\html5\plugins\cocoonjsads.
* That's all!

### Automatic installation
This plugin already comes bundled with Construct 2, however the update rate of Construct 2 may differ from the latest version of this plugin, we encourage you to manually update the plugin everytime a new version of the plugin comes out.
## Need help?
Visit [our help center](https://support.ludei.com).
## Changelog

### Oct 16, 2014
* Added Logout feature for the Social Interface (Request Logout and  onSocialServiceLogoutSuccess / onSocialServiceLogoutFailed). 

### Oct 14, 2014
* Added support for Facebook. 
* Fixed error in Game Center Leaderboards. 
* Fixed CSS error in Leaderboards/Achievements templates. 

### Sep 16, 2014
* Ads demo added to the .capx

### May 15, 2014
* Fixed "RefreshFullScreen" typo.
* Fixed error that causes an alert in strict mode.
* Added 2 missing methods of the ads service (onBannerReady/onFullScreenReady).
* Updated .capx with ads section.

### April 16, 2014
* Fixed bug that shows a banner when should not.
* Updated README.md
* Updated folder structure.

### April 14, 2014
* Added support for Google Play Games / Game Center leaderboards & Achievements.
* Fixed bug that prevents the user to finish a in-app purchase.
* Updated documentation.
