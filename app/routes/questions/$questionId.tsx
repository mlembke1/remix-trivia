import type { ActionFunction, LoaderFunction} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { IQuestion } from "~/types/IQuestion";

import { Form, useLoaderData } from "@remix-run/react";
import { getQuestionById } from "~/services/questions.service";
import { getSession } from "~/services/cookie.service";
import { canContinue, getAnswerByUserAndQuestion, postAnswer } from "~/services/answers.service";
import { getUserByHash } from "~/services/user.service";
import type { User } from "@prisma/client";
import sanitizeHtml from "sanitize-html";

export const loader: LoaderFunction = async (o) => {
    if (Number(o.params.questionId)) {
        const q = await getQuestionById(Number(o.params.questionId));
        const session = await getSession(o.request.headers.get("Cookie"));
        const userHash: string = session.get("user-hash");

        const alreadyAnswered = await getAnswerByUserAndQuestion(userHash, q.Id);
        
        return !alreadyAnswered ? {
            question: q,
            userHash: userHash
        } : false;
    }
};

export let action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    const answer: string = JSON.stringify(form.get('answer'));
    const questionId: number = Number(request.url.slice(request.url.lastIndexOf('/') + 1));
    const session = await getSession(request.headers.get("Cookie"));
    const userHash: string = session.get("user-hash");
    const answerObject = {
        QuestionId: questionId,
        UserHash: userHash,
        Answer: answer
    }

    await postAnswer(answerObject)

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
    const data: { question: IQuestion, userHash: string } = useLoaderData();
    const sanitize = (d: any):string => sanitizeHtml(d) || '';

    return data ? (
        <div>
            {
                data &&
                <h3 dangerouslySetInnerHTML={{ __html:sanitize(data.question.QuestionText)}}></h3>
            }
            
            <Form method="post">
                <div>
                    <input type="radio" id="true" name="answer" value="true"/>
                    <label htmlFor="true">True</label>
                </div>

                <div>
                    <input type="radio" id="false" name="answer" value="false" />
                    <label htmlFor="false">False</label>
                </div>

                <button>Next</button>
            </Form>
        </div>

    ) : <h3>Looks like you already answered this question before.</h3>
}
export default Question;