import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAnswersByUserId } from "~/services/answers.service";
import type { ILoggedAnswer } from "~/types/LoggedAnswer";
import sanitizeHtml from 'sanitize-html';


// import jsdom from 'jsdom';

export const loader: LoaderFunction = async (o) => {
    console.log(o.params)
    if (Number(o.params.resultId)) {
        // Get user's Logged answers along with the questions
        const answers =  await getAnswersByUserId(Number(o.params.resultId));
        console.log(answers)
        return answers;
    }
    return null
};

export let action: ActionFunction = async ({ request }) => {
    
}

function Result() {
    const data: ILoggedAnswer[] = useLoaderData();
    const sanitize = (d: any):string => sanitizeHtml(d) || '';
    const correct = (x: (string | undefined), y: string): boolean => JSON.parse(x.toLowerCase()) == JSON.parse(y.toLowerCase());

    return data ? (
        <div>
            {
                data &&
                data.map((la: ILoggedAnswer, i: number) => (
                    <div key={i}>
                        <h3 dangerouslySetInnerHTML={{ __html:sanitize(la.Question?.QuestionText)}}></h3>
                        <h4>Your Answer: { la.Answer.toUpperCase() }</h4>
                        <h4>Correction Answer: { la.Question?.CorrectAnswer.toUpperCase() }</h4>
                        <h4>{ correct(la.Question?.CorrectAnswer, la.Answer) ? 'Correct!' : 'Incorrect' }</h4>
                    </div>
                ))
            }
        </div>

    ) : null
}
export default Result;