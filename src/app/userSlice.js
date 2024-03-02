import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    email: ""
}

export const userSlice = createSlice({
    name:"user",
    initialState,
    reducers: {
        setDetails: (state, action) => {
            state.email = action.payload.email;
        }
    }
})

export const {setDetails} = userSlice.actions;

export default userSlice.reducer;