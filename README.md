# Magma Dashboard
Personal dashboard inspired by flame, highly customizable, lightweight and responsive.

![Magma dashboard preview](https://i.imgur.com/XaAvyRC.png)

## Features
* Lightweight, fast, run with Deno
* Run as static Html website
* Support multiple language
* Highly customizable, you can replace everything you want
* Addons support (WIP)

## How to use
* Download our [docker-compose.yml](./docker-compose.yml) file
* Start with `docker-compose up -d`
* Go to `public/config.json` to config your dashboard
* Go to `public/data.json` to edit your bookmarks
* See your dashboard at [localhost:7001](http://localhost:7001)

## Customization
Go to our [website](https://magma.help14.com) and read the document to  learn more.

Long story short: [private folder](./src/private) is the original source code of the dashboard, anything in [public folder](./src/public) will replace the file with the same path in [private/themes/{selected theme}](./src/private/themes). 

## Contribution
Contributions welcome and needed!
