const express = require('express');
const app = express();
const mongoose = require('mongoose'); // Module that handles database connection
const passwordHash = require('password-hash');
const bodyParser = require('body-parser'); // allows us to parse body of POST requests
const cors = require('cors'); // ensures requests we get are from the right source
const uuid = require('uuid'); // generates unique id for filenames
const fs = require('fs'); // filesystem: used to create image files
const axios = require('axios'); // used to GET data from external API (postcode location API)
const WebSocket = require('ws'); // fulfils websockets used in messaging function
const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc"); // API for visual feature recognition that is used in algorithm

// Clarifai API START
const stub = ClarifaiStub.grpc();
const metadata = new grpc.Metadata();
metadata.set("authorization", "Key d3aeb959af9d4d66a8cd2be6db2031c2");
//Clarifai API END

// Connector to Mongo Database
mongoose.connect('mongodb://localhost:27017/dating-app3', { useNewUrlParser: true, useUnifiedTopology: true });

// BodyParser used for POST requests so data can be transferred correctly
// Limit increased to allow for user's to upload profile images
app.use(bodyParser.json({ limit: '10mb', extended: true })); // to parse POST requests that arrive in JSON format
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Use STRICT CORS, allow connections from localhost:4200 only
app.use(
    cors({
        origin: ["http://localhost:4200"]
    })
);

// Apply CORS to all requests
app.options("*", cors()); // include before other routes

// WebSockets START
// Define WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Array holding all websockets
const wsClients = [];

// On Client copnnection
wss.on('connection', function connection(ws, req) {
    // Split the request URL by /
    const socketData = req.url.split('/');

    // Check if the socket for the given type and user already exists
    const existingSocket = wsClients.findIndex((e) => {
        return e.type === socketData[1] && e.ref === socketData[2];
    });

    // If it exists, it is removed from the array
    if (existingSocket !== -1) {
        wsClients.splice(existingSocket, 1);
    }

    // The new socket is added to the array
    wsClients.push({ type: socketData[1], ref: socketData[2], socket: ws });
});
// WebSockets END

// DB SCHEMAS START
const User = mongoose.model('User', {
    first_name: String,
    last_name: String,
    email: String,
    password: String,
    picture: String,
    disabled: false,
    buddyUpID: ''
});
const UserDetail = mongoose.model('UserDetail', {
    email: String,
    gender: String,
    interest: Array,
    dob: String,
    about: String,
    location: String,
    interests: Array,
    lat: String,
    lon: String
});
const Message = mongoose.model('Message', { from: String, to: String, content: String, date: Number });
const Interaction = mongoose.model('Interaction', {
    sourceUser: String,
    targetUser: String,
    type: Number,
    date: String
});
const Match = mongoose.model('Match', {
    users: Array,
    status: Number
});
const Block = mongoose.model('Block', {
    source: String,
    target: String
});
const Demographic = mongoose.model('Demographic', {
    age: Array,
    gender: String,
    ethnicity: Array,
    user: String
});

const Buddy = mongoose.model('Buddy', {
    users: Array,
    status: Number,
    requestedBy: String
});

const BuddyInteraction = mongoose.model('BuddyInteraction', {
    sourceBuddy: String,
    targetBuddy: String,
    type: Number,
    date: String
});

const BuddyMatch = mongoose.model('BuddyMatch', {
    buddies: Array,
    status: Number
});

const BuddyMessage = mongoose.model('BuddyMessage', {
    fromBuddy: String,
    toBuddy: String,
    from: String,
    date: Number,
    content: String
});


// DB SCHEMAS END

// Defining static directory
app.use(express.static('public'));

// POST register user route
app.post('/api/user/register', async (req, res) => {
    const userData = req.body.userData;

    // Find user with given email address (users must have unique email addresses)
    const user = await User.find({ email: userData.email.toLowerCase() });
    const profile = req.body.profilePic;
    let newPic = '';

    // If profile pic was sent in the request it will be saved to static directory
    if (profile !== '') {
        const regex = /^data:.+\/(.+);base64,(.*)$/;
        const matches = profile.match(regex);
        const ext = matches[1];
        const data = matches[2];
        const buffer = Buffer.from(data, 'base64');
        const fileId = uuid.v4();
        fs.writeFileSync('public/imgs/' + fileId + '.' + ext, buffer);
        newPic = 'http://localhost:3000/imgs/' + fileId + '.' + ext
    }

    // If user with the given email address was not found
    if (user.length === 0) {
        // Prepare the new user object
        const newUser = new User({
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email.toLowerCase(),
            password: passwordHash.generate(userData.password),
            picture: newPic,
            disabled: false
        });

        // Add the new user object to the database
        // Profile photo retrieved from requests and passed to physical feature API
        newUser.save().then(() => {
            const regex = /^data:.+\/(.+);base64,(.*)$/;
            const matches = profile.match(regex);
            const data = matches[2];
            const buffer = Buffer.from(data, 'base64');

            // Use Clarifai API to retrieve info about ethnicity, age and gender
            stub.PostWorkflowResults(
                {
                    workflow_id: "Demographics",
                    inputs: [{ data: { image: { base64: buffer } } }]
                },


                metadata,
                (err, response) => {
                    if (response) {
                        // Prepare data, take only 3 best results for ethnicity
                        const ethnicity = response.results[0].outputs[2].data.regions[0].data.concepts.map((e) => {
                            return { type: e.name, value: e.value }
                        }).slice(0, 3);

                        // Prepare data, take the first gender
                        const gender = response.results[0].outputs[3].data.regions[0].data.concepts.map((e) => {
                            return { type: e.name, value: e.value }
                        })[0].type;

                        // Prepare data, take only 3 best results for age
                        const age = response.results[0].outputs[4].data.regions[0].data.concepts.map((e) => {
                            return { type: e.name, value: e.value }
                        }).slice(0, 3);

                        // Prepare new demographics object
                        const newDemographic = new Demographic({
                            age: age,
                            gender: gender,
                            ethnicity: ethnicity,
                            user: userData.email.toLowerCase()
                        });

                        // Add the demographics object to Mongo
                        newDemographic.save().then();
                    } else {
                        console.log(err)
                    }
                });

            // Return status success to the frontend
            res.send({ status: 'OK', code: 0, msg: 'User has been registered successfully!' });
        })
    } else {
        // Return error if username already exists
        res.send({ status: 'Error', code: 1, msg: 'There is a user registered with this email address already!' });
    }
});

