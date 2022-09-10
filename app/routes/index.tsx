import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { setQuestions } from "~/services/questions.service";
import { setUser } from "~/services/user.service";
import { IQuestion } from "~/types/IQuestion";

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

export default function Index() {
  const questions: IQuestion[] = useLoaderData();
  const firstQuestionId: number = questions[0].Id;

  return (
    <div>
      <h3>Welcome to the Trivia Challenge!</h3>
      <h3>You will be presented with 10 True or False questions.</h3>
      <h3>Can you score 100%?</h3>
      <Link to={`questions/${firstQuestionId}`}>
        <button>BEGIN</button>
      </Link>
    </div>
  );
}
