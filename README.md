# Warframe Closest Colour Calculator

A lot of inspiration for this came from [https://gluckogon.github.io/warframe/wf_colors/index.html](https://gluckogon.github.io/warframe/wf_colors/index.html). Go check it out, it is an amazing project!
This project was made in a couple hours, so might get some fixes and changes soon.

### Why?

Personally I have experiences multiple times that I wanted a colour for a fashion but that I don't have a certain palette. Searching which colour from a palette I do have is quite a hassle. This makes it really easy to find comparable colours.

## How to run locally

Due to how most browsers work with the module import in js, if you run it with file:// it will not work due to CORS. If you have python installed run the following command to spin up a small live server.

```bash
python3 -m http.server
```

You should be able to then access the by visiting "http://[::1]:8000/".

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

## Todo List

- [x] Add the capability to only search between palettes you own. (and making it remember between sessions.)

### Outro

Made with love by Luciousdev ❤️