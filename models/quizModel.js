import mongoose from "mongoose";
import { addHours } from 'date-fns'

function currentDate() {
    const currentDate = new Date().toISOString();
    return addHours(currentDate, 5.5);
}

const quizSchema = new mongoose.Schema({
    quizName: {
        type: String,
        required: [true, "A quiz should has a name"]
    },
    status: {
        type: String,
        default: "inactive"
    },
    questions: [
        {
            question: {
                type: String,
                required: [true, "A question should have a question"]
            },
            options: {
                type: [String],
                required: [true, "A question should have options"]
            },
            rightAnswer: {
                type: Number,
                required: [true, "A question should have an answer"],
            }
        }
    ],
    startDate: {
        type: Date,
        required: [true, "A quiz should have a start date"],

    },
    endDate: {
        type: Date,
        required: [true, "A quiz should have a end date"],
        validate: {
            validator: function (ele) {
                return ele > this.startDate
            },
            message: 'end date must be greater than start date'
        }

    }
})


quizSchema.virtual('answers', {
    ref: 'Answer',
    foreignField: 'quiz',
    localField: '_id',
})

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;