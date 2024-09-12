import { printAccess } from "./accessToken.ts";
import { config } from "dotenv";
import {
  getAccountInfo,
  getRefreshedAccess,
  sendPaymentOrder,
} from "./apiFunctions.ts";
import dayjs from "dayjs";

config();
const { accessToken, refreshToken } = await getRefreshedAccess(
  process.env.REFRESH_TOKEN!
);
console.log("new refresh", refreshToken);

const { accounts } = await getAccountInfo(accessToken);

sendPaymentOrder({
  accessToken,
  value: 420,
  executionDate: dayjs(),
  fromIBAN: accounts[0].identification.iban.split(" ").join(""),
  toIBAN: accounts[1].identification.iban.split(" ").join(""),
});