// POST login user route
app.post('/api/user/login', async (req, res) => {
    const userData = { email: req.body.email.toLowerCase(), password: req.body.password };

    // Find user with the given email address
    const user = await User.find({ email: userData.email });

    // If user was found
    if (user.length === 1) {
        // Compare the password provided against the password retrieved from the database
        if (passwordHash.verify(userData.password, user[0].password)) {
            // If it matches, return success
            res.send({ status: 'OK', code: 0, msg: user[0].email })
        } else {
            // If password is incorrect return error
            res.send({ status: 'Error', code: 1, msg: 'Wrong credentials!' })
        }
        // If user was not found return an error
    } else if (user.length === 0) {
        res.send({ status: 'Error', code: 1, msg: 'Wrong credentials!' })
        // If there are more users with this email address (e.g. due to system error) return api error
    } else {
        res.send({ status: 'Error', code: 2, msg: 'API Error!' });
    }
});

// GET get basic user info route
app.get('/api/user/get/:user', async (req, res) => {
    // Find user based on the email address
    const userObject = await User.find({ email: req.params.user.toLowerCase() }).exec();

    // If one user was found prepare the data and return it to frontend
    if (userObject.length === 1) {
        const userInfo = {
            first_name: userObject[0].first_name,
            last_name: userObject[0].last_name,
            email: userObject[0].email,
            picture: userObject[0].picture,
            disabled: userObject[0].disabled
        }
        res.send({ status: 'OK', msg: userInfo });
        // If no user was found return an error
    } else {
        res.send({ status: 'Error', msg: 'API Error!' });
    }
});


// GET get basic user info route
app.get('/api/user/details/get/:user', async (req, res) => {
    // Find user based on the email address
    const userObject = await User.find({ email: req.params.user.toLowerCase() }).exec();

    // If one user was found
    if (userObject.length === 1) {
        // Find details of the user
        const userDetailObject = await UserDetail.find({ email: req.params.user.toLowerCase() }).exec();

        // If details were found prepare the data object
        if (userDetailObject.length === 1) {
            const userInfo = {
                first_name: userObject[0].first_name,
                last_name: userObject[0].last_name,
                email: userObject[0].email,
                picture: userObject[0].picture,
                disabled: userObject[0].disabled,
                gender: userDetailObject[0].gender,
                interest: userDetailObject[0].interest,
                dob: userDetailObject[0].dob,
                about: userDetailObject[0].about,
                location: userDetailObject[0].location,
                interests: userDetailObject[0].interests,
                buddyUpID: userObject[0].buddyUpID
            }
            // Send response back to frontend
            res.send({ status: 'OK', code: 0, msg: userInfo })
        } else {
            // If there are no user details prepare basic user info object
            const userInfo = {
                first_name: userObject[0].first_name,
                last_name: userObject[0].last_name,
                email: userObject[0].email,
                picture: userObject[0].picture
            }
            // Send response back to frontend
            res.send({ status: 'OK', code: 1, msg: userInfo })
        }
    } else {
        // If no users were found send error to frontend
        res.send({ status: 'Error' });
    }
});

app.post('/api/buddy/set', async (req, res) => {
    const details = req.body.userDetails;

    console.log(details);

    if (details.buddyEmail) {
        const existingUser = await User.findOne({ email: details.buddyEmail.toLowerCase() }).exec();

        if (existingUser) {
            const newBuddy = new Buddy({
                users: [existingUser.email, details.requestedBy],
                requestedBy: details.requestedBy,
                status: 0
            });

            newBuddy.save().then(() => {
                res.send({ status: 'OK', msg: 'Requested' });
            });
        } else {
            res.send({ status: 'Error', msg: 'No user found!' });
        }
    } else {
        res.send({ status: 'Error', msg: 'No email provided!' });
    }
});

app.get('/api/buddy/get/details/:ID', async (req, res) => {
    const buddyUpID = req.params.ID;
    const buddyUp = await Buddy.find({ _id: buddyUpID }).exec();
    const response = { buddyUpID: req.params.id, userDetails: [] };

    if (buddyUp.length > 0) {
        for (const buddy of buddyUp[0].users) {
            const userDetails = await User.findOne({ email: buddy }).exec();
            response.userDetails.push({ email: userDetails.email, name: userDetails.first_name + ' ' + userDetails.last_name });
        }
        res.send({ status: 'OK', msg: response });
    } else {
        res.send({ status: 'Error', msg: 'Buddy up not found!' });
    }
});

app.get('/api/buddies/get/details/:ID', async (req, res) => {
    const buddyUpID = req.params.ID;
    const buddyUp = await Buddy.find({ _id: buddyUpID }).exec();
    const response = { buddyUpID: req.params.id, userDetails: [] };

    if (buddyUp.length > 0) {
        for (const buddy of buddyUp[0].users) {
            const userData = await User.findOne({ email: buddy }).exec();
            const userResponse = {
                email: userData.email,
                first_name: userData.first_name,
                last_name: userData.last_name,
                picture: userData.picture
            }
            response.userDetails.push(userResponse);
        }
        res.send({ status: 'OK', msg: response });
    } else {
        res.send({ status: 'Error', msg: 'Buddy up not found!' });
    }
});

