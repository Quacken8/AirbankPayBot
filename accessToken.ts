import open from "open";
import express from "express";
import { yeet } from "@typek/typek";
import { getAccess } from "./apiFunctions.ts";
import { config } from "dotenv";

const redirectUri = "http://localhost:3000/callback";
const authUrl = new URL(
  `http://developers.airbank.cz/sandbox/login?redirectUri=${redirectUri}`
);
export function printAccess() {
  config();
  const randomState = crypto
    .getRandomValues(new Uint8Array(16))
    .reduce((acc, curr) => acc + curr.toString(16).padStart(2, "0"), "");
  authUrl.searchParams.append("state", randomState);
  open(authUrl.toString());

  const app = express();

  app.get("/callback", async (req, res) => {
    const state = req.query.state as string;
    if (state !== randomState) yeet("Recieved wrong state, aborting!");
    const authCode = req.query.code as string;
    res.send("Authorization code received. You can close this window.");
    const { accessToken, refreshToken } = await getAccess(
      authCode,
      redirectUri
    );

    console.log(
      `Access Token:  ${accessToken}\nRefresh Token: ${refreshToken}`
    );
    return 1;
  });

  app.listen(3000, () => {
    console.log("Server is listening on port 3000");
  });
}
