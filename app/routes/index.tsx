import { ActionFunction, json, redirect } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { setQuestions } from "~/services/questions.service";
import { setUser } from "~/services/user.service";
import type { IQuestion } from "~/types/IQuestion";
import { clearAnswers } from "~/services/answers.service";

export const loader: LoaderFunction = async ({ request }) => {
  // If we are not already, assign the user a hash to keep track of them.
  // Check cookie for this hash. If it exists, we don't have to create the user in the DB.
  const cookie = await setUser(request);
  // Once we land, let's store some questions if we haven't already.
  const questions = await setQuestions();
  
  // If this user has already been here (!cookie), just return the questions.
  // Otherwise, send the cookie along.
  return !cookie ? json(questions) : json(
    questions,
    { "headers" : { "Set-Cookie": cookie } }
  )
};

export let action: ActionFunction = async ({ request }) => {
  await clearAnswers();
  const questions = await setQuestions();
  return redirect(`questions/${questions[0].Id}`);
}


export default function Index() {

  return (
    <Form method="post" className="flex flex-col gap-20 mt-10">
      <div className="container mx-auto text-center my-5">
        <h1>Welcome to the Trivia Challenge!</h1>
      </div>
      <div className="container mx-auto text-center my-5">
        <h3>You will be presented with 10 True or False questions.</h3>
      </div>
      <div className="container mx-auto text-center my-5">
        <h3>Can you score 100%?</h3>
      </div>
      <div className="container mx-auto text-center my-5">
          <button className="bg-slate-200	w-48 border-2 p-2 border-radius-2 text-center mt-4 rounded-lg">BEGIN</button>
      </div>
    </Form>
  );
}
