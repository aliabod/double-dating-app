const mongoose = require('mongoose'); // Module that handles database connection

mongoose.connect('mongodb://localhost:27017/dating-app3', {useNewUrlParser: true, useUnifiedTopology: true});

const Interaction = mongoose.model('Interaction', {
    sourceUser: String,
    targetUser: String,
    type: Number,
    date: String
});

for (let i = 0; i < 100; i++) {
    const interactions = new Set();
    const interactionCount = Math.floor(Math.random() * 75);
    for(let j = 0; j < interactionCount; j++) {
        let id = Math.floor(Math.random() * 3183);
        while(interactions.has(id)) {
            id = Math.floor(Math.random() * 3183);
        }
        interactions.add(id);
    }

    const interactionArray = Array.from(interactions);

    for(let j = 0; j < interactionArray.length; j++) {
        const sourceUser = i + '@' + i + '.com';
        const targetUser = interactionArray[j] + '@' + interactionArray[j] + '.com';
        const date = new Date().toISOString();

        const newInteraction = new Interaction({sourceUser: sourceUser, targetUser: targetUser, type: 1, date: date});

        newInteraction.save().then(() => {
            console.log('Interaction added')
        });
    }
}

let interactions = [{"email":"91@91.com","score":5.404788011695906},{"email":"22@22.com","score":5.189144736842104},{"email":"52@52.com","score":5.1123903508771935},{"email":"20@20.com","score":4.878472222222221},{"email":"44@44.com","score":4.81999269005848},{"email":"30@30.com","score":4.819992690058479},{"email":"97@97.com","score":4.761513157894736},{"email":"99@99.com","score":4.662828947368421},{"email":"40@40.com","score":4.644554093567251},{"email":"16@16.com","score":4.545869883040935},{"email":"96@96.com","score":4.527595029239766},{"email":"23@23.com","score":4.42891081871345},{"email":"81@81.com","score":4.410635964912281},{"email":"9@9.com","score":4.293676900584796},{"email":"46@46.com","score":4.19499269005848},{"email":"89@89.com","score":4.194992690058479},{"email":"82@82.com","score":4.136513157894736},{"email":"26@26.com","score":4.118238304093567},{"email":"1@1.com","score":4.019554093567251},{"email":"27@27.com","score":4.019554093567251},{"email":"74@74.com","score":4.001279239766082},{"email":"53@53.com","score":3.9802631578947367},{"email":"5@5.com","score":3.9610745614035086},{"email":"33@33.com","score":3.9610745614035086},{"email":"63@63.com","score":3.9427997076023393},{"email":"90@90.com","score":3.9427997076023393},{"email":"94@94.com","score":3.921783625730994},{"email":"24@24.com","score":3.863304093567251},{"email":"6@6.com","score":3.8441154970760234},{"email":"28@28.com","score":3.8441154970760234},{"email":"14@14.com","score":3.785635964912281},{"email":"92@92.com","score":3.767361111111111},{"email":"55@55.com","score":3.746345029239766},{"email":"95@95.com","score":3.727156432748538},{"email":"77@77.com","score":3.6504020467836256},{"email":"61@61.com","score":3.629385964912281},{"email":"2@2.com","score":3.6101973684210527},{"email":"51@51.com","score":3.6101973684210527},{"email":"83@83.com","score":3.5517178362573096},{"email":"62@62.com","score":3.5124269005847952},{"email":"76@76.com","score":3.493238304093567},{"email":"98@98.com","score":3.493238304093567},{"email":"56@56.com","score":3.4347587719298245},{"email":"13@13.com","score":3.416483918128655},{"email":"75@75.com","score":3.3954678362573096},{"email":"18@18.com","score":3.376279239766082},{"email":"4@4.com","score":3.336988304093567},{"email":"70@70.com","score":3.3360745614035086},{"email":"54@54.com","score":3.3177997076023393},{"email":"58@58.com","score":3.3177997076023393},{"email":"60@60.com","score":3.3177997076023393},{"email":"39@39.com","score":3.2995248538011697},{"email":"8@8.com","score":3.2593201754385963},{"email":"45@45.com","score":3.2593201754385963},{"email":"43@43.com","score":3.2191154970760234},{"email":"48@48.com","score":3.182565789473684},{"email":"69@69.com","score":3.182565789473684},{"email":"88@88.com","score":3.182565789473684},{"email":"10@10.com","score":3.1615497076023393},{"email":"80@80.com","score":3.1615497076023393},{"email":"38@38.com","score":3.1030701754385963},{"email":"57@57.com","score":3.083881578947368},{"email":"78@78.com","score":3.083881578947368},{"email":"0@0.com","score":3.0436769005847952},{"email":"test4@test4.com","score":3.0254020467836256},{"email":"11@11.com","score":3.0254020467836256},{"email":"15@15.com","score":3.0254020467836256},{"email":"42@42.com","score":2.986111111111111},{"email":"21@21.com","score":2.927631578947368},{"email":"34@34.com","score":2.927631578947368},{"email":"41@41.com","score":2.9267178362573096},{"email":"3@3.com","score":2.9084429824561404},{"email":"50@50.com","score":2.9084429824561404},{"email":"65@65.com","score":2.9084429824561404},{"email":"71@71.com","score":2.9084429824561404},{"email":"93@93.com","score":2.9084429824561404},{"email":"12@12.com","score":2.868238304093567},{"email":"67@67.com","score":2.849963450292398},{"email":"66@66.com","score":2.791483918128655},{"email":"64@64.com","score":2.773209064327485},{"email":"29@29.com","score":2.693713450292398},{"email":"68@68.com","score":2.693713450292398},{"email":"86@86.com","score":2.693713450292398},{"email":"72@72.com","score":2.6927997076023393},{"email":"19@19.com","score":2.635233918128655},{"email":"31@31.com","score":2.635233918128655},{"email":"79@79.com","score":2.635233918128655},{"email":"7@7.com","score":2.6343201754385963},{"email":"84@84.com","score":2.6343201754385963},{"email":"49@49.com","score":2.4990862573099415},{"email":"87@87.com","score":2.4597953216374266},{"email":"59@59.com","score":2.401315789473684},{"email":"73@73.com","score":2.4004020467836256},{"email":"32@32.com","score":2.341922514619883},{"email":"37@37.com","score":2.2834429824561404},{"email":"47@47.com","score":2.2834429824561404},{"email":"35@35.com","score":2.224963450292398},{"email":"36@36.com","score":2.1673976608187133},{"email":"17@17.com","score":1.8740862573099415},{"email":"85@85.com","score":1.8740862573099415},{"email":"25@25.com","score":1.6986476608187133}];
console.log(interactions.length)
