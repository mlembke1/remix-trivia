import type { Question, User } from "@prisma/client"

// What we receive from our DB
export type ILoggedAnswer = {
    Id: number,
    Question?: Question,
    QuestionId: number,
    User?: User, 
    UserId: number,
    Answer: string
}