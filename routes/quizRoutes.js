import express from 'express';
import quizController from '../controllers/quizController.js';
import authController from '../controllers/authController.js';
import answerController from '../controllers/answerController.js';

const { protect, restrictTo } = authController;
const { setQuiz, getQuizForSolve, activeQuiz, allQuizes } = quizController;
const router = express.Router();

// for these routes , no need of login
// route for getting active quizes
router.get('/active', activeQuiz);
// route for getting all inactive or finished quizes
router.get('/all', allQuizes)

//for these routes, you have to login
router.use(protect)
// route for getting result of login user by id
router.get('/:id/result', answerController.getResult);

// route for making quizes and this is only accessible for admin
router.route('/').post(restrictTo('admin'), setQuiz);
// route for get the quiz and set the answer to DB
router.route('/:id').get(getQuizForSolve).post(restrictTo('user'), answerController.setUserQuestionId, answerController.setAnswer);


export default router;