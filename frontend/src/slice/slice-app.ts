import { createSlice } from '@reduxjs/toolkit'

type AppState = {
  userInputs: {
    video: File | null
    text: string
  }
}

const initialState: AppState = {
  userInputs: {
    video: null,
    text: ""
  }

}

export const sliceApp = createSlice({
  name: 'sliceApp',
  initialState,
  reducers: {
    setUserInputs: (state, action) => {
      state.userInputs = action.payload
    }
  },
})
