const passwordHash = require('password-hash');
const axios = require('axios');
const mongoose = require('mongoose'); // Module that handles database connection

let dataDictionary = [{
    "id": 1,
    "first_name": "Norene",
    "last_name": "Killelay",
    "about": "Horizontal client-driven product"
}, {
    "id": 2,
    "first_name": "Celisse",
    "last_name": "Minister",
    "about": "Team-oriented tertiary time-frame"
}, {
    "id": 3,
    "first_name": "Kirsti",
    "last_name": "Kells",
    "about": "Versatile systematic flexibility"
}, {
    "id": 4,
    "first_name": "Veronique",
    "last_name": "Pankhurst.",
    "about": "Configurable attitude-oriented migration"
}, {
    "id": 5,
    "first_name": "Tiler",
    "last_name": "Kanter",
    "about": "Cloned fault-tolerant conglomeration"
}, {
    "id": 6,
    "first_name": "Jerrie",
    "last_name": "Crop",
    "about": "Cross-platform dedicated concept"
}, {
    "id": 7,
    "first_name": "Meredithe",
    "last_name": "Zmitruk",
    "about": "Persevering responsive superstructure"
}, {
    "id": 8,
    "first_name": "Blakeley",
    "last_name": "Clemas",
    "about": "Diverse multi-state extranet"
}, {
    "id": 9,
    "first_name": "Lanny",
    "last_name": "Bohills",
    "about": "Optimized stable paradigm"
}, {
    "id": 10,
    "first_name": "Saloma",
    "last_name": "Enrico",
    "about": "Extended zero defect product"
}, {
    "id": 11,
    "first_name": "Forester",
    "last_name": "Bison",
    "about": "Digitized needs-based archive"
}, {
    "id": 12,
    "first_name": "Bridgette",
    "last_name": "Oddie",
    "about": "Future-proofed mobile frame"
}, {
    "id": 13,
    "first_name": "Kelcie",
    "last_name": "Aisthorpe",
    "about": "Digitized 6th generation methodology"
}, {
    "id": 14,
    "first_name": "Jedidiah",
    "last_name": "Keady",
    "about": "Focused tertiary projection"
}, {
    "id": 15,
    "first_name": "Annamaria",
    "last_name": "Oyley",
    "about": "Object-based disintermediate parallelism"
}, {
    "id": 16,
    "first_name": "Findlay",
    "last_name": "Nicholson",
    "about": "Programmable national superstructure"
}, {
    "id": 17,
    "first_name": "Tabitha",
    "last_name": "Gytesham",
    "about": "Optional human-resource model"
}, {
    "id": 18,
    "first_name": "Bobbee",
    "last_name": "Dunphie",
    "about": "Organic radical circuit"
}, {
    "id": 19,
    "first_name": "Godwin",
    "last_name": "Bercevelo",
    "about": "Inverse homogeneous knowledge base"
}, {
    "id": 20,
    "first_name": "Sal",
    "last_name": "Pepis",
    "about": "De-engineered attitude-oriented software"
}, {
    "id": 21,
    "first_name": "Skylar",
    "last_name": "Huckett",
    "about": "Assimilated bottom-line budgetary management"
}, {
    "id": 22,
    "first_name": "Richy",
    "last_name": "Kezar",
    "about": "Proactive uniform hardware"
}, {
    "id": 23,
    "first_name": "Petra",
    "last_name": "Swindles",
    "about": "Cross-group 3rd generation application"
}, {
    "id": 24,
    "first_name": "Ada",
    "last_name": "Leroy",
    "about": "Re-engineered fault-tolerant hierarchy"
}, {
    "id": 25,
    "first_name": "Ebba",
    "last_name": "Brisbane",
    "about": "Devolved bottom-line protocol"
}, {
    "id": 26,
    "first_name": "Malinde",
    "last_name": "Simonett",
    "about": "Robust exuding info-mediaries"
}, {
    "id": 27,
    "first_name": "Pansie",
    "last_name": "Copson",
    "about": "Multi-channelled dedicated knowledge base"
}, {
    "id": 28,
    "first_name": "Theresina",
    "last_name": "Elgram",
    "about": "Cloned disintermediate function"
}, {
    "id": 29,
    "first_name": "Theodore",
    "last_name": "Sheerman",
    "about": "Future-proofed composite moratorium"
}, {
    "id": 30,
    "first_name": "Annetta",
    "last_name": "Dunning",
    "about": "Multi-channelled systemic project"
}, {
    "id": 31,
    "first_name": "Bunny",
    "last_name": "Lefeuvre",
    "about": "Exclusive high-level hub"
}, {
    "id": 32,
    "first_name": "Lalo",
    "last_name": "Gaunter",
    "about": "Pre-emptive mobile migration"
}, {
    "id": 33,
    "first_name": "Estell",
    "last_name": "Brosch",
    "about": "Fully-configurable next generation protocol"
}, {
    "id": 34,
    "first_name": "Jade",
    "last_name": "Dishman",
    "about": "Cloned optimal extranet"
}, {
    "id": 35,
    "first_name": "Ky",
    "last_name": "Oolahan",
    "about": "Progressive client-server productivity"
}, {
    "id": 36,
    "first_name": "Annalee",
    "last_name": "Pirdy",
    "about": "Managed exuding system engine"
}, {
    "id": 37,
    "first_name": "Isobel",
    "last_name": "Musker",
    "about": "Intuitive reciprocal service-desk"
}, {
    "id": 38,
    "first_name": "Brittan",
    "last_name": "Goghin",
    "about": "Mandatory intermediate internet solution"
}, {
    "id": 39,
    "first_name": "Callie",
    "last_name": "O' Sullivan",
    "about": "Customizable bifurcated migration"
}, {
    "id": 40,
    "first_name": "Perkin",
    "last_name": "McAne",
    "about": "Visionary multimedia benchmark"
}, {
    "id": 41,
    "first_name": "Marrilee",
    "last_name": "Reicherz",
    "about": "Exclusive value-added capability"
}, {
    "id": 42,
    "first_name": "Winnifred",
    "last_name": "Aspinal",
    "about": "Distributed multi-tasking Graphic Interface"
}, {
    "id": 43,
    "first_name": "Jodee",
    "last_name": "Haward",
    "about": "Upgradable value-added methodology"
}, {
    "id": 44,
    "first_name": "Giff",
    "last_name": "Zeale",
    "about": "Business-focused bi-directional encryption"
}, {
    "id": 45,
    "first_name": "Jon",
    "last_name": "Elijahu",
    "about": "Exclusive homogeneous moratorium"
}, {
    "id": 46,
    "first_name": "Nomi",
    "last_name": "Romayne",
    "about": "Public-key background project"
}, {
    "id": 47,
    "first_name": "Ulysses",
    "last_name": "Charrier",
    "about": "Optimized intermediate strategy"
}, {
    "id": 48,
    "first_name": "Aldin",
    "last_name": "Surgood",
    "about": "Implemented clear-thinking time-frame"
}, {
    "id": 49,
    "first_name": "Jean",
    "last_name": "Geri",
    "about": "Robust intangible knowledge base"
}, {
    "id": 50,
    "first_name": "Jackie",
    "last_name": "Ambrozik",
    "about": "Networked impactful hardware"
}, {
    "id": 51,
    "first_name": "Danell",
    "last_name": "Clarycott",
    "about": "Expanded attitude-oriented database"
}, {
    "id": 52,
    "first_name": "Rozella",
    "last_name": "Berrecloth",
    "about": "Diverse optimizing data-warehouse"
}, {
    "id": 53,
    "first_name": "Sharyl",
    "last_name": "Hender",
    "about": "Integrated bottom-line implementation"
}, {
    "id": 54,
    "first_name": "Agustin",
    "last_name": "Rheubottom",
    "about": "Synergistic heuristic data-warehouse"
}, {
    "id": 55,
    "first_name": "Liesa",
    "last_name": "Richarson",
    "about": "Synergistic 4th generation budgetary management"
}, {
    "id": 56,
    "first_name": "Maryrose",
    "last_name": "Filippov",
    "about": "Synergistic system-worthy paradigm"
}, {
    "id": 57,
    "first_name": "Roldan",
    "last_name": "Rusted",
    "about": "Decentralized intangible orchestration"
}, {
    "id": 58,
    "first_name": "Lizette",
    "last_name": "Benian",
    "about": "Stand-alone solution-oriented service-desk"
}, {
    "id": 59,
    "first_name": "Joanne",
    "last_name": "Graeme",
    "about": "Universal real-time project"
}, {
    "id": 60,
    "first_name": "Claribel",
    "last_name": "Rackam",
    "about": "Customer-focused solution-oriented extranet"
}, {
    "id": 61,
    "first_name": "Legra",
    "last_name": "Szepe",
    "about": "Multi-tiered asynchronous methodology"
}, {
    "id": 62,
    "first_name": "Malory",
    "last_name": "Tripett",
    "about": "Cross-platform directional matrix"
}, {
    "id": 63,
    "first_name": "Cassandra",
    "last_name": "Coopland",
    "about": "Distributed value-added project"
}, {
    "id": 64,
    "first_name": "Nettle",
    "last_name": "Exroll",
    "about": "Enterprise-wide motivating knowledge base"
}, {
    "id": 65,
    "first_name": "Missie",
    "last_name": "Renac",
    "about": "Advanced intermediate portal"
}, {
    "id": 66,
    "first_name": "Lurline",
    "last_name": "Lamming",
    "about": "Front-line executive customer loyalty"
}, {
    "id": 67,
    "first_name": "Johnath",
    "last_name": "Rennenbach",
    "about": "Sharable exuding functionalities"
}, {
    "id": 68,
    "first_name": "Raff",
    "last_name": "Holley",
    "about": "Up-sized radical algorithm"
}, {
    "id": 69,
    "first_name": "Queenie",
    "last_name": "Sarver",
    "about": "Customer-focused intermediate structure"
}, {
    "id": 70,
    "first_name": "Esma",
    "last_name": "Ullett",
    "about": "Persistent interactive functionalities"
}, {
    "id": 71,
    "first_name": "Edna",
    "last_name": "Joderli",
    "about": "Exclusive bi-directional initiative"
}, {
    "id": 72,
    "first_name": "Averil",
    "last_name": "Harbage",
    "about": "Persevering cohesive encoding"
}, {
    "id": 73,
    "first_name": "Binni",
    "last_name": "Craven",
    "about": "Enhanced systemic migration"
}, {
    "id": 74,
    "first_name": "Ilario",
    "last_name": "Aicken",
    "about": "Open-source grid-enabled database"
}, {
    "id": 75,
    "first_name": "Cleopatra",
    "last_name": "Flowitt",
    "about": "Robust transitional circuit"
}, {
    "id": 76,
    "first_name": "Henryetta",
    "last_name": "Creenan",
    "about": "Persistent well-modulated workforce"
}, {
    "id": 77,
    "first_name": "Corrianne",
    "last_name": "Attenbarrow",
    "about": "Decentralized optimizing projection"
}, {
    "id": 78,
    "first_name": "Carolus",
    "last_name": "Gleed",
    "about": "Stand-alone global support"
}, {
    "id": 79,
    "first_name": "Frank",
    "last_name": "Skarin",
    "about": "Front-line holistic focus group"
}, {
    "id": 80,
    "first_name": "Jourdain",
    "last_name": "Mauditt",
    "about": "Down-sized mobile data-warehouse"
}, {
    "id": 81,
    "first_name": "Jeremiah",
    "last_name": "Latan",
    "about": "Advanced cohesive standardization"
}, {
    "id": 82,
    "first_name": "Giovanna",
    "last_name": "Fratson",
    "about": "Re-contextualized national knowledge base"
}, {
    "id": 83,
    "first_name": "Rodney",
    "last_name": "Boler",
    "about": "Fully-configurable local structure"
}, {
    "id": 84,
    "first_name": "Tailor",
    "last_name": "O'Scollee",
    "about": "Future-proofed bifurcated superstructure"
}, {
    "id": 85,
    "first_name": "Jacinda",
    "last_name": "Verick",
    "about": "Implemented non-volatile emulation"
}, {
    "id": 86,
    "first_name": "Maye",
    "last_name": "Cash",
    "about": "Cloned background throughput"
}, {
    "id": 87,
    "first_name": "Eal",
    "last_name": "Parkey",
    "about": "Universal incremental function"
}, {
    "id": 88,
    "first_name": "Danyette",
    "last_name": "Vossgen",
    "about": "Public-key actuating function"
}, {
    "id": 89,
    "first_name": "Emmi",
    "last_name": "Bowler",
    "about": "Down-sized radical project"
}, {
    "id": 90,
    "first_name": "Tiphanie",
    "last_name": "Peetermann",
    "about": "Enterprise-wide bandwidth-monitored support"
}, {
    "id": 91,
    "first_name": "Davy",
    "last_name": "Keri",
    "about": "Right-sized dedicated model"
}, {
    "id": 92,
    "first_name": "Toni",
    "last_name": "Showen",
    "about": "Decentralized eco-centric analyzer"
}, {
    "id": 93,
    "first_name": "Atalanta",
    "last_name": "de Clerc",
    "about": "Monitored clear-thinking hub"
}, {
    "id": 94,
    "first_name": "Joli",
    "last_name": "Springell",
    "about": "Open-architected background implementation"
}, {
    "id": 95,
    "first_name": "Jeanna",
    "last_name": "Corwin",
    "about": "Customizable grid-enabled model"
}, {
    "id": 96,
    "first_name": "Broddie",
    "last_name": "Coviello",
    "about": "Open-source client-server info-mediaries"
}, {
    "id": 97,
    "first_name": "Marvin",
    "last_name": "Van Geffen",
    "about": "Advanced regional protocol"
}, {
    "id": 98,
    "first_name": "Kacie",
    "last_name": "Siflet",
    "about": "Adaptive systemic leverage"
}, {
    "id": 99,
    "first_name": "Ernie",
    "last_name": "Cattermole",
    "about": "Automated bi-directional adapter"
}, {
    "id": 100,
    "first_name": "Maighdiln",
    "last_name": "De Mattei",
    "about": "Grass-roots upward-trending contingency"
}]

