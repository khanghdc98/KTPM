import { TextField } from "@mui/material";
import { useCallback } from "react";
import { appActions, useAppDispatch, useAppSelector } from "../../AppStore";

const TextInput = () => {
    const dispatch = useAppDispatch();
    const userInputs = useAppSelector((state) => state.app.userInputs);
    const setText = useCallback(
        (text: string) => {
            dispatch(appActions.setUserInputs({ ...userInputs, text }));
        },
        [dispatch, userInputs],
    );

    return (
        <TextField
            label="Video Description"
            variant="outlined"
            fullWidth
            multiline
            value={userInputs.text}
            onChange={(e) => setText(e.target.value)}
            rows={15}
        />
    );
};

export default TextInput;