app.post('/api/buddy/cancel', async (req, res) => {
    const id = req.body.id;

    const updatedUsers = await User.updateMany({ buddyUpID: id }, { $set: { buddyUpID: '' } });
    const deletedBuddy = await Buddy.deleteOne({ _id: id });

    console.log(updatedUsers);
    console.log(deletedBuddy);

    res.send({ status: 'OK', msg: 'Buddy up cancelled!' });
});

app.post('/api/buddy/cancel/request', async (req, res) => {
    const id = req.body.id;

    const deletedBuddy = await Buddy.deleteOne({ $and: [{ _id: id }, { status: 0 }] });

    console.log(deletedBuddy);

    res.send({ status: 'OK', msg: 'Buddy up cancelled!' });
});


app.get('/api/buddy/get/:target', async (req, res) => {
    const target = req.params.target;
    const buddyRequests = await Buddy.find({ $and: [{ users: target.toLowerCase() }, { status: 0 }] }).exec();

    res.send({ status: 'OK', msg: buddyRequests });
});

app.get('/api/buddy/get/status/:target', async (req, res) => {
    const target = req.params.target;

    const buddyStatus = await User.findOne({ email: target }).exec();

    if (buddyStatus) {
        if (buddyStatus.buddyUpID) {
            res.send({ status: 'OK', msg: { buddyStatus: true } });
        } else {
            res.send({ status: 'OK', msg: { buddyStatus: false } });
        }
    } else {
        res.send({ status: 'Error', msg: 'No buddy up found!' });
    }
});

app.post('/api/buddy/accept', async (req, res) => {
    const details = req.body.details;

    const buddyUp = await Buddy.findOne({
        users: { $all: [details.source, details.target] },
        requestedBy: details.source
    }).exec();

    const sourceUser = await User.findOne({ email: details.source }).exec();
    const targetUser = await User.findOne({ email: details.target }).exec();

    if (buddyUp && sourceUser && targetUser) {
        if (!sourceUser.buddyUpID && !targetUser.buddyUpID) {
            const update = await Buddy.updateOne({ _id: buddyUp._id }, { $set: { status: 1 } });

            const updateSource = await User.updateOne({ email: details.source.toLowerCase() }, { $set: { buddyUpID: buddyUp._id.toString() } });
            const updateTarget = await User.updateOne({ email: details.target.toLowerCase() }, { $set: { buddyUpID: buddyUp._id.toString() } });

            console.log(updateSource);

            if (update && updateSource && updateTarget) {
                res.send({ status: 'OK', msg: 'Buddy up accepted!' });
            } else {
                res.send({ status: 'Error', msg: 'An API error occurred!' });
            }
        } else {
            res.send({ status: 'Error', msg: 'One of the users is already a part of buddy up!' })
        }
    }
});

// POST add user details route
app.post('/api/user/details', async (req, res) => {
    const details = req.body.userDetails;
    // Find user in users collection with the given email address
    const userObject = await User.find({ email: details.email }).exec();

    // Find user in user details collection with the given email address
    const userDetailsObject = await UserDetail.find({ email: details.email }).exec();
    const profile = req.body.profilePic;

    // If user was found in users collection
    if (userObject.length === 1) {
        let newPic = userObject[0].picture;

        // If new picture was uploaded
        if (profile !== '') {
            const regex = /^data:.+\/(.+);base64,(.*)$/;
            const matches = profile.match(regex);
            const ext = matches[1];
            const data = matches[2];
            const buffer = Buffer.from(data, 'base64');
            const fileId = uuid.v4();
            // Write file to static directory
            fs.writeFileSync('public/imgs/' + fileId + '.' + ext, buffer);
            newPic = 'http://localhost:3000/imgs/' + fileId + '.' + ext

            // Delete all demographics
            const existingDemographic = await Demographic.deleteOne({ user: details.email.toLowerCase() });

            // If all demographics got deleted successfully
            if (existingDemographic) {

                // Send data to Clarifai API for visual analysis
                stub.PostWorkflowResults(
                    {
                        workflow_id: "Demographics",
                        inputs: [{ data: { image: { base64: buffer } } }]
                    },


                    metadata,
                    (err, response) => {
                        if (response) {
                            // Get 3 best values of recognised ethnicity
                            const ethnicity = response.results[0].outputs[2].data.regions[0].data.concepts.map((e) => {
                                return { type: e.name, value: e.value }
                            }).slice(0, 3);

                            // Get the best value of recognised gender
                            const gender = response.results[0].outputs[3].data.regions[0].data.concepts.map((e) => {
                                return { type: e.name, value: e.value }
                            })[0].type;


                            // Get 3 best values of recognised age
                            const age = response.results[0].outputs[4].data.regions[0].data.concepts.map((e) => {
                                return { type: e.name, value: e.value }
                            }).slice(0, 3);

                            console.log('Updating');

                            // Prepare new demographics object
                            const newDemographic = new Demographic({
                                age: age,
                                gender: gender,
                                ethnicity: ethnicity,
                                user: details.email.toLowerCase()
                            });

                            // Add the new demographics object to the database
                            newDemographic.save().then();
                        } else {
                            console.log(err)
                        }
                    });
            }
        }

        // Update user details
        const userResponse = await User.updateOne({ email: details.email }, {
            first_name: details.first_name,
            last_name: details.last_name,
            picture: newPic
        });

        // If details were updated (name, first name and picture)
        if (userResponse) {
            // Prepare location data based on postcodde
            let latitude, longitude;
            if (details.location !== '') {
                // Poll postocodes.io API to get latitude and longitude
                const sourcePostcode = await axios.get('http://api.postcodes.io/postcodes/' + details.location);
                latitude = sourcePostcode.data.result.latitude;
                longitude = sourcePostcode.data.result.longitude;
            }

            // If no entries in the userdetails collection were found
            if (userDetailsObject.length === 0) {
                // Prepare new user details object
                const newUserDetail = new UserDetail({
                    email: details.email,
                    gender: details.gender,
                    interest: details.interest,
                    dob: details.dob,
                    about: details.about,
                    location: details.location,
                    interests: details.interests,
                    lat: latitude,
                    lon: longitude
                });
                // Save it in collection
                newUserDetail.save().then(() => {
                    res.send({ status: 'OK', code: 0, msg: newUserDetail });
                });
            } else {
                // If entry in userdetails exists, update it with the new data
                const response = await UserDetail.updateOne({ email: details.email }, {
                    gender: details.gender,
                    interest: details.interest,
                    dob: details.dob,
                    about: details.about,
                    location: details.location,
                    interests: details.interests,
                    lat: latitude,
                    lon: longitude
                });

                // If successfully updated, send success to frontend
                if (response) {
                    res.send({
                        status: 'OK',
                        code: 0,
                        msg: {
                            email: details.email,
                            gender: details.gender,
                            interest: details.interest,
                            dob: details.dob,
                            about: details.about,
                            location: details.location,
                            interests: details.interests,
                            lat: latitude,
                            lon: longitude
                        }
                    });
                }
            }
        }
    } else {
        res.send({ status: 'Error' });
    }
});

