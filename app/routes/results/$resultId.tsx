import type { ActionFunction, LoaderFunction} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import { clearAnswers, getAnswersByUserId } from "~/services/answers.service";
import type { ILoggedAnswer } from "~/types/LoggedAnswer";
import sanitizeHtml from 'sanitize-html';
import { clearQuestions } from "~/services/questions.service";
import { SubmitButton } from "~/components/SubmitButton";


// import jsdom from 'jsdom';

export const loader: LoaderFunction = async (o) => {
    if (Number(o.params.resultId)) {
        // Get user's Logged answers along with the questions
        const answers =  await getAnswersByUserId(Number(o.params.resultId));
        return answers;
    }
    return null
};

export let action: ActionFunction = async ({ request }) => {
    await clearAnswers();
    await clearQuestions();
    return redirect(`/`);
}

function Result() {
    const data: ILoggedAnswer[] = useLoaderData();
    const sanitize = (d: any):string => sanitizeHtml(d) || '';
    const correct = (x: (string | undefined), y: string): boolean => JSON.parse((x || '').toLowerCase()) == JSON.parse(y.toLowerCase());
    const score: string = `${data.filter((la: ILoggedAnswer) => correct(la.Question?.CorrectAnswer, la.Answer)).length} / 10`;
    const isSumbitting: boolean = useTransition().state === 'submitting';

    return data && data.length > 0 ? (
        <div>
            <div className="container mx-auto text-center my-5">
                <h3>You Scored</h3>
                <h3>{score}</h3>
            </div>
            <div className="divide-y divide-slate-100 w-3/4 mx-auto">
                {
                    data &&
                    data.map((la: ILoggedAnswer, i: number) => (
                        <div className="py-8 flex flex-col items-center mx-auto" key={i}>
                            <div className="flex items-start container mx-auto md:w-1/3 p-2">
                                <h4 className={`text-4xl mr-4 ${correct(la.Question?.CorrectAnswer, la.Answer) ? 'text-green-600' : 'text-red-600'}`}>
                                    { correct(la.Question?.CorrectAnswer, la.Answer) ? '+' : '-' }
                                </h4>
                                <h3 dangerouslySetInnerHTML={{ __html:sanitize(la.Question?.QuestionText)}}></h3>
                            </div>
                            <div className="flex flex-col items-end">
                                <small>Correct Answer: { la.Question?.CorrectAnswer.toUpperCase() }</small>
                            </div>
                        </div>
                    ))
                }
            </div>
            <Form method="post" className="flex justify-center">
                <SubmitButton isSubmitting={isSumbitting} text="Play Again!"></SubmitButton>
            </Form>
        </div>

    ) : 
    <div className="container mx-auto text-center my-5">
        <div>Looks like you have some trivia to do first!</div>
        <Form method="post">
            <SubmitButton isSubmitting={isSumbitting} text="Play!"></SubmitButton>
        </Form>
    </div>
}
export default Result;