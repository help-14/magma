# Customize CSS

## Changing background, color pallete

In order to change those default values, edit `/data/css/core.css`.

```
:root {
  --bgColor: #2d3436;
  --bgImage: url("https://images.wallpaperscraft.com/image/single/leaf_plant_green_136967_2560x1440.jpg");
  --accentColor: #ffc107;
  --foreground: #ffffff;
}
```

| Key           | Required | Meaning                                                                                          |
| ------------- | -------- | ------------------------------------------------------------------------------------------------ |
| --bgColor     | Yes      | Background color of `<body>`, also use as overlay color of background image.                     |
| --bgImage     | Yes      | An image place on top of `<body>` background color, with opacite 60%, scale 1.1, margin-top: -5% |
| --accentColor | Yes      | Accent color use in highlight place like weather icon, group title, ...                          |
| --foreground  | Yes      | Default text color.                                                                              |

## Custom CSS styles

If you want to add custom CSS style to element, please don't put it in `core.css`, use `custom.css` instead.

`custom.css` will be loaded at the last position, so it will override other CSS styles.