app.post('/api/user/disable', async (req, res) => {
    const details = req.body.userDetails;
    const userObject = await User.find({ email: details }).exec();

    if (userObject.length === 1) {
        const response = await User.updateOne({ email: details }, { disabled: true });
        if (response) {
            res.send({ status: 'OK', code: 0, msg: { email: details, disabled: true } });
        } else {
            res.send({ status: 'Error', msg: 'API Error!' });
        }
    } else {
        res.send({ status: 'Error' });
    }
});

app.post('/api/user/enable', async (req, res) => {
    const details = req.body.userDetails;
    const userObject = await User.find({ email: details }).exec();

    if (userObject.length === 1) {
        const response = await User.updateOne({ email: details }, { disabled: false });
        if (response) {
            res.send({ status: 'OK', code: 0, msg: { email: details, disabled: false } });
        } else {
            res.send({ status: 'Error', msg: 'API Error!' });
        }
    } else {
        res.send({ status: 'Error' });
    }
});

app.get('/api/user/get/:minAge/:maxAge/:distance/:user', async (req, res) => {
    const minAge = req.params.minAge;
    const maxAge = req.params.maxAge;
    const maxDistance = req.params.distance;
    const user = req.params.user;
    const minAgeOffset = new Date() - minAge * 365.242 * 24 * 60 * 60 * 1000;
    const maxAgeOffset = new Date() - maxAge * 365.242 * 24 * 60 * 60 * 1000;

    const minDate = new Date(minAgeOffset).toISOString();
    const maxDate = new Date(maxAgeOffset).toISOString();
    const users = await UserDetail.find({ dob: { "$lte": minDate, "$gte": maxDate } }).exec();

    const sourceUser = await UserDetail.find({ email: user }).exec();

    if (sourceUser.length === 0) {
        res.send({ status: 'Error', msg: 'You need to complete your profile to explore!' });
        return;
    }

    const sourceInterest = sourceUser[0].interest;
    const sourceGender = sourceUser[0].gender;

    let sourceLong;
    let sourceLat;
    if (sourceUser) {
        sourceLat = sourceUser[0].lat;
        sourceLong = sourceUser[0].lon;
    }

    const response = [];

    for (const e of users) {
        const interaction = await Interaction.find(
            {
                $and: [
                    { targetUser: e.email },
                    { sourceUser: user }
                ]
            }).exec();

        if (e.email !== user && interaction.length === 0) {
            const currentUser = await User.findOne({ email: e.email }).exec();
            const currentUserDetails = await UserDetail.findOne({ email: e.email }).exec();

            if (sourceInterest.includes(e.gender.toLowerCase())) {
                // if (e.location !== undefined && sourceInterest.includes(e.gender)) {
                let dist = 0;
                if (e.location && !e.lat && !e.lon) {
                    const destPostcode = await axios.get('http://api.postcodes.io/postcodes/' + e.location);
                    const destLat = destPostcode.data.result.latitude;
                    const destLong = destPostcode.data.result.longitude;

                    const updated = await UserDetail.updateOne({ email: e.email }, { lat: destLat, lon: destLong });

                    dist = getDistanceFromLatLonInKm(sourceLat, sourceLong, destLat, destLong);
                } else {
                    dist = getDistanceFromLatLonInKm(sourceLat, sourceLong, currentUserDetails.lat, currentUserDetails.lon);
                }

                if (dist < parseInt(maxDistance)) {
                    const age = Math.floor((new Date() - new Date(e.dob)) / 365.242 / 24 / 60 / 60 / 1000);
                    const userInfo = {
                        first_name: currentUser.first_name,
                        last_name: currentUser.last_name,
                        email: currentUser.email,
                        picture: currentUser.picture,
                        disabled: currentUser.disabled,
                        gender: e.gender,
                        interest: e.interest,
                        dob: e.dob,
                        about: e.about,
                        location: e.location,
                        age: age
                    }
                    response.push(userInfo);
                }
            }
        }
    }
    res.send({ status: 'OK', msg: response });
});

