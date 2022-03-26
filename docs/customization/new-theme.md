# Create new theme

## Preparing

There are two choice here:
- If you are a developer, you know what you are doing then considering public your theme to Magma repo for everybody to use. Fork magma repo, create a folder in `/private/themes/` and add your theme there. Test your theme carefully before create a `Pull Request`.
- You are an user with some coding knowleague or you want to test your theme before submit it, then create `index.html` in `/public` and start from there.

## Your first theme

Your `index.html` will be almost exactly what you want your dashboard look like, so design your layout first.

In current version your data and config will be injected on page loaded using Javascript, so you need to custom it too. 

In future release there will be a markup like `{{bookmarks}}` and your data will be injected by compile task into there. 