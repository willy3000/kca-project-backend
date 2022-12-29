const express = require("express");
const { id } = require("monk");
const router = express.Router();
const { v1: uuidv1, v4: uuidv4 } = require("uuid");
const db = require('monk')('mongodb://localhost:27017/kca')
// const {Server} = require('socket.io')


// const io = new Server({
//   cors: {
//     origin: '*',
//     methods: ["GET", "POST"]
//   }
// })


const projectData = db.get('projects')

const eventData = db.get('events')

const authModuleVariables = require("./auth");

const supervisorAccounts = authModuleVariables.supervisorAccounts;

const projects = [  

];


const events = []

//Add Project #mongodb
router.post("/addProject", (req, res) => {
  const projectDetails = {
    id: uuidv4(),
    userId: req.body.userId,
    studentName: req.body.studentName,
    email: req.body.email,
    name: req.body.name,
    description: req.body.description,
    projectType: req.body.projectType,
    technology: req.body.technology,
    supervisor: req.body.supervisor,
    documents: {
      proposal: {
        documentName: null,
        documentUrl: null,
        status: "pending submission",
        remarks: []
      },
      srs: {
        documentName: null,
        documentUrl: null,
        status: "pending submission",
        remarks: []
      },
      sds: {
        documentName: null,
        documentUrl: null,
        status: "pending submission",
        remarks: []
      },
      final: {
        documentName: null,
        documentUrl: null,
        status: "pending submission",
        remarks: []
      },
    },
  };

  projectData.insert({...projectDetails}).then((doc) => {
    res.json({ success: true, message: "Project added successfully" });
    db.close()
  }).catch((err) => {
    res.json({ success: false, message: "Project not added" });
  })
});


//web socket implementation for supervisor projects
// io.on('connection', (socket) => {
//   socket.on('id', (id) => {
//   console.log(id)
//   setInterval(() => {
//     console.log('connecetd')
//       projectData.find({"supervisor.id": id}).then((doc) => {
//         console.log(doc)
//         socket.emit('projects', [...doc])
//       })
//       })
//   }, 30000)

//     })


//Get projects #mongodb
router.get("/getProjects/:id", (req, res) => {
  const userId = req.params.id

  projectData.find({userId: userId}).then((doc) => {
    res.json({
      success: true,
      message: "Project added successfully",
      projects: [...doc],
    })
    db.close()
  }).catch((err) => {
    res.json({
      success: false,
      message: "Project not fetched"
    });
  })


});

//Get project #mongodb
router.get("/getProject/:id", (req, res) => {
  const projectId = req.params.id;

  projectData.find({id: projectId}).then((doc) => {
    res.json({
      success: true,
      message: "Project fetched",
      project: [doc[0]],
    })
  }).catch((err) => {
    res.json({
      success: false,
      message: "Project not fetched",
      project: {},
    })
  })

});

//Get projects by supervisor #mongodb
router.get("/getProjectsBySupervisor/:id", (req, res) => {
  const userId = req.params.id;

  projectData.find({"supervisor.id": userId}).then((doc) => {
    res.json({
      success: true,
      message: "Project added successfully",
      projects: [...doc],
    })
  }).catch((err) => {
    res.json({
      success: false,
      message: "Projects not found",
      projects: [],
    })
  })


});

//upload file #mongodb
router.post("/uploadDocumentUrl/:id", (req, res) => {
  const fileType = req.body.fileType;
  const projectId = req.params.id
  const docUrl = req.body.documentUrl
  const fileName = req.body.fileName

  projectData.find({id: projectId}).then((doc) => {
    const project = doc[0]
    const projectDocs = project.documents
    const docTypeFields = projectDocs[fileType]
    projectData.update({id: projectId}, { $set: {documents: {...projectDocs, [fileType]: {...docTypeFields, documentUrl: docUrl, documentName: fileName, status: 'pending approval'} }}}).then((doc) => {
      res.json(doc[0])
    })
  })



});