app.get('/api/buddies/get/:minAge/:maxAge/:distance/:buddyId', async (req, res) => {
    const minAge = req.params.minAge;
    const maxAge = req.params.maxAge;
    const maxDistance = req.params.distance;
    const buddyId = req.params.buddyId;

    const minAgeOffset = new Date() - minAge * 365.242 * 24 * 60 * 60 * 1000;
    const maxAgeOffset = new Date() - maxAge * 365.242 * 24 * 60 * 60 * 1000;

    const minDate = new Date(minAgeOffset).toISOString();
    const maxDate = new Date(maxAgeOffset).toISOString();

    const buddy = await Buddy.find({ _id: buddyId }).exec();

    const sourceUsers = [];
    const sourceCoord = [];

    if (buddy.length === 0) {
        res.send({ status: 'Error', msg: 'Buddy not found!' });
        return;
    }

    for (const user of buddy[0].users) {
        const sourceUser = await UserDetail.findOne({ email: user }).exec();
        if (!sourceUser) {
            res.send({ status: 'Error', msg: 'You need to complete your profile to explore!' });
            return;
        } else {
            sourceUsers.push(sourceUser);
            sourceCoord.push({ lat: sourceUser.lat.replace('\n', ''), lon: sourceUser.lon.replace('\n', '') });
        }
    }


    const buddies = await Buddy.find({ _id: { $ne: buddyId }, status: 1 }).exec();
    console.log(buddies);
    const response = [];

    for (const e of buddies) {
        const interaction = await BuddyInteraction.find(
            {
                $and: [
                    { targetBuddy: e._id },
                    { sourceBuddy: buddyId }
                ]
            }).exec();

        if (interaction.length === 0) {
            const targetUsers = [];
            const targetCoord = [];
            const targetBuddy = await Buddy.find({ _id: e._id }).exec();
            let profileIncomplete = false;

            for (const user of targetBuddy[0].users) {
                const targetUser = await UserDetail.findOne({ email: user }).exec();
                if (!targetUser) {
                    profileIncomplete = true;
                    break;
                } else {
                    targetUsers.push(targetUser);
                    targetCoord.push({ lat: targetUser.lat.replace('\n', ''), lon: targetUser.lon.replace('\n', '') });
                }
            }

            if (profileIncomplete) {
                continue;
            }

            let withinDistance = false;
            let withinAge = false;

            for (const sLoc of sourceCoord) {
                for (const tLoc of targetCoord) {
                    const dist = getDistanceFromLatLonInKm(sLoc.lat, sLoc.lon, tLoc.lat, tLoc.lon);
                    if (dist < parseInt(maxDistance)) {
                        withinDistance = true;
                        break;
                    }
                }
            }

            for (const targetUser of targetUsers) {
                const age = Math.floor((new Date() - new Date(targetUser.dob)) / 365.242 / 24 / 60 / 60 / 1000);
                console.log(age, maxAge, minAge)
                if ((age > minAge) && (age < maxAge)) {
                    withinAge = true;
                    break;
                }
            }

            console.log(withinAge);

            if (withinDistance && withinAge) {
                const buddyDetails = {
                    buddyId: e._id,
                    user1: {},
                    user2: {}
                }

                for (let i = 0; i < 2; i++) {
                    const age = Math.floor((new Date() - new Date(targetUsers[i].dob)) / 365.242 / 24 / 60 / 60 / 1000);

                    const targetUser = await User.findOne({ email: targetUsers[i].email });

                    const userInfo = {
                        first_name: targetUser.first_name,
                        last_name: targetUser.last_name,
                        email: targetUser.email,
                        picture: targetUser.picture,
                        disabled: targetUser.disabled,
                        gender: targetUsers[i].gender,
                        interest: targetUsers[i].interest,
                        dob: targetUsers[i].dob,
                        about: targetUsers[i].about,
                        location: targetUsers[i].location,
                        age: age
                    }

                    if (i === 0) {
                        buddyDetails.user1 = userInfo;
                    } else {
                        buddyDetails.user2 = userInfo;
                    }
                }
                response.push(buddyDetails);
            }
        }
    }
    res.send({ status: 'OK', msg: response });
});

app.post('/api/buddy/interaction', async (req, res) => {
    const source = req.body.sourceBuddy;
    const target = req.body.targetBuddy;
    const type = req.body.type; // like = 1, dislike = 0, super-like = 2
    const date = new Date().toISOString();

    const sourceBuddy = await Buddy.find({ _id: source }).exec();
    const targetBuddy = await Buddy.find({ _id: target }).exec();

    if (sourceBuddy.length > 0 && targetBuddy.length > 0) {
        const existing = await BuddyInteraction.find(
            {
                $or: [
                    {
                        $and: [
                            { sourceBuddy: source },
                            { targetBuddy: target }
                        ]
                    },
                    {
                        $and: [
                            { targetBuddy: source },
                            { sourceBuddy: target }
                        ]
                    }
                ]
            }).exec();

        const newInteraction = new BuddyInteraction({
            sourceBuddy: source,
            targetBuddy: target,
            type: type,
            date: date
        });

        if (existing.length >= 1) {
            const newMatch = new BuddyMatch({
                buddies: [source, target],
                status: 0,
                blocked: false,
            });

            newMatch.save().then(() => {
                newInteraction.save().then(() => {
                    res.send({ status: 'OK', msg: newInteraction });
                });
            });
        } else {
            newInteraction.save().then(() => {
                res.send({ status: 'OK', msg: newInteraction });
            });
        }
    } else {
        res.send({ status: 'Error', msg: 'Buddy does not exist!' });
    }
});

app.post('/api/user/interaction', async (req, res) => {
    const source = req.body.sourceUser;
    const target = req.body.targetUser;
    const type = req.body.type;
    const date = new Date().toISOString();

    const sourceUser = await User.find({ email: source }).exec();
    const targetUser = await User.find({ email: target }).exec();

    if (sourceUser.length > 0 && targetUser.length > 0) {
        const existing = await Interaction.find(
            {
                $or: [
                    {
                        $and: [
                            { sourceUser: source },
                            { targetUser: target }
                        ]
                    },
                    {
                        $and: [
                            { targetUser: source },
                            { sourceUser: target }
                        ]
                    }
                ]
            }).exec();

        const newInteraction = new Interaction({
            sourceUser: source,
            targetUser: target,
            type: type,
            date: date
        });

        if (existing.length >= 1) {
            const newMatch = new Match({
                users: [source, target],
                status: 0,
                blocked: false,
            });
            newMatch.save().then(() => {
                newInteraction.save().then(() => {
                    res.send({ status: 'OK', msg: newInteraction });
                });
            });
        } else {
            newInteraction.save().then(() => {
                res.send({ status: 'OK', msg: newInteraction });
            });
        }
    } else {
        res.send({ status: 'Error', msg: 'User does not exist!' });
    }
});

