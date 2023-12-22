# MynaUI Favicons

Simple & Quick Favicons Generator.

Give a input SVG File. It gives six favicon files [that covers most needs](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs).

## Usage

Run the script using `npx` and provide your SVG file as input:

```bash
npx @mynaui/favicons [path-to-your-svg-file]
```

or using bun:

```bash
bunx @mynaui/favicons [path-to-your-svg-file]
```

### Options

- `--input` or `-i`: Specify the input SVG file.
- `--quality` or `-q`: Set the quality of the PNG images (default is 85).
- `--name` or `-n`: Set the name for the manifest file (default is 'TODO').

Example:

```bash
npx @mynaui/favicons --input your_icon.svg --quality 90 --name "Your App Name"
```

## Output

The script will generate the following files in the same directory as the input SVG:

- `favicon.ico`
- `favicon-optimized.svg`
- `apple-touch-icon.png`
- `icon-192.png`
- `icon-512.png`
- `manifest.webmanifest`

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

This project is licensed under [MIT](https://github.com/praveenjuge/mynaui-favicons/blob/main/LICENSE).
