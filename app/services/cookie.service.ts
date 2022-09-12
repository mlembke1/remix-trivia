import { createCookieSessionStorage } from "@remix-run/node";

export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "user-hash",
    },
  });

  export const getUserHash = async (requestObject: any): Promise<String> => {
    const session = await getSession(requestObject.request.headers.get("Cookie"));
    return session.get("user-hash");
  }