let dataInterests = [
    {
        "title": "3D printing",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Acrobatics",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Acting",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Amateur radio",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Animation",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Aquascaping",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Astrology",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Astronomy",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Baking",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Baton twirling",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Blogging",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Building",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Board/tabletop games",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Book discussion clubs",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Book restoration",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Bowling",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Brazilian jiu-jitsu",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Breadmaking",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Bullet journaling",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Cabaret",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Calligraphy",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Candle making",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Candy making",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Car fixing & building",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Card games",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Cheesemaking",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Cleaning",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Clothesmaking",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Coffee roasting",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Collecting",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Coloring",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Computer programming",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Confectionery",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Cooking",
        "category": "General",
        "subCategory": "Indoors"
    },
    {
        "title": "Cosplaying",
        "category": "General",
        "subCategory": "Indoors"
    },
]

mongoose.connect('mongodb://localhost:27017/dating-app3', {useNewUrlParser: true, useUnifiedTopology: true});
const User = mongoose.model('User', {
    first_name: String,
    last_name: String,
    email: String,
    password: String,
    picture: String,
    disabled: false
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
// const Message = mongoose.model('Message', {from: String, to: String, content: String, date: Number});
// const Interaction = mongoose.model('Interaction', {
//     sourceUser: String,
//     targetUser: String,
//     type: Number,
//     date: String
// });
// const Match = mongoose.model('Match', {
//     users: Array,
//     status: Number
// });
// const Block = mongoose.model('Block', {
//     source: String,
//     target: String
// });
const Demographic = mongoose.model('Demographic', {
    age: Array,
    gender: String,
    ethnicity: Array,
    user: String
});

//      email: String,
//     gender: String,
//     interest: Array,
//     dob: String,
//     about: String,
//     location: String,
//     interests: Array,
//     lat: String,
//     lon: String

const UserTable = [];
const UserDetailTable = [];
const DemographicTable = [];

async function generate() {
    for (let i = 0; i < 100; i++) {
        const demos = ['White', 'East Asian', 'Southeast Asian', 'Latino_Hispanic', 'Black'];
        const postcodeData = await axios.get('https://www.doogal.co.uk/CreateRandomPostcode.ashx');
        const pst = postcodeData.data.split(',');
        const email = i + '@' + i + '.com';
        const first_name = dataDictionary[Math.floor(Math.random() * 100)].first_name;
        const last_name = dataDictionary[Math.floor(Math.random() * 100)].last_name;
        const disabled = false;
        const password = passwordHash.generate(email);
        const picture = 'https://picsum.photos/600/600/?test=' + i;
        const gender = (Math.round(Math.random()) === 1 ? 'female' : 'male');
        const interest = (Math.round(Math.random()) === 1 ? 'female' : 'male');
        const dob = new Date(Math.floor(Math.random() * 2554415981582) - 1505387700573).toISOString();
        const about = dataDictionary[Math.floor(Math.random() * 100)].about;
        const location = pst[0];
        const lat = pst[1];
        const lon = pst[2];
        const vals = [];
        vals.push(100 - Math.floor(Math.random() * 100));
        vals.push(Math.floor(Math.random() * (100 - vals[0])));
        vals.push(100 - vals[0] - vals[1]);
        vals.sort(function (a, b) {
            return b - a
        });
        const demo1 = {type: demos.splice(Math.floor(Math.random() * demos.length), 1)[0], value: vals[0]}
        const demo2 = {type: demos.splice(Math.floor(Math.random() * demos.length), 1)[0], value: vals[1]}
        const demo3 = {type: demos.splice(Math.floor(Math.random() * demos.length), 1)[0], value: vals[2]}
        const demoAge = [];
        const demoGender = '';
        const interests = [];
        for (let i = 0; i < Math.ceil(Math.random() * 5); i++) {
            let interest = dataInterests[Math.floor(Math.random() * dataInterests.length)].title;
            while(interests.indexOf(interest) !== -1) {
                interest = dataInterests[Math.floor(Math.random() * dataInterests.length)].title;
            }
            interests.push(interest);
        }
        console.log(email, first_name, last_name, password, picture, gender, interest, dob, about, location, lat, lon, demo1, demo2, demo3, interests);
        const newUser = new User({
            first_name: first_name,
            last_name: last_name,
            email: email,
            password: password,
            picture: picture,
            disabled: false
        })

        const newUserDetail = new UserDetail({
            email: email,
            gender: gender,
            interest: interest,
            dob: dob,
            about: about,
            location: location,
            interests: interests,
            lat: lat,
            lon: lon
        })

        const newDemographic = new Demographic({
            age: demoAge,
            gender: demoGender,
            ethnicity: [demo1, demo2, demo3],
            user: email
        })

        newUser.save().then(console.log('User created'));
        newUserDetail.save().then(console.log('Detail created'));
        newDemographic.save().then(console.log('Demo created'));


        // UserTable.push(newUser);
        // UserDetailTable.push(newUserDetail);
        // DemographicTable.push(newDemographic)
    }
}


generate();



// down -1505387700573
// up 1049028281009
// total 2554415981582
