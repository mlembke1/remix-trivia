import { createCookie } from "@remix-run/node";
import { getSession, commitSession } from "../services/cookie.service";
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()


export const postUser = async (hash: string): Promise<any> => {
    const user = { hash }
    return db.user.create({ data: user });
}

export const setUser = async (request: any): Promise<any> => {
    const session = await getSession(request.headers.get("Cookie"));
    const userHash: string = session.get("user-hash");

    if (!userHash) {
        const newUserhash = String(Date.now());
        // Create new cookie string
        session.set("user-hash", newUserhash);
        const cookie = await commitSession(session);

        postUser(newUserhash);
        return cookie;
    } else {
        return new Promise((res: any) => false);
    }
}


