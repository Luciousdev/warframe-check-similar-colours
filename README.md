# Warframe Closest Colour Calculator

A lot of inspiration for this came from [https://gluckogon.github.io/warframe/wf_colors/index.html](https://gluckogon.github.io/warframe/wf_colors/index.html). Go check it out, it is an amazing project!
This project was made in a couple hours, so might get some fixes and changes soon.

## Formula used

Basically euclidean distance.

d = √(r1​−r2​)^2+(g1​−g2​)^2+(b1​−b2​)^2

in the code the following function handles the calculation:

```javascript
function colorDistance(c1, c2) {
    return Math.sqrt(
        Math.pow(c1.r - c2.r, 2) +
        Math.pow(c1.g - c2.g, 2) +
        Math.pow(c1.b - c2.b, 2)
    );
}
```

## Search and filters

1. You can search by typing in a hex code yourself, at the moment only hex codes are supported.
2. The 2 filters at the moment are to exclude same palette and limit to one palette. This means the following.
    - "Exclude same palette": When you click or search for an icon this will prevent the search from showing colours that are from the palette from an selected colour.
    - "Limit to one per palette": When searching it will only show 1 result per palette, resulting in more palette variaty.
3. It is possible as well to click on the colours in the colour palettes.


### Outro

Made with love by Luciousdev ❤️