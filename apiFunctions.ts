import dayjs from "dayjs";
import { sendEmail } from "./mailer.ts";

const tokenUrl = "https://api.airbank.cz/sandbox/oauth2/token";
const accountUrl = "https://api.airbank.cz/sandbox/accountInfo/v3/my/accounts";
const paymentsUrl = "https://api.airbank.cz/sandbox/paymentInit/v3/my/payments";

type TokenResponse = {
  refresh_token: string;
  token_type: string;
  access_token: string;
  expires_in: number;
};
type AccessInfo = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};
type Account = {
  id: number;
  identification: {
    iban: string;
    other: string;
  };
  currency: string;
  servicer: { bankCode: string; countryCode: string; bic: string };
  nameI18N: string;
  productI18N: string;
  ownersNames: string[];
};
type AccountInfo = {
  accounts: Account[];
};

export async function getAccess(
  authCode: string,
  redirectUri: string
): Promise<AccessInfo> {
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: authCode,
      redirect_uri: redirectUri,
      client_id: process.env.CLIENT_ID!,
      client_secret: process.env.CLIENT_SECRET!,
    }),
  });

  const data = (await response.json()) as TokenResponse;
  const {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: expiresIn,
  } = {
    ...data,
  };
  return { accessToken, refreshToken, expiresIn };
}

export async function getRefreshedAccess(
  refreshToken: string
): Promise<AccessInfo> {
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.CLIENT_ID!,
      client_secret: process.env.CLIENT_SECRET!,
    }),
  });

  const data = (await response.json()) as TokenResponse;
  if (!response.ok)
    sendEmail(`Error refreshing access token:\n \`${JSON.stringify(data)}\``);
  const {
    access_token: accessToken,
    expires_in: expiresIn,
    refresh_token: newRefreshToken,
  } = {
    ...data,
  };
  return { accessToken, expiresIn, refreshToken: newRefreshToken };
}

export async function getAccountInfo(
  accessToken: string
): Promise<AccountInfo> {
  const response = await fetch(accountUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = (await response.json()) as AccountInfo;
  return data;
}

export async function sendPaymentOrder({
  accessToken,
  fromIBAN,
  toIBAN,
  value,
  executionDate,
}: {
  accessToken: string;
  fromIBAN: string;
  toIBAN: string;
  value: number;
  executionDate: dayjs.Dayjs;
}) {
  const response = await fetch(paymentsUrl, {
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      authorization: `Bearer ${accessToken}`,
    },
    method: "POST",
    body: JSON.stringify({
      paymentIdentification: {
        instructionIdentification: `API${dayjs().format()}`,
      },
      paymentTypeInformation: {
        instructionPriority: "NORM",
      },
      amount: {
        instructedAmount: {
          value,
          currency: "CZK",
        },
      },
      requestedExecutionDate: executionDate.format("YYYY-MM-DD"),
      debtorAccount: {
        identification: {
          iban: fromIBAN.split(" ").join(""),
        },
      },
      creditorAccount: {
        identification: {
          iban: toIBAN.split(" ").join(""),
        },
        currency: "CZK",
      },
      // remittanceInformation: {
      //   unstructured: "VS/7418529630/SS/1234567890",
      //   structured: {
      //     creditorReferenceInformation: {
      //       reference: ["VS:5010000000", "KS:9", "SS:1005"],
      //     },
      //   },
      // },
      // redirectUrl: "https://jump.to.anywhere/authorized",
    }),
  });

  const resJson = await response.json();
  if (!response.ok)
    sendEmail(`Error sending payment order:\n \`${JSON.stringify(resJson)}\``);
}