app.post('/api/user/block', async (req, res) => {
    const source = req.body.sourceUser;
    const target = req.body.targetUser;

    const newBlock = new Block({ source: source, target: target });

    newBlock.save().then(() => {
        res.send({ status: 'OK', msg: 'User blocked!' });
    })
});

app.post('/api/user/unblock', async (req, res) => {
    const source = req.body.sourceUser;
    const target = req.body.targetUser;

    const blocks = await Block.find({ source: source, target: target }).exec();

    if (blocks.length > 0) {
        const removeBlock = await Block.deleteOne({ source: source, target: target });

        if (removeBlock) {
            const block = await Block.find({ source: source }).exec();
            
            // fetch blocked users
            if (block.length > 0) {
                const blockedUsers = [];
                for (const user of block) {
                    const currentUser = await User.findOne({ email: user.target }).exec();

                    if (currentUser) {
                        blockedUsers.push({
                            name: currentUser.first_name + ' ' + currentUser.last_name,
                            email: currentUser.email
                        });
                    }
                }

                res.send({ status: 'OK', msg: blockedUsers });
            } else {
                res.send({ status: 'Error', msg: 'No blocked users!' });
            }
        }
    } else {
        res.send({ status: 'Error', msg: 'User is not blocked!' });
    }
});

app.get('/api/user/blocked/:user', async (req, res) => {
    const block = await Block.find({ source: req.params.user }).exec();
    if (block.length > 0) {
        const blockedUsers = [];
        for (const user of block) {
            const currentUser = await User.findOne({ email: user.target }).exec();

            if (currentUser) {
                blockedUsers.push({
                    name: currentUser.first_name + ' ' + currentUser.last_name,
                    email: currentUser.email
                });
            }
        }

        res.send({ status: 'OK', msg: blockedUsers });
    } else {
        res.send({ status: 'Error', msg: 'No blocked users!' });
    }
});

app.get('/api/user/recommendations/:sourceUser', async (req, res) => {
    const user = req.params.sourceUser;
    const interactions = await Interaction.find({ sourceUser: user }).exec();

    if (interactions.length > 10) {
        const suggestions = [];
        const interestsFav = [];
        const demographicsFav = [];
        const scores = [];

        let demoCount = 0;
        let interestCount = 0;

        let likedUsers = [];

        for (const interaction of interactions) {
            const demographics = await Demographic.findOne({ user: interaction.targetUser });
            const interactionDetails = await UserDetail.findOne({ email: interaction.targetUser });

            likedUsers.push(interaction.targetUser);

            if (demographics && interactionDetails.interests.length > 0 && interaction.type > 0) {
                suggestions.push(interaction);
                const ethnicity = demographics.ethnicity;

                // check if ethnicity count exists
                const ethnicityIndexFirst = demographicsFav.findIndex((e) => {
                    return e.type === ethnicity[0].type;
                });
                // if it does exist then...
                if (ethnicityIndexFirst !== -1) {
                    demographicsFav[ethnicityIndexFirst].value = demographicsFav[ethnicityIndexFirst].value + 1;
                } else { // else if it doesn't exist, create a new object add push to array
                    const newEthnicity = { type: ethnicity[0].type, value: 1 };
                    demographicsFav.push(newEthnicity);
                }

                demoCount++;

                // if ethnicity prediction second value is <0.5 and third value is >0.3 then only add second value to count
                if (ethnicity[0].value <= 0.5 && ethnicity[1].value > 0.3) {
                    const ethnicityIndexSecond = demographicsFav.findIndex((e) => {
                        return e.type === ethnicity[1].type;
                    });

                    if (ethnicityIndexSecond !== -1) {
                        demographicsFav[ethnicityIndexSecond].value = demographicsFav[ethnicityIndexSecond].value + 1;
                    } else {
                        const newEthnicity = { type: ethnicity[1].type, value: 1 };
                        demographicsFav.push(newEthnicity);
                    }

                    demoCount++;

                // if ethnicity prediction second value is <0.5 and third value is <0.3 then add second and third value to count
                } else if (ethnicity[0].value <= 0.5 && ethnicity[1].value <= 0.3) {
                    const ethnicityIndexSecond = demographicsFav.findIndex((e) => {
                        return e.type === ethnicity[1].type;
                    });

                    const ethnicityIndexThird = demographicsFav.findIndex((e) => {
                        return e.type === ethnicity[2].type;
                    });

                    if (ethnicityIndexSecond !== -1) {
                        demographicsFav[ethnicityIndexSecond].value = demographicsFav[ethnicityIndexSecond].value + 1;
                    } else {
                        const newEthnicity = { type: ethnicity[1].type, value: 1 };
                        demographicsFav.push(newEthnicity);
                    }

                    if (ethnicityIndexThird !== -1) {
                        demographicsFav[ethnicityIndexThird].value = demographicsFav[ethnicityIndexThird].value + 1;
                    } else {
                        const newEthnicity = { type: ethnicity[2].type, value: 1 };
                        demographicsFav.push(newEthnicity);
                    }

                    demoCount = demoCount + 2;
                }

                for (const interest of interactionDetails.interests) {
                    const interestIndex = interestsFav.findIndex((e) => {
                        return e.type === interest;
                    });

                    if (interestIndex !== -1) {
                        interestsFav[interestIndex].value = interestsFav[interestIndex].value + 1;
                    } else {
                        const newInterest = { type: interest, value: 1 };
                        interestsFav.push(newInterest);
                    }
                    interestCount++;
                }
            }
        }

        demographicsFav.sort((a, b) => {
            if (a.value < b.value) {
                return 1;
            } else if (a.value > b.value) {
                return -1;
            }
            return 0;
        });

        interestsFav.sort((a, b) => {
            if (a.value < b.value) {
                return 1;
            } else if (a.value > b.value) {
                return -1;
            }
            return 0;
        });

        for (let i = 0; i < demographicsFav.length; i++) {
            demographicsFav[i].value = (demographicsFav[i].value / demoCount) * 10;
        }

        for (let i = 0; i < interestsFav.length; i++) {
            interestsFav[i].value = (interestsFav[i].value / interestCount) * 10;
        }


        const recommendations = [];
        const allUsers = await UserDetail.find({}).exec();

        for (const currentUser of allUsers) {
            // if the user has not interacted with currentUser then...
            if (likedUsers.indexOf(currentUser.email) === -1) {
                const demo = await Demographic.findOne({ user: currentUser.email });
                const userScore = { email: currentUser.email, score: 0 };
                if (demo && currentUser.interests.length > 0) {
                    const ethnicityScore = demographicsFav.find((e) => {
                        return e.type === demo.ethnicity[0].type;
                    });

                    for (const interest of currentUser.interests) {
                        const interestScore = interestsFav.find((e) => {
                            return e.type === interest;
                        });

                        if (interestScore) {
                            userScore.score += interestScore.value;
                        }
                    }

                    if (ethnicityScore) {
                        userScore.score += ethnicityScore.value;
                    }

                    recommendations.push(userScore);
                }
            }
        }

        recommendations.sort((a, b) => {
            if (a.score < b.score) {
                return 1;
            } else if (a.score > b.score) {
                return -1;
            }
            return 0;
        });
        console.log(demographicsFav);
        res.send({ status: 'OK', msg: recommendations[0] });
    } else {
        res.send({ status: 'OK', msg: 'Please like more people to see your recommendations!' })
    }
});

