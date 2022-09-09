export type Question = {
    readonly category: string,
    readonly correct_answer: string,
    readonly difficulty: string,
    readonly incorrect_answers: string[],
    readonly question: string,
    readonly type: string
}