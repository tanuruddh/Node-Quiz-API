import mongoose from "mongoose";
import { addHours } from 'date-fns'



function currentDate() {
    const currentDate = new Date().toISOString();
    return addHours(currentDate, 5.5);
}

const answerSchema = new mongoose.Schema({
    answers: {
        type: [Number],
        enum: [0, 1, 2, 3],
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: [true, "An answer should belong to a question"]
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "An answer should belong to a user"]
    },
    submissionDate: {
        type: Date,
        default: currentDate()
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
}
)
// for one user can attempt a quiz only once
answerSchema.index({ quiz: 1, user: 1 }, { unique: true });

const Answer = mongoose.model('Answer', answerSchema);

export default Answer;