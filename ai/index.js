const {ClarifaiStub, grpc} = require("clarifai-nodejs-grpc");

const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
metadata.set("authorization", "Key d3aeb959af9d4d66a8cd2be6db2031c2");

const fs = require("fs");

stub.PostWorkflowResults(
    {
        workflow_id: "Demographics",
        inputs: [{data: {image: {base64: imageBytes}}}]
    },


    metadata,
    (err, response) => {
        if (response) {
            console.log(response.results[0].outputs[2].data.regions[0].data.concepts.map((e) => {
                return {type: e.name, value: e.value}
            }))
            console.log(response.results[0].outputs[3].data.regions[0].data.concepts.map((e) => {
                return {type: e.name, value: e.value}
            }))
            console.log(response.results[0].outputs[4].data.regions[0].data.concepts.map((e) => {
                return {type: e.name, value: e.value}
            }))
        } else {
            console.log(err)
        }
    });
