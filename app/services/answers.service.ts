import type { LoggedAnswer, User } from "@prisma/client";
import { db } from "~/entry.server";
import { getUserByHash } from "./user.service";

export const postAnswer = async (answerObject: { QuestionId: number, UserHash: string, Answer: string }): Promise<any> => {
    const userId: number = (await getUserByHash(answerObject.UserHash) as User).Id;
    return db.loggedAnswer.create({
        data: {
            QuestionId: answerObject.QuestionId,
            UserId: userId,
            Answer: JSON.parse(answerObject.Answer)
        }
    })
}

export const getAnswerByUserAndQuestion = async (userHash: string, questionId: number): Promise<any> => {
    const userId: number = (await getUserByHash(userHash) as User).Id
    return db.loggedAnswer.findUnique({
        where: {
            QuestionId_UserId: {
                UserId: userId,
                QuestionId: questionId
            }
        }
    })
}

export const canContinue = async(userHash: string, questionId: number): Promise<boolean> => {
    const userId: number = (await getUserByHash(userHash) as User).Id
    const answers = await db.loggedAnswer.findMany({
        where: { UserId: userId }
    });
    return answers.length < 10;
}

export const getAnswersByUserId = async (userId: number): Promise<LoggedAnswer[]> => {
    return db.loggedAnswer.findMany({
        where: { UserId: userId },
        include: { Question: true }
    })
}