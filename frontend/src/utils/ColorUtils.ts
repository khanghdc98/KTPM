import chroma from "chroma-js";

export const getUniqueColors = (tokens: string[]) => {
    const numColors = tokens.length;
    const colors = chroma.scale("Spectral").colors(numColors);
    return tokens.reduce((acc, token, index) => {
        const rgbColor = chroma(colors[index]).rgb();
        acc[token] = `rgba(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]}, ...)`;
        return acc;
    }, {} as Record<string, string>);
};