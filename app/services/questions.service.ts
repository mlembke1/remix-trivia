import type { InitialQuestion } from "~/types/InitialQuestion";
import type { IQuestion } from "../types/IQuestion";

import { db } from "~/entry.server";
import apiUrl from "~/env/apiUrl";


export const getInitialQuestions = async (): Promise<{results: InitialQuestion[]}> => {
  const data = await fetch(apiUrl);
  return data.json();
}

export const getQuestions = async (): Promise<IQuestion[]> => {
    return db.question.findMany();
}

export const getQuestionById = async(Id: number): Promise<{question: IQuestion, index: number}> => {
    const allQuestions = await getQuestions();
    const question = await db.question.findUnique({ where: { Id: Id } });
    // Here we can determine which question we're on. Calling this index.
    let index: number = 0;
    allQuestions.map((x: IQuestion, i: number) => {
     if (x.Id == question.Id) index = (i + 1);   
    })
    return {question, index};
}

export const postQuestions = async (r: { results: InitialQuestion[]}): Promise<any> => {
    return Promise.all(
        r.results.map((question: InitialQuestion) => {
            const mappedQ = {
                QuestionText: question.question,
                CorrectAnswer: question.correct_answer,
                Category: question.category
            }
            return db.question.create({ data: mappedQ });
        })
    )
}

export const setQuestions = async (): Promise<any> => {
    const questions: IQuestion[] = await getQuestions(); // Check db
    if (!(questions) || !(questions).length) {
        const initialQuestions = await getInitialQuestions(); // get from API
        return await postQuestions(initialQuestions);
    } else {
        return questions;
    }
}


export const clearQuestions = async (): Promise<any> => {
    return db.question.deleteMany({});
}