app.get('/api/buddymatch/get/:buddyId', async (req, res) => {
    const buddy = req.params.buddyId;
    const matchExists = await BuddyMatch.find({ buddies: buddy, status: 0 }).exec();

    if (matchExists.length > 0) {
        const matches = [];
        for (const match of matchExists) {
            const sourceIndex = match.buddies.indexOf(buddy);
            const target = [...match.buddies];
            target.splice(sourceIndex, 1);
            matches.push(match);
        }
        res.send({ status: 'OK', msg: matches });
    } else {
        res.send({ status: 'Error', msg: [] });
    }
});

app.get('/api/match/get/:user', async (req, res) => {
    const user = req.params.user;
    const matchExists = await Match.find({ users: user, status: 0 }).exec();

    if (matchExists.length > 0) {
        const matches = [];
        for (const match of matchExists) {
            const sourceIndex = match.users.indexOf(user);
            const target = [...match.users];
            target.splice(sourceIndex, 1);

            const blockExists = await Block.find({ source: user, target: target[0] });
            if (blockExists.length === 0) {
                matches.push(match);
            }
        }
        res.send({ status: 'OK', msg: matches });
    } else {
        res.send({ status: 'Error', msg: [] });
    }
});

app.post('/api/message/send', async (req, res) => {
    const message = req.body.message;
    const sender = message.from;
    const receiver = message.to;
    const date = message.date;
    const content = message.content;
    const senderObject = await User.find({ email: sender }).exec();
    const receiverObject = await User.find({ email: receiver }).exec();

    console.log('a', message);

    if (message.match_id) {
        const updatedMatch = await Match.updateOne({ _id: message.match_id }, {
            status: 1
        });
    }

    if (senderObject.length === 1 && receiverObject.length === 1) {
        const newMessage = new Message({ from: sender, to: receiver, date: date, content: content });
        newMessage.save().then(() => {
            const receiverSocket = wsClients.find((e) => e.ref === receiver && e.type === 'messages');
            const receiverSocket2 = wsClients.find((e) => e.ref === receiver && e.type === 'message');

            const senderSocket = wsClients.find((e) => e.ref === sender && e.type === 'messages');
            const senderSocket2 = wsClients.find((e) => e.ref === sender && e.type === 'message');

            if (receiverSocket) {
                console.log('Sending all messages update to receiver!');
                receiverSocket.socket.send(1);
            }

            if (receiverSocket2) {
                console.log('Sending messages update to receiver!');
                receiverSocket2.socket.send(1);
            }

            if (senderSocket) {
                console.log('Sending all messages update to sender!');
                senderSocket.socket.send(1);
            }

            if (senderSocket2) {
                console.log('Sending messages update to sender!');
                senderSocket2.socket.send(1);
            }


            res.send({ status: 'OK', code: 0, msg: 'Message has been sent!' });
        })
    } else {
        res.send({ status: 'Error' });
    }
});

app.post('/api/buddy/message/send', async (req, res) => {
    const message = req.body.message;
    const sender = message.from;
    const senderBuddy = message.fromBuddy;
    const receiverBuddy = message.toBuddy;
    const date = message.date;
    const content = message.content;

    const senderObject = await Buddy.find({ _id: senderBuddy }).exec();
    const receiverObject = await Buddy.find({ _id: receiverBuddy }).exec();

    if (message.matchId) {
        const updatedMatch = await BuddyMatch.updateOne({ _id: message.matchId }, {
            status: 1
        });
    }

    if (senderObject.length === 1 && receiverObject.length === 1) {
        const newMessage = new BuddyMessage({ fromBuddy: senderBuddy, toBuddy: receiverBuddy, from: sender, date: date, content: content });

        const senders = await Buddy.findOne({ _id: senderBuddy }).exec();
        const receivers = await Buddy.findOne({ _id: receiverBuddy }).exec();
        console.log(senders);
        console.log(receivers);

        const msgPeople = (senders.users).concat(receivers.users);

        newMessage.save().then(() => {
            for (const person of msgPeople) {
                const socket = wsClients.find((e) => e.ref === person && e.type === 'messages');
                const socket2 = wsClients.find((e) => e.ref === person && e.type === 'message');
                if (socket) {
                    console.log('Sending messages update!');
                    socket.socket.send(1);
                }
                if (socket2) {
                    console.log('Sending messages update!');
                    socket2.socket.send(1);
                }
            }

            res.send({ status: 'OK', code: 0, msg: 'Message has been sent!' });
        })
    } else {
        res.send({ status: 'Error' });
    }
});