//Approve document #mongodb
router.post('/approveDocument/:id', (req, res) => {
  const fileType = req.body.fileType;
  const projectId = req.params.id


  projectData.find({id: projectId}).then((doc) => {
    const project = doc[0]
    const projectDocs = project.documents
    const docTypeFields = projectDocs[fileType]
    projectData.update({id: projectId}, { $set: {documents: {...projectDocs, [fileType]: {...docTypeFields, status: 'approved'} }}}).then((doc) => {
      res.json(doc[0])
    })
  })
})


//Deny document #mongodb
router.post('/denyDocument/:id', (req, res) => {
  const fileType = req.body.fileType;
  const projectId = req.params.id

  projectData.find({id: projectId}).then((doc) => {
    const project = doc[0]
    const projectDocs = project.documents
    const docTypeFields = projectDocs[fileType]
    projectData.update({id: projectId}, { $set: {documents: {...projectDocs, [fileType]: {...docTypeFields, status: 'denied'} }}}).then((doc) => {
      res.json(doc[0])
    })
  })
})



//Add Remark #mongodb
router.post('/addRemark/:id', (req, res) => {
  const fileType = req.body.docType;
  const remark = req.body.remark;
  const projectId = req.params.id

  projectData.find({id: projectId}).then((doc) => {
    const project = doc[0]
    const projectDocs = project.documents
    const docTypeFields = projectDocs[fileType]
    const remarks = docTypeFields.remarks
    const newRemarks = [...remarks, remark]
    projectData.update({id: projectId}, { $set: {documents: {...projectDocs, [fileType]: {...docTypeFields, remarks: [...newRemarks]} }}}).then((doc) => {
      res.json(doc[0])
    })

  })
})


//Get Remarks #mongodb
router.get('/getRemarks/:id/:docType', (req, res) => {
  const fileType = req.params.docType;

  projectData.find({id: req.params.id}).then((doc) => {
    const remarks = doc[0].documents[fileType].remarks
    res.json({success: true, remarks: [...remarks]})
  })

  remarks = []


})


//Add Events #mongodb
router.post("/addEvent", (req, res) => {
  const eventDetails = {
    id: uuidv4(),
    supervisorId: req.body.supervisorId,
    title: req.body.title,
    date: req.body.date,
    time: req.body.time,
    supervisorName: req.body.supervisorName
  };

  eventData.insert({...eventDetails}).then(() => {
    res.json({ success: true, message: "Event added successfully" });
    db.close()
  }).catch((err) => {
    res.json({ success: false, message: "Event not added" });
  })

});



//Get supervisor events #mongodb
router.get("/getSupervisorEvents/:id", (req, res) => {
  const supervisorId = req.params.id;

  eventData.find({supervisorId: supervisorId}).then((doc) => {
    res.json({
      success: true,
      message: "Project added successfully",
      events: [...doc],
    })
  }).catch((err) => {
    res.json({
      success: false,
      message: "Projects not found",
      events: [],
    })
  })

});


//Get student events #mongodb
router.get("/getStudentEvents/:id", (req, res) => {
  const userId = req.params.id;
  const supervisorIds = []
  const projects = []
  let studentEvents = []

  projectData.find({userId: userId}).then((doc) => {
    const projects = [...doc]
    projects.map((project) => {
      supervisorIds.push(project.supervisor.id)
    })
  
    const newSupervisorIds = Array.from(new Set(supervisorIds))

    eventData.find({}).then((doc) => {
      const events = doc
      events.map((event) => {
        if(newSupervisorIds.includes(event.supervisorId)){
          studentEvents.push(event)
        }
      })
      res.json({success: true, message: 'success', events: studentEvents})
    }).catch((err) => {
      res.json({success: false, message: 'failed', events: studentEvents})
    })

  })
})


//terminate project
router.get("/terminateProject/:id", (req, res) => {
  const projectId = req.params.id;

  projectData.findOneAndDelete({id: projectId}).then((doc) => {
    console.log(doc)
    res.json(doc)
  })

})


// io.listen(5001)

    
module.exports = router;
