import { db } from "~/entry.server";
import apiUrl from "~/env/apiUrl";
import type { Question } from "../types/Question";


export const getInitialQuestions = async (): Promise<{results: Question[]}> => {
  const data = await fetch(apiUrl);
  return data.json();
}

export const getQuestions = async (): Promise<{results: Question[]}> => {
    return db.question.findMany();
  }

export const postQuestions = async (r: { results: Question[]}): Promise<any> => {
    return Promise.all(
        r.results.map((question: Question) => {
            const mappedQ = {
                QuestionText: question.question,
                CorrectAnswer: question.correct_answer
            }
            return db.question.create({ data: mappedQ });
        })
    )
}

export const setQuestions = async (): Promise<any> => {
    const questions = await getQuestions(); // Check db
    if (!(questions).results?.length) {
        const initialQuestions = await getInitialQuestions(); // get from API
        return await postQuestions(initialQuestions);
    } else {
        return questions
    }
}
