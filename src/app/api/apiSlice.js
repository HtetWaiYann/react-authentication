import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logOut, setCredentials } from "../../features/auth/authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:3500",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWitReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.originalStatus === 403) {
    console.log("Token Expired");
    console.log("Sending Refresh Token");
    // send refresh token to get new access token
    const refeshResult = await baseQuery("/refresh", api, extraOptions);
    console.log(refeshResult);

    if (refeshResult?.data) {
      const user = api.getState().auth.user;
      // set new token
      api.dispatch(setCredentials({ ...refeshResult.data, user }));
      // retry original request
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logOut());
    }
  }
  return result;
};


export const apiSlice = createApi({
  baseQuery: baseQueryWitReauth,
  endpoints: builder => ({})
});