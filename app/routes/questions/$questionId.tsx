import type { ActionFunction, LoaderFunction} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { IQuestion } from "~/types/IQuestion";

import { Form, useLoaderData, useTransition } from "@remix-run/react";
import { getQuestionById } from "~/services/questions.service";
import { getSession, getUserHash } from "~/services/cookie.service";
import { canContinue, getAnswerByUserAndQuestion, postAnswer } from "~/services/answers.service";
import { getUserByHash } from "~/services/user.service";
import type { User } from "@prisma/client";
import sanitizeHtml from "sanitize-html";
import { useEffect, useRef } from "react";

export const loader: LoaderFunction = async (o) => {
    if (Number(o.params.questionId)) {
        const q: { question: IQuestion, index: number } = await getQuestionById(Number(o.params.questionId));
        const userHash = await getUserHash(o);
        const alreadyAnswered = await getAnswerByUserAndQuestion(o, q.question.Id);
        
        return !alreadyAnswered ? {
            question: q.question,
            userHash: userHash,
            index: q.index
        } : false;
    }
};

export let action: ActionFunction = async (o) => {
    const form = await o.request.formData();
    if (!(form.get('answer'))) {
        // If they haven't answered this question, ensure they can't move forward.
        const alreadyAnswered = await getAnswerByUserAndQuestion(o, Number(o.params.questionId));
        if (!alreadyAnswered) {
            return null
        } else {
            return redirect(`questions/${Number(o.params.questionId) + 1}`);
        }
    }

    const answer: string = JSON.stringify(form.get('answer'));
    const questionId: number = Number(o.request.url.slice(o.request.url.lastIndexOf('/') + 1));
    const session = await getSession(o.request.headers.get("Cookie"));
    const userHash: string = session.get("user-hash");
    const answerObject = {
        QuestionId: questionId,
        UserHash: userHash,
        Answer: answer
    }


    await postAnswer(answerObject);
    

    // Here we want to see if they've finished the quiz 
    // by checking how many logged answers we have for this user in the db.
    if (await canContinue(userHash, questionId)) { 
        return redirect(`questions/${questionId + 1}`);
    } else {
        const user: User = await getUserByHash(userHash);
        return redirect(`results/${user.Id}`)
    }
}

function Question() {
    const data: { question: IQuestion, userHash: string , index: number} = useLoaderData();
    const transition = useTransition();
    const isSumbitting: boolean = transition.state === 'submitting';
    let formRef: any = useRef();

    // Using this is reset the Form.
    useEffect(() => {
        if (!isSumbitting){
            if (formRef.current) (formRef.current as any).reset();
        }
    }, [isSumbitting]);

    const sanitize = (d: any):string => sanitizeHtml(d) || '';

    return data ? (
        <div>
            <div className="container mx-auto text-center mt-3">
                <h2>{data.question.Category}</h2>
            </div>
            <div className="container mx-auto my-20 md:w-1/3 p-5 border border-blue-700 rounded-lg">
                {
                    data &&
                    <h3 className="mb-5 text-1xl text-grey-900" dangerouslySetInnerHTML={{ __html:sanitize(data.question.QuestionText)}}></h3>
                }
                
                <Form ref={formRef} method="post">
                    <div>
                        <input type="radio" id="true" name="answer" value="true"/>
                        <label className="ml-2" htmlFor="true">True</label>
                    </div>

                    <div>
                        <input type="radio" id="false" name="answer" value="false" />
                        <label className="ml-2" htmlFor="false">False</label>
                    </div>

                    <div className="flex justify-center">
                        <button disabled={isSumbitting} className="bg-slate-200	w-48 border-2 p-2 border-radius-2 text-center mt-4 rounded-lg">Next</button>
                    </div>
                </Form>
            </div>
            <div className="contianer text-center mt-20">
                <h4>{ data.index } /  10</h4>
            </div>
        </div>
    ) : 
    <div className="container mx-auto my-20 md:w-1/3 p-5 border border-blue-700 rounded-lg">
        <h3>Looks like you already answered this question before.</h3>
        <Form method="post">
            <div className="flex justify-center">
                <button disabled={isSumbitting} className="bg-slate-200	w-48 border-2 p-2 border-radius-2 text-center mt-4 rounded-lg">Next</button>
            </div>
        </Form>
    </div>
}
export default Question;