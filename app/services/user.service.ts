import { User } from "@prisma/client";
import { db } from "~/entry.server";
import { getSession, commitSession } from "../services/cookie.service";


export const postUser = async (hash: string): Promise<any> => {
    const user = { hash }
    return db.user.create({ data: user });
}

export const setUser = async (request: any): Promise<any> => {
    const session = await getSession(request.headers.get("Cookie"));
    const userHash: string = session.get("user-hash");

    // If we haven't seen this user (instance) before, let's store them.
    if (!userHash) {
        const newUserhash = String(Date.now());
        // Create new cookie string
        session.set("user-hash", newUserhash);
        const cookie = await commitSession(session);

        await postUser(newUserhash);
        return cookie;
    } else {
        return false;
    }
}

export const getUserByHash = async (hash: string): Promise<User> => {
    return db.user.findUnique({ where: { hash: hash } })
}



