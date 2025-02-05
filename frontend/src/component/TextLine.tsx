import { Box } from "@mui/material";
import { getUniqueColors } from "../utils/ColorUtils";
import { JSX } from "react";

export const TextLine: React.FC<{
    sentence: string;
    tokens: string[];
    colorMap?: Record<string, string>;
    chosenToken?: string;
    setChosenToken?: React.Dispatch<React.SetStateAction<string>>;
}> = ({ sentence, tokens, colorMap, chosenToken, setChosenToken }) => {
    colorMap = colorMap ? colorMap : getUniqueColors([...new Set(tokens)]);

    const words = sentence.split(" ");
    const highlightedWords: JSX.Element[] = [];
    let i = 0;

    while (i < words.length) {
        let matchedToken = "";
        let matchedLength = 0;

        // Try to match multi-word tokens from longest to shortest
        for (const token of tokens) {
            const tokenWords = token.split(" ");
            const tokenLength = tokenWords.length;
            const candidatePhrase = words.slice(i, i + tokenLength).join(" ");

            if (candidatePhrase === token) {
                matchedToken = token;
                matchedLength = tokenLength;
                break; // Stop on first match
            }
        }

        if (matchedToken) {
            // Apply background color based on selection
            const bgColor = chosenToken === matchedToken
                ? colorMap[matchedToken].replace("...", "1")
                : colorMap[matchedToken]?.replace("...", "0.5") || "transparent";

            highlightedWords.push(
                <span
                    key={i}
                    style={{
                        backgroundColor: bgColor,
                        cursor: "pointer",
                    }}
                    onClick={() => setChosenToken && setChosenToken(matchedToken)}
                >
                    {matchedToken}
                </span>
            );
            highlightedWords.push(<span key={`space-${i}`}> </span>);
            i += matchedLength;
        } else {
            highlightedWords.push(
                <span key={i}>{words[i]}</span>
            );
            highlightedWords.push(<span key={`space-${i}`}> </span>);
            i++;
        }
    }

    return <Box>{highlightedWords}</Box>;
};