app.get('/api/message/get/:user1/:user2', async (req, res) => {
    const user1Object = await User.find({ email: req.params.user1 }).exec();
    const user2Object = await User.find({ email: req.params.user2 }).exec();

    if (user1Object.length === 1 && user2Object.length === 1) {
        const messages = await Message.find(
            {
                $or: [
                    {
                        $and: [
                            { to: user1Object[0].email },
                            { from: user2Object[0].email }
                        ]
                    },
                    {
                        $and: [
                            { from: user1Object[0].email },
                            { to: user2Object[0].email }
                        ]
                    }
                ]
            }).exec();
        res.send({ status: 'OK', msg: messages });
    } else {
        res.send({ status: 'Error' });
    }
});

app.get('/api/message/buddy/get/:buddy1/:buddy2', async (req, res) => {
    const buddy1Object = await Buddy.find({ _id: req.params.buddy1 }).exec();
    const buddy2Object = await Buddy.find({ _id: req.params.buddy2 }).exec();
    console.log(req.params)
    if (buddy1Object.length === 1 && buddy2Object.length === 1) {
        const messages = await BuddyMessage.find(
            {
                $or: [
                    {
                        $and: [
                            { toBuddy: req.params.buddy1 },
                            { fromBuddy: req.params.buddy2 }
                        ]
                    },
                    {
                        $and: [
                            { fromBuddy: req.params.buddy1 },
                            { toBuddy: req.params.buddy2 }
                        ]
                    }
                ]
            }).sort({ date: 1 }).exec();
        res.send({ status: 'OK', msg: messages });
    } else {
        res.send({ status: 'Error' });
    }
});

app.get('/api/message/get/:user', async (req, res) => {
    const userObject = await User.find({ email: req.params.user }).exec();
    const users = await User.find({}).exec();
    const isBlocked = await Block.find({ source: req.params.user }).exec();
    const blockedUsers = isBlocked.map((e) => {
        return e.target;
    });

    const messagesResponse = [];
    if (userObject.length === 1) {
        const messages = await Message.find(
            {
                $or: [
                    { to: userObject[0].email },
                    { from: userObject[0].email }
                ]
            }).exec();

        const messageSet = new Set();

        for (const message of messages) {
            if (!(blockedUsers.includes(message.from) || blockedUsers.includes(message.to))) {
                const convo = JSON.stringify({ conversation: [message.to, message.from].sort() })
                messageSet.add(convo);
            }
        }


        for (const element of messageSet) {
            const user1 = JSON.parse(element).conversation[0];
            const user2 = JSON.parse(element).conversation[1];
            const messages = await Message.find(
                {
                    $or: [
                        {
                            $and: [
                                { to: user1 },
                                { from: user2 }
                            ]
                        },
                        {
                            $and: [
                                { from: user1 },
                                { to: user2 }
                            ]
                        }
                    ]
                }).sort({ date: 1 }).exec();

            const temp = messages[messages.length - 1];
            messagesResponse.push({ content: temp, type: 'personal' });
        }

        if (userObject[0].buddyUpID) {
            const buddyMessages = await BuddyMessage.find(
                {
                    $or: [
                        { fromBuddy: userObject[0].buddyUpID },
                        { toBuddy: userObject[0].buddyUpID }
                    ]
                }).exec();

            const buddyMessageSet = new Set();

            for (const message of buddyMessages) {
                const convo = JSON.stringify({ conversation: [message.fromBuddy, message.toBuddy].sort() })
                buddyMessageSet.add(convo);
            }


            for (const element of buddyMessageSet) {
                const buddy1 = JSON.parse(element).conversation[0];
                const buddy2 = JSON.parse(element).conversation[1];
                const messages = await BuddyMessage.find(
                    {
                        $or: [
                            {
                                $and: [
                                    { toBuddy: buddy1 },
                                    { fromBuddy: buddy2 }
                                ]
                            },
                            {
                                $and: [
                                    { fromBuddy: buddy1 },
                                    { toBuddy: buddy2 }
                                ]
                            }
                        ]
                    }).sort({ date: 1 }).exec();

                const temp = messages[messages.length - 1];
                const matchPeople = (userObject[0].buddyUpID === buddy1 ? buddy2 : buddy1);
                const oppositeBuddy = await Buddy.findOne({ _id: matchPeople }).exec();
                const thisBuddy = await Buddy.findOne({ _id: userObject[0].buddyUpID }).exec();
                const users = [];
                for (const user of oppositeBuddy.users) {
                    const userDetails = await User.findOne({ email: user }).exec();
                    if (userDetails) {
                        users.push({
                            email: userDetails.email,
                            first_name: userDetails.first_name,
                            last_name: userDetails.last_name,
                            picture: userDetails.picture,

                        })
                    }
                }

                messagesResponse.push({ content: temp, type: 'buddy', buddyDetails: users, buddyId: matchPeople, source: userObject[0].buddyUpID, thisBuddy: thisBuddy.users });
            }
        }

        res.send({ status: 'OK', msg: messagesResponse.sort(compareDate) });
    }
});

const compareDate = (a, b) => {
    if (a.date < b.date) {
        return 1;
    }
    if (a.date > b.date) {
        return -1;
    }
    return 0;
}

const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);  // deg2rad below
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const deg2rad = (deg) => {
    return deg * (Math.PI / 180)
}

app.listen(3000);
