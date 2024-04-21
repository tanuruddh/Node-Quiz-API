import Quiz from "../models/quizModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsnyc.js";
import { addHours } from 'date-fns'
import cron from 'node-cron'

function currentDate() {
    const currentDate = new Date().toISOString();
    return addHours(currentDate, 5.5);
}

// function for making quizzes
const setQuiz = catchAsync(async (req, res, next) => {
    const { quizName, questions, startDate, endDate } = req.body;

    const quiz = await Quiz.create({ quizName, questions, startDate, endDate });

    res.status(200).send({
        success: 'success',
        data: { quiz }
    })
})

// function for getting tha quiz for solve on get request 
const getQuizForSolve = catchAsync(async (req, res, next) => {
    const quiz = await Quiz.findById(req.params.id).populate('answers').select('_id quizName status startDate endDate questions.options questions.question answers');

    if (quiz.status !== 'active') {
        return res.status(200).send({
            status: 'success',
            message: `Quiz that you are tring to get is ${quiz.status}. So attempt another one which is active`
        })

    }
    res.status(200).send({
        success: 'success',
        questions: quiz.questions.length,
        messgae: 'quiz is active now , you can attempt the quiz by post object of answers sequentially on the same route ',
        data: { quiz }
    })
})

// function for getting active quizzes
const activeQuiz = catchAsync(async (req, res, next) => {
    const date = currentDate();
    const quiz = await Quiz.find({
        startDate: { $lte: date },
        endDate: { $gte: date }
    }).select('-questions')

    if (!quiz.length) {
        return next(new AppError("No active quiz found", 404));
    }

    res.status(200).send({
        quizs: quiz.length,
        success: 'success',
        data: { quiz }
    })
});

// function for getting all quizzes(inactive and finished)
const allQuizes = catchAsync(async (req, res, next) => {
    const date = currentDate();

    const finishedQuiz = await Quiz.find({ endDate: { $lte: date } }).select('-questions');
    const inActiveQuiz = await Quiz.find({ startDate: { $gte: date } }).select('-questions');

    res.status(200).send({
        quizs: finishedQuiz.length + inActiveQuiz.length,
        success: 'success',
        data: { finishedQuiz, inActiveQuiz }
    })

});

// function for updatimg the status of the quiz
const updateQuizStatus = catchAsync(async () => {

    const now = currentDate();
    const expiredQuizzes = await Quiz.find({ startDate: { $lt: now } });

    expiredQuizzes.forEach(async (quiz) => {
        quiz.status = quiz.endDate < now ? 'finished' : 'active';
        await quiz.save();
    });

    console.log('Quiz statuses updated');
});

// cron job for updateQuizStatus after every minute
cron.schedule('0 * * * * *', updateQuizStatus);


export default {
    setQuiz,
    getQuizForSolve,
    activeQuiz,
    allQuizes,
    currentDate,
}