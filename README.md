# Magma Dashboard
Personal dashboard inspired by flame, highly customizable, lightweight and responsive.

## Feature
* Light weight, fast, run with Deno
* Run as static Html website
* Support multiple language
* Highly customizable, you can replace everything you want
* Addons support (WIP)

## How to use
* Download our [docker-compose.yml](./tree/master/docker-compose.yml) file
* Start with `docker-compose up -d`
* Go to `public/config.json` to config your dashboard
* Go to `public/data.json` to edit your bookmarks
* Restart server: `docker-compose down && docker-compose up -d`
* See your dashboard at [localhost:7000](http://localhost:7000)

## Customization
Go to our [website](https://magma.help14.com) and read the document to  learn more.

Long story short: [private folder](./tree/master/src/private) is the original source code of the dashboard, anything in [public folder](./tree/master/src/public) will replace the file with the same path in [private folder](./tree/master/src/private). 

## Contribution
Contributions welcome and needed!