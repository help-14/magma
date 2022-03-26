# Customization Overview

Look at the source code, in `/src` folder, you will notice two folder `/private` and `/public`, this is what it mean:
* `/private`: the source code of Magma, contains `/themes` as theme collection, `/languages` as language collection. This folder is not expose in Docker and shouldn't be edit by user.
* `/public`: Expose by Docker and meant to be editted by user in order to customize the dashboard. File in `/public` folder will replace file in `/private/themes/{selected theme}` which had the same path in runtime. For example, if you created `/public/index.html` then the default `index.html` file in `/private/themes/flame/index.html` will be ignored.
* `/temp`: This folder will be created in runtime, will not be exposed, contain final files that beeing serve to user at `http://localhost:7001`

![workflow](https://i.imgur.com/X3vXKtW.png)

When the web server started, it will run a compile task and copying file into /temp folder. In the future update, compile task will also be run if files in `/public` folder changed.

This is how the compile task work:
* Read files in `/private/themes/{selected theme}` -> Inject code -> Minify -> Save to `/temp`
* Read files in `/public` -> Inject code -> Minify -> Save to `/temp` (override if exists)
* Read selected language from `/private/languages/{lang}.json` -> Minify -> Save to `/temp`