import Answer from "../models/answerModel.js";
import Quiz from "../models/quizModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsnyc.js";
import { addHours } from 'date-fns'


// function for getting the current date and time
function currentDate() {
    const currentDate = new Date().toISOString();
    return addHours(currentDate, 5.5);
}
// function for adding the five minute
function addFiveMinutes(date) {
    date.setMinutes(date.getMinutes() + 5);
    return date;
}
const setUserQuestionId = (req, res, next) => {
    // Set the userid and quizid to the request
    if (!req.body.quiz) req.body.quiz = req.params.id;
    if (!req.body.user) req.body.user = req.user.id;
    next();
}

const setAnswer = catchAsync(async (req, res, next) => {
    const quiz = await Quiz.findById(req.params.id);

    // If the quiz is not available
    if (!quiz) {
        return next(new AppError('Quiz not found', 404));
    }

    // If the quiz is not active
    if (quiz.status !== 'active') {
        return next(new AppError(`Quiz is ${quiz.status} , try to attempt active quiz. you can get active quizes from '/active' route `, 404));
    }
    const answers = req.body.answers;

    // If the answer is not available in boby
    if (!answers) {
        return next(new AppError('Please provide answers', 400));
    }

    // If the answer length is less than the total questions
    if (answers.length < quiz.questions.length) {
        return next(new AppError(`Please provide answers of all questions. you are providing the answer of ${answer.length} questions but total questions is ${quiz.questions.length}`, 400));
    }

    //set the answers 
    const data = await Answer.create(req.body);
    res.status(200).send({
        success: true,
        message: "your answers has saved successfully , you can get your result by making get request on '/:QuizId/result' route after five minutes",
        data
    })
})

const getResult = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const quizId = req.params.id;

    // Fetch the quiz document based on the provided ID
    const quiz = await Quiz.findById(quizId).populate('questions');
    if (!quiz) {
        return next(new AppError('Quiz not found', 404));
    }


    // get the answers for user of given quiz
    const answers = await Answer.find({ user: userId, quiz: quizId })

    // Calculate user's marks and percentage
    let totalQuestions = quiz.questions.length;
    let correctAnswers = 0;

    quiz.questions.forEach((question, index) => {
        if (question.rightAnswer === answers[0].answers[index]) {
            correctAnswers++;
        }
    });

    let marks = correctAnswers;
    let percentage = (correctAnswers / totalQuestions) * 100;

    // Construct the result object
    const result = {
        quizName: quiz.quizName,
        totalQuestions,
        totalMarks: totalQuestions,
        marks,
        percentage: `${percentage}%`,
        questions: quiz.questions.map((question, index) => ({
            question: question.question,
            userAnswer: answers[0].answers[index],
            correctAnswer: question.rightAnswer
        })),
        totalQuestions,
        totalMarks: totalQuestions,
        marks,
        percentage: `${percentage}%`
    };

    // Not sending the result 5 min before of submission
    if (addFiveMinutes(answers[0].submissionDate) > currentDate()) {
        return next(new AppError(`Result has not calculated yet ,  try to get result after 5 min of submission `, 404));
    }

    res.status(200).send({
        success: true,
        result: {
            result
        }
    })
})


export default {
    setUserQuestionId,
    setAnswer,
    getResult
}