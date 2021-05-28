
const mongoose = require('mongoose'); // Module that handles database connection
const User = mongoose.model('User', {
    first_name: String,
    last_name: String,
    email: String,
    password: String,
    picture: String,
    disabled: false
});

async function test() {

    mongoose.connect('mongodb://localhost:27017/dating-app', {useNewUrlParser: true, useUnifiedTopology: true});
    const users = await User.find({}).exec();

    for(let i = 0; i < users.length; i++) {
        const url = "https://thispersondoesnotexist.com/image?id=" + i;
        const update = {picture: url};

        const updatedUser = await User.updateOne({email: users[i].email}, update);
    }
}

test